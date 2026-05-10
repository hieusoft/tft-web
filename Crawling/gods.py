import sys, io, re, html, time, json, unicodedata, os, mimetypes
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
import boto3
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

load_dotenv()
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_OUT = os.path.join(_DIR, "gods.json")
AUGMENTS_PATH = os.path.join(_DIR, "augments.json")

URL = "https://www.metatft.com/god-tiers"
R2_FOLDER = "gods"

R2_ACCESS_KEY  = os.getenv("R2_ACCESS_KEY")
R2_SECRET_KEY  = os.getenv("R2_SECRET_KEY")
R2_ENDPOINT    = os.getenv("R2_ENDPOINT")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
R2_PUBLIC_URL  = os.getenv("R2_PUBLIC_URL")

s3 = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    region_name="auto",
)

http = requests.Session()
http.headers.update({"User-Agent": "Mozilla/5.0"})

def setup_driver():
    opts = Options()
    for arg in ["--headless", "--no-sandbox", "--disable-dev-shm-usage", "--window-size=1920,1080", "--lang=vi"]:
        opts.add_argument(arg)
    opts.add_experimental_option("prefs", {"intl.accept_languages": "vi,vi-VN"})
    opts.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    return webdriver.Chrome(options=opts)

def clean(text: str) -> str:
    return re.sub(r'\s+', ' ', html.unescape(text or "")).strip()

def slugify(text: str) -> str:
    text = text.lower()
    text = text.replace('đ', 'd').replace('Đ', 'd')
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def get_ext_from_url(url: str) -> str:
    ext = url.split(".")[-1].split("?")[0].lower()
    return ext if ext in {"png", "jpg", "jpeg", "webp", "svg"} else "png"

def r2_delete_folder(folder: str):
    try:
        all_keys = []
        paginator = s3.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=R2_BUCKET_NAME, Prefix=f"{folder}/"):
            all_keys.extend(obj["Key"] for obj in page.get("Contents", []))
        if not all_keys: return
        batches = [all_keys[i:i+1000] for i in range(0, len(all_keys), 1000)]
        def delete_batch(keys):
            s3.delete_objects(Bucket=R2_BUCKET_NAME, Delete={"Objects": [{"Key": k} for k in keys]})
        with ThreadPoolExecutor(max_workers=5) as ex:
            list(ex.map(delete_batch, batches))
    except: pass

def r2_put(data: bytes, r2_key: str, ext: str) -> str:
    mime_type = mimetypes.types_map.get(f".{ext}", "image/png")
    s3.put_object(Bucket=R2_BUCKET_NAME, Key=r2_key, Body=data, ContentType=mime_type)
    return f"{R2_PUBLIC_URL}/{r2_key}"

_JS_SCRAPE_ALL = """
const done = arguments[arguments.length - 1];
const items = [...document.querySelectorAll(".GodTierItem")];
const results = [];
const seen = new Set();

function getFiberProps(el) {
    const rk = Object.keys(el).find(k => k.startsWith('__reactFiber'));
    if (!rk) return null;
    let fiber = el[rk];
    const res = [];
    let d = 0;
    while (fiber && d < 10) {
        if (fiber.memoizedProps) res.push(fiber.memoizedProps);
        fiber = fiber.return;
        d++;
    }
    return res;
}

function processItem(i) {
    if(i >= items.length) {
        done(results);
        return;
    }
    const item = items[i];
    
    const props = getFiberProps(item);
    let godData = null;
    if (props) {
        for (const p of props) {
            if (p.god && p.god.apiName) { godData = p.god; break; }
            if (p.data && p.data.apiName) { godData = p.data; break; }
            for (const k in p) {
                if (p[k] && p[k].apiName && p[k].benefits) { godData = p[k]; break; }
            }
            if (godData) break;
        }
    }
    
    const texts = item.innerText.trim().split("\\n");
    const name = godData && godData.name ? godData.name : (texts[0] ? texts[0].trim() : "");
    const trait = godData && godData.title ? godData.title : (texts.length > 1 ? texts[1].trim() : "");
    
    if(!name || seen.has(name)) {
        processItem(i + 1);
        return;
    }
    seen.add(name);
    
    const imgEl = item.querySelector(".GodTierImage, img");
    const img = imgEl ? imgEl.src : "";
    
    const row = item.closest("[class*='TierListRow']");
    const rank = row ? (row.querySelector(".TierListTierTitle")?.textContent.trim() || "?") : "?";
    
    if(imgEl) {
        imgEl.scrollIntoView({block: 'center'});
        imgEl.click();
    }
    
    setTimeout(() => {
        const boonEl = document.querySelector(".GodTierBoon");
        const boon = boonEl?.querySelector(".GodTierBoonInfo")?.textContent?.trim() || boonEl?.textContent?.trim() || "";
        
        const stages = [];
        const table = document.querySelector(".GodTierOfferingsTable tbody");
        if(table) {
            let stage = null, rewards = [];
            [...table.querySelectorAll("tr")].forEach(tr => {
                const stageCell = tr.querySelector(".GodTierStageCell");
                if (stageCell) {
                    if (stage) stages.push({ stage, rewards });
                    stage = stageCell.textContent.trim();
                    rewards = [];
                }
                const rewardList = tr.querySelector(".GodTierRewardList");
                if (rewardList && stage) {
                    [...rewardList.querySelectorAll(".GodTierRewardItem")].forEach(li => {
                        const icon = li.querySelector(".GodTierRewardIcon,img");
                        const span = li.querySelector("span");
                        const text = span ? span.textContent.trim() : li.textContent.trim();
                        if (text) rewards.push({ text, icon: icon?.src || "" });
                    });
                }
            });
            if (stage) stages.push({ stage, rewards });
        }
        
        results.push({ name, trait, rank, image: img, boon, stages });
        processItem(i + 1);
    }, 150);
}

processItem(0);
"""

def main():
    driver = setup_driver()
    final_results = []

    try:
        driver.get(URL)
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".GodTierItem"))
        )
        time.sleep(2)

        driver.set_script_timeout(180)
        raw_data = driver.execute_async_script(_JS_SCRAPE_ALL)
        
        for i, item in enumerate(raw_data):
            clean_name = clean(item["name"])
            final_results.append({
                "id": i + 1,
                "name": clean_name,
                "slug": slugify(clean_name),
                "trait": clean(item["trait"]),
                "rank": item["rank"],
                "boon": clean(item["boon"]),
                "stages": item["stages"],
                "image": item["image"],
            })

    finally:
        driver.quit()

    try:
        with open(AUGMENTS_PATH, encoding="utf-8") as f:
            augments = json.load(f)
        name_to_id = {a["name"].strip().lower(): a.get("id", i+1) for i, a in enumerate(augments)}
        for g in final_results:
            boon = g.pop("boon", "")
            aug_name = boon.split(":")[0].strip().lower() if ":" in boon else boon.strip().lower()
            g["boon_augment_id"] = name_to_id.get(aug_name)
    except FileNotFoundError:
        for g in final_results:
            g.pop("boon", None)
            g["boon_augment_id"] = None

    r2_delete_folder(R2_FOLDER)
    
    R2_ITEMS_FOLDER = "gods_items"
    r2_delete_folder(R2_ITEMS_FOLDER)

    def process_upload(g):
        img_url = g.get("image")
        if not img_url: return
        ext = get_ext_from_url(img_url)
        slug = g["slug"]
        r2_key = f"{R2_FOLDER}/{slug}.{ext}"
        try:
            res = http.get(img_url, timeout=10)
            if res.status_code == 200:
                new_url = r2_put(res.content, r2_key, ext)
                g["image"] = new_url
        except Exception:
            pass

    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(process_upload, g) for g in final_results]
        for idx, fut in enumerate(as_completed(futures), 1):
            pass

    reward_icons = {}
    for g in final_results:
        for stage in g.get("stages", []):
            for reward in stage.get("rewards", []):
                icon_url = reward.get("icon")
                if icon_url and icon_url.startswith("http"):
                    if icon_url not in reward_icons:
                        raw_name = icon_url.split("/")[-1].split("?")[0]
                        clean_name = slugify(raw_name.split(".")[0])
                        ext = get_ext_from_url(icon_url)
                        reward_icons[icon_url] = {
                            "slug": clean_name,
                            "ext": ext,
                            "r2_key": f"{R2_ITEMS_FOLDER}/{clean_name}.{ext}"
                        }

    def process_icon_upload(icon_url):
        data = reward_icons[icon_url]
        try:
            res = http.get(icon_url, timeout=10)
            if res.status_code == 200:
                new_url = r2_put(res.content, data["r2_key"], data["ext"])
                data["new_url"] = new_url
        except Exception:
            pass

    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(process_icon_upload, url) for url in reward_icons]
        for idx, fut in enumerate(as_completed(futures), 1):
            pass

    for g in final_results:
        for stage in g.get("stages", []):
            for reward in stage.get("rewards", []):
                icon_url = reward.get("icon")
                if icon_url in reward_icons and "new_url" in reward_icons[icon_url]:
                    reward["icon"] = reward_icons[icon_url]["new_url"]

    with open(JSON_OUT, "w", encoding="utf-8") as f:
        json.dump(final_results, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()