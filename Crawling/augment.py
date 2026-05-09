import sys, io, re, html, json, time, os, mimetypes
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
import boto3
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from dotenv import load_dotenv

load_dotenv()
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

_DIR        = os.path.dirname(os.path.abspath(__file__))
URL         = "https://www.metatft.com/augments"
JSON_OUT    = os.path.join(_DIR, "augments.json")
R2_FOLDER   = "augments"
MAX_WORKERS = 20

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
    for arg in ["--headless", "--no-sandbox", "--disable-dev-shm-usage",
                "--window-size=1920,1080", "--lang=vi"]:
        opts.add_argument(arg)
    opts.add_experimental_option("prefs", {"intl.accept_languages": "vi,vi-VN"})
    opts.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    return webdriver.Chrome(options=opts)


def vn_to_slug(text: str) -> str:
    if not text:
        return "unknown"
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = text.replace("đ", "d").replace("Đ", "D")
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text)
    return text.strip("-")


def clean_html(raw: str) -> str:
    if not raw:
        return ""
    text = re.sub(r"</div>|</p>|</li>|<br\s*/?>", "\n", raw)
    text = re.sub(r"<[^>]+>", "", text)
    return html.unescape(text).strip()


def get_ext_from_url(url: str) -> str:
    ext = url.split(".")[-1].split("?")[0].lower()
    return ext if ext in {"png", "jpg", "jpeg", "webp"} else "png"


def r2_delete_folder(folder: str):
    print(f"Xoa folder cu R2: {folder}/")
    try:
        all_keys = []
        paginator = s3.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=R2_BUCKET_NAME, Prefix=f"{folder}/"):
            all_keys.extend(obj["Key"] for obj in page.get("Contents", []))
        if not all_keys:
            print("  Folder da trong.")
            return
        batches = [all_keys[i:i+1000] for i in range(0, len(all_keys), 1000)]
        def delete_batch(keys):
            s3.delete_objects(
                Bucket=R2_BUCKET_NAME,
                Delete={"Objects": [{"Key": k} for k in keys]},
            )
        with ThreadPoolExecutor(max_workers=5) as ex:
            list(ex.map(delete_batch, batches))
        print(f"  Da xoa {len(all_keys)} file cu.")
    except Exception as e:
        print(f"  Khong the xoa folder R2: {e}")
        print("  Tiep tuc upload de len file cu...")


def r2_put(data: bytes, r2_key: str, ext: str) -> str:
    mime_type = mimetypes.types_map.get(f".{ext}", "image/png")
    s3.put_object(
        Bucket=R2_BUCKET_NAME,
        Key=r2_key,
        Body=data,
        ContentType=mime_type,
    )
    return f"{R2_PUBLIC_URL}/{r2_key}"


_JS_SCRAPE = r"""
function getFiberProps(el) {
    const rk = Object.keys(el).find(k => k.startsWith('__reactFiber'));
    if (!rk) return [];
    let fiber = el[rk];
    const results = [];
    while (fiber) {
        if (fiber.memoizedProps) results.push(fiber.memoizedProps);
        fiber = fiber.return;
    }
    return results;
}
function findData(propsArr) {
    for (const p of propsArr) {
        if (p.augment) return p.augment;
        if (p.data && p.data.name) return p.data;
    }
    return null;
}
return [...document.querySelectorAll(".AugmentWrapper")].map(w => {
    const props = getFiberProps(w);
    const data  = findData(props);
    const img   = w.querySelector('img');
    const row   = w.closest('.TierListRow');
    let tier = data?.tier ?? data?.augmentTier ?? data?.level ?? null;
    if (!tier) {
        const cls = w.className.toLowerCase();
        if (cls.includes('prismatic') || cls.includes('tier3') || cls.includes('diamond')) tier = 3;
        else if (cls.includes('gold') || cls.includes('tier2')) tier = 2;
        else tier = 1;
    }
    if (tier === 1 && img) {
        const m = img.src.toLowerCase().match(/([ivx]+)\.(png|webp|jpg)(\?|$)/);
        if (m) {
            if (m[1] === 'iii') tier = 3;
            else if (m[1] === 'ii') tier = 2;
        }
    }
    return {
        name:        data?.name || w.querySelector('.AugmentLabel')?.textContent.trim() || img?.alt || "",
        description: data?.description || data?.tooltip || "",
        image:       img ? img.src : "",
        tier:        tier,
        rank:        row?.querySelector('.TierListTierTitle')?.textContent.trim() || ""
    };
});
"""


def process_item(item: dict) -> dict | None:
    name = item["name"].strip()
    if not name:
        return None
    slug      = vn_to_slug(name)
    ext       = get_ext_from_url(item["image"])
    r2_key    = f"{R2_FOLDER}/{slug}.{ext}"
    image_url = item["image"]
    r2_url    = image_url
    if image_url:
        try:
            res = http.get(image_url, timeout=10)
            if res.status_code == 200:
                r2_url = r2_put(res.content, r2_key, ext)
            else:
                print(f"  HTTP {res.status_code}: {name}")
        except Exception as e:
            print(f"  Loi [{name}]: {e}")
    return {
        "name":        name,
        "slug":        slug,
        "tier":        int(item.get("tier") or 1),
        "rank":        item.get("rank", ""),
        "description": clean_html(item.get("description", "")),
        "image":       r2_url,
    }


def main():
    start = time.time()

    print(f"Dang ket noi toi {URL}...")
    driver = setup_driver()
    try:
        driver.get(URL)
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CLASS_NAME, "AugmentWrapper"))
        )
        raw_data = driver.execute_script(_JS_SCRAPE)
    finally:
        driver.quit()

    seen, unique_items = set(), []
    for item in raw_data:
        name = item["name"].strip()
        if name and name not in seen:
            seen.add(name)
            unique_items.append(item)

    print(f"{len(unique_items)} augments (tho: {len(raw_data)})")

    r2_delete_folder(R2_FOLDER)

    print(f"Upload {len(unique_items)} anh ({MAX_WORKERS} luong)...")
    results = []
    done = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_item, item): item for item in unique_items}
        for future in as_completed(futures):
            result = future.result()
            if result:
                results.append(result)
            done += 1
            if done % 20 == 0 or done == len(unique_items):
                print(f"  {done}/{len(unique_items)}  ({time.time() - start:.1f}s)")

    order = {item["name"].strip(): i for i, item in enumerate(unique_items)}
    results.sort(key=lambda r: order.get(r["name"], 9999))

    with open(JSON_OUT, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"Xong! {len(results)} augments -> {JSON_OUT}  ({time.time() - start:.1f}s)")


if __name__ == "__main__":
    main()