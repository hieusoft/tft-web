import os
import sys
import io
import json
import time
from concurrent.futures import ThreadPoolExecutor

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import boto3
from dotenv import load_dotenv

from augment import vn_to_slug

def get_ext_from_url(url: str) -> str:
    ext = url.split(".")[-1].split("?")[0].lower()
    return ext if ext in {"png", "jpg", "jpeg", "webp"} else "png"

load_dotenv()

URL = "https://www.metatft.com/traits"
R2_FOLDER = "traits"

s3 = boto3.client(
    "s3",
    endpoint_url=os.environ.get("R2_ENDPOINT"),
    aws_access_key_id=os.environ.get("R2_ACCESS_KEY"),
    aws_secret_access_key=os.environ.get("R2_SECRET_KEY"),
    region_name="auto",
)
BUCKET_NAME = os.environ.get("R2_BUCKET_NAME")

session = requests.Session()
retries = Retry(total=5, backoff_factor=0.5, status_forcelist=[500, 502, 503, 504])
session.mount('https://', HTTPAdapter(max_retries=retries))

def r2_delete_folder(prefix: str):
    paginator = s3.get_paginator('list_objects_v2')
    pages = paginator.paginate(Bucket=BUCKET_NAME, Prefix=prefix)
    
    delete_us = dict(Objects=[])
    for item in pages.search('Contents'):
        if item:
            delete_us['Objects'].append({'Key': item['Key']})
            if len(delete_us['Objects']) >= 1000:
                s3.delete_objects(Bucket=BUCKET_NAME, Delete=delete_us)
                delete_us = dict(Objects=[])
    
    if len(delete_us['Objects']):
        s3.delete_objects(Bucket=BUCKET_NAME, Delete=delete_us)

def r2_put(content: bytes, key: str, content_type: str = "") -> str:
    if not content_type:
        content_type = "image/png" if key.endswith(".png") else "image/svg+xml"
        
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=content,
        ContentType=content_type,
    )
    public_url = os.environ.get("R2_PUBLIC_URL", "").rstrip("/")
    if public_url:
        return f"{public_url}/{key}"
    return f"s3://{BUCKET_NAME}/{key}"

def download_and_upload_image(slug: str, image_url: str) -> str:
    if not image_url:
        return ""
    
    ext = get_ext_from_url(image_url) or "png"
    r2_key = f"{R2_FOLDER}/{slug}.{ext}"
    
    try:
        res = session.get(image_url, timeout=10)
        if res.status_code == 200:
            return r2_put(res.content, r2_key, ext)
    except Exception:
        pass
    return image_url

def setup_driver():
    opts = Options()
    opts.add_argument("--headless")
    opts.add_argument("--window-size=1920,1080")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--lang=vi")
    opts.add_experimental_option("prefs", {"intl.accept_languages": "vi,vi-VN"})
    return webdriver.Chrome(options=opts)

_JS_GET_FIBER_DATA = r"""
function getFiberProps(el) {
    const rk = Object.keys(el).find(k => k.startsWith('__reactFiber'));
    if (!rk) return null;
    let fiber = el[rk];
    const results = [];
    let d = 0;
    while (fiber && d < 10) {
        if (fiber.memoizedProps) results.push(fiber.memoizedProps);
        fiber = fiber.return;
        d++;
    }
    return results;
}

let allTraits = [];
const rows = document.querySelectorAll('tr[role="row"]');
for (const row of rows) {
    const props = getFiberProps(row);
    if (!props) continue;
    let found = false;
    for (const p of props) {
        if (p.data && Array.isArray(p.data) && p.data.length > 0 && p.data[0].trait_details) {
            allTraits = p.data;
            found = true;
            break;
        }
    }
    if (found) break;
}

const domTraits = [...document.querySelectorAll('tr[role="row"]')].map(row => {
    const img = row.querySelector('.TraitIcon');
    const nameEl = row.querySelector('.StatLink');
    if (!img || !nameEl) return null;
    return {
        name: nameEl.textContent.trim(),
        image_url: img.src
    };
}).filter(r => r);

allTraits.forEach(trait => {
    if (trait.trait_details && trait.trait_details.trait_name) {
        const domMatch = domTraits.find(d => d.name === trait.trait_details.trait_name);
        if (domMatch) {
            trait.image_url = domMatch.image_url;
        }
    }
});

const cache = new Set();
return JSON.stringify(allTraits, (key, value) => {
    if (typeof value === 'object' && value !== null) {
        if (value instanceof Node) return undefined;
        if (cache.has(value)) return;
        cache.add(value);
    }
    return value;
});
"""

def clean_description(desc: str) -> str:
    if not desc: return ""
    import re
    desc = re.sub(r'<[^>]+>', ' ', desc)
    desc = re.sub(r'\s+', ' ', desc).strip()
    return desc

def process_trait(t: dict) -> dict | None:
    try:
        details = t.get("trait_details", {})
        name = details.get("trait_name", "").strip()
        if not name:
            return None
            
        slug = vn_to_slug(name)
        
        tier = t.get("tier", {}).get("letter", "")
        avg_place = str(round(t.get("avg_place", 0), 2)) if t.get("avg_place") else ""
        top4 = str(round(t.get("top_4", 0) * 100, 1)) + "%" if t.get("top_4") else ""
        
        freq = t.get("frequency", {})
        pick_count = str(freq.get("count", ""))
        pick_percent = str(round(freq.get("percent", 0) * 100, 1)) + "%" if freq.get("percent") else ""
        
        image_url = t.get("image_url", "")
        description = clean_description(details.get("description", ""))
        
        milestones = []
        for mt in details.get("traits", []):
            milestones.append({
                "level": mt.get("trait_num", ""),
                "min": mt.get("minUnits", ""),
                "max": mt.get("maxUnits", ""),
                "style": mt.get("style", ""),
            })
            
        return {
            "name": name,
            "slug": slug,
            "tier": tier,
            "placement": avg_place,
            "top4": top4,
            "pick_count": pick_count,
            "pick_percent": pick_percent,
            "description": description,
            "milestones": milestones,
            "image_url": image_url,
        }
    except Exception:
        return None

def main():
    start = time.time()
    
    r2_delete_folder(R2_FOLDER)
    driver = setup_driver()
    try:
        driver.get(URL)
        w = WebDriverWait(driver, 15)
        
        btn = w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Tổng Quan') or contains(text(),'Overview')]")
        ))
        driver.execute_script("arguments[0].click();", btn)
        w.until(EC.presence_of_element_located((By.CSS_SELECTOR, "tr[role='row']")))
        time.sleep(2)
        
        raw_json = driver.execute_script(_JS_GET_FIBER_DATA)
        raw_data = json.loads(raw_json)
        
    finally:
        driver.quit()

    if not raw_data:
        return

    processed_traits = []
    for t in raw_data:
        pt = process_trait(t)
        if pt:
            processed_traits.append(pt)

    def _upload_for_trait(pt):
        pt["image"] = download_and_upload_image(pt["slug"], pt.pop("image_url", ""))
        return pt

    final_traits = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        for res in executor.map(_upload_for_trait, processed_traits):
            final_traits.append(res)

    out_file = os.path.join(os.path.dirname(__file__), "traits.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(final_traits, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    main()