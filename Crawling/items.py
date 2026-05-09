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
JSON_OUT    = os.path.join(_DIR, "items.json")
R2_FOLDER   = "items"
MAX_WORKERS = 20

CATEGORIES = [
    ("Thường",    "https://www.metatft.com/items/normal"),
    ("Tạo Tác",   "https://www.metatft.com/items/artifact"),
    ("Ánh Sáng",  "https://www.metatft.com/items/radiant"),
    ("Ấn Tộc/Hệ","https://www.metatft.com/items/emblem"),
    ("Tộc/Hệ",   "https://www.metatft.com/items/trait"),
]

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


def get_ext_from_url(url: str) -> str:
    ext = url.split(".")[-1].split("?")[0].lower()
    return ext if ext in {"png", "jpg", "jpeg", "webp"} else "png"


def fname_from_url(url: str) -> str:
    return url.split("?")[0].split("/")[-1].lower().rsplit(".", 1)[0]


def to_text(raw: str) -> str:
    text = re.sub(r"</div>|</p>|</li>|<br\s*/?>", "\n", raw)
    text = re.sub(r"<img[^>]+>", "", text)
    text = re.sub(r"<[^>]+>", "", text)
    return html.unescape(text).strip()


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


def r2_put(data: bytes, r2_key: str, ext: str) -> str:
    mime_type = mimetypes.types_map.get(f".{ext}", "image/png")
    s3.put_object(
        Bucket=R2_BUCKET_NAME,
        Key=r2_key,
        Body=data,
        ContentType=mime_type,
    )
    return f"{R2_PUBLIC_URL}/{r2_key}"


# Phase 1: JS scrape table data (fast, no hover)
_JS_SCRAPE_TABLE = r"""
return [...document.querySelectorAll("tr[role='row']")].map(row => {
    const qt  = sel => (row.querySelector(sel) || {}).textContent || "";
    const qts = sel => [...row.querySelectorAll(sel)].map(n => n.textContent.trim());
    const img = row.querySelector("img");
    const pickRight = qt(".TableNumRight").trim().split(/\s+/);
    return {
        name:          qt(".StatLink").trim(),
        tier:          qt(".StatTierBadge").trim(),
        avg_placement: qt(".TablePlacement").trim(),
        win_rate:      qts(".TableNum")[0] || "",
        pick_count:    pickRight[0] || "",
        pick_percent:  pickRight[1] || "",
        image:         img ? img.src : "",
    };
}).filter(r => r.name);
"""

# Phase 2: batch hover trong pure JS — trả về {name: {html, comp_imgs}}
# Không Python round-trip: ~500ms/item thay vì 1.4s/item
_JS_BATCH_HOVER = """
const done = arguments[arguments.length - 1];
const rows = [...document.querySelectorAll("tr[role='row']")];
const results = {};

function collectTooltip(name) {
    const tips = [...document.querySelectorAll(
        '.tippy-box, .tippy-content, [role="tooltip"]'
    )].filter(el => el.offsetParent !== null && el.innerHTML.trim());
    if (!tips.length) return;
    const tip = tips[0];
    const compImgs = [...tip.querySelectorAll('img')]
        .map(i => i.src)
        .filter(s => s && s.toLowerCase().includes('item') &&
                     !['champions','units','traits','profile'].some(k => s.includes('/'+k+'/')));
    results[name] = { html: tip.innerHTML, comp_imgs: compImgs.slice(0, 2) };
}

function processNext(i) {
    if (i >= rows.length) { done(results); return; }
    const row = rows[i];
    const img = row.querySelector('img');
    const name = (row.querySelector('.StatLink') || {}).textContent?.trim();
    if (!img || !name) { processNext(i + 1); return; }

    ['mouseenter','mouseover'].forEach(t =>
        img.dispatchEvent(new MouseEvent(t, {bubbles: true, cancelable: true}))
    );
    setTimeout(() => {
        collectTooltip(name);
        ['mouseleave','mouseout'].forEach(t =>
            img.dispatchEvent(new MouseEvent(t, {bubbles: true}))
        );
        setTimeout(() => processNext(i + 1), 80);
    }, 420);
}

processNext(0);
"""


def parse_tooltip(raw: str, name: str) -> tuple[str, dict, list]:
    """Parse tooltip HTML → (description, stats, comp_img_urls)"""
    comp_imgs = re.findall(r'<img[^>]+src="([^"]+)"', raw)
    comp_imgs = [s for s in comp_imgs
                 if "item" in s.lower()
                 and not any(k in s for k in ["/champions/", "/units/", "/traits/", "/profile/"])][:2]

    text = to_text(raw)
    desc, stats = "", {}
    for line in [l.strip() for l in text.splitlines() if l.strip()]:
        if name.lower() in line.lower() and len(line) < len(name) + 5:
            continue
        if any(k in line for k in ["Người dùng", "Component"]):
            continue
        stat_match = re.match(r"^\[([^\]]+)\]\s*([+\-]\d+%?)$", line) or \
                     re.match(r"^([+\-]\d+%?)\s*\[([^\]]+)\]$", line)
        if stat_match:
            g = stat_match.groups()
            stats[g[1]] = g[0] if g[0].startswith(("+", "-")) else g[0]
        elif re.search(r"[+\-]\d+", line) and len(line) < 50:
            m = re.match(r"([+\-]\d+%?)\s+(.*)", line)
            if m:
                stats[m.group(2).strip() or "?"] = m.group(1)
        elif line:
            desc += (" " + line) if desc else line

    return desc.strip(), stats, comp_imgs


def resolve_components(results: list[dict]):
    fname_to_slug = {fname_from_url(r["image"]): r["slug"] for r in results if r.get("image")}
    for item in results:
        imgs = item.pop("_comp_imgs", [])
        item["component_1"] = fname_to_slug.get(fname_from_url(imgs[0])) if len(imgs) > 0 else None
        item["component_2"] = fname_to_slug.get(fname_from_url(imgs[1])) if len(imgs) > 1 else None
    matched = sum(1 for r in results if r["component_1"] or r["component_2"])
    print(f"  Components: {matched}/{len(results)} items resolved")


def process_item(item: dict) -> dict:
    name      = item["name"]
    slug      = vn_to_slug(name)
    image_url = item.get("image", "")
    ext       = get_ext_from_url(image_url) if image_url else "png"
    r2_url    = image_url

    if image_url:
        try:
            res = http.get(image_url, timeout=10)
            if res.status_code == 200:
                r2_url = r2_put(res.content, f"{R2_FOLDER}/{slug}.{ext}", ext)
        except Exception as e:
            print(f"  Loi upload [{name}]: {e}")

    desc, stats, comp_imgs = parse_tooltip(item.get("tooltip_html", ""), name)

    return {
        "name":          name,
        "slug":          slug,
        "category":      item.get("category", ""),
        "tier":          item.get("tier", ""),
        "avg_placement": item.get("avg_placement", ""),
        "win_rate":      item.get("win_rate", ""),
        "pick_count":    item.get("pick_count", ""),
        "pick_percent":  item.get("pick_percent", ""),
        "description":   desc,
        "stats":         stats,
        "_comp_imgs":    comp_imgs,
        "component_1":   None,
        "component_2":   None,
        "image":         r2_url,
    }


def scrape_category(driver, category: str, url: str) -> list[dict]:
    driver.get(url)
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "tr[role='row']"))
    )
    time.sleep(1.5)

    raw_rows = driver.execute_script(_JS_SCRAPE_TABLE)
    print(f"  {len(raw_rows)} items, laytooltip...")

    driver.set_script_timeout(len(raw_rows) * 0.6 + 15)
    tooltip_map = driver.execute_async_script(_JS_BATCH_HOVER)

    for r in raw_rows:
        r["category"] = category
        td = tooltip_map.get(r["name"], {})
        r["tooltip_html"] = td.get("html", "")

    hit = sum(1 for r in raw_rows if r["tooltip_html"])
    print(f"  tooltip: {hit}/{len(raw_rows)}")
    return raw_rows


def main():
    start = time.time()

    driver = setup_driver()
    raw_all = []
    try:
        for cat, url in CATEGORIES:
            print(f"\n[{cat}]")
            raw_all.extend(scrape_category(driver, cat, url))
    finally:
        driver.quit()

    seen, unique_items = set(), []
    for r in raw_all:
        name = r.get("name", "").strip()
        if name and name not in seen:
            seen.add(name)
            unique_items.append(r)

    print(f"\n{len(unique_items)} items (tho: {len(raw_all)})")

    r2_delete_folder(R2_FOLDER)

    print(f"Upload {len(unique_items)} anh ({MAX_WORKERS} luong)...")
    results = []
    done = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_item, item): item for item in unique_items}
        for future in as_completed(futures):
            results.append(future.result())
            done += 1
            if done % 20 == 0 or done == len(unique_items):
                print(f"  {done}/{len(unique_items)}  ({time.time() - start:.1f}s)")

    order = {item["name"]: i for i, item in enumerate(unique_items)}
    results.sort(key=lambda r: order.get(r["name"], 9999))

    resolve_components(results)

    with open(JSON_OUT, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\nXong! {len(results)} items -> {JSON_OUT}  ({time.time() - start:.1f}s)")


if __name__ == "__main__":
    main()