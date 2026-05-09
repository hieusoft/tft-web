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
URL         = "https://www.metatft.com/traits"
JSON_OUT    = os.path.join(_DIR, "traits.json")
R2_FOLDER   = "traits"
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


def get_ext_from_url(url: str) -> str:
    ext = url.split(".")[-1].split("?")[0].lower()
    return ext if ext in {"png", "jpg", "jpeg", "webp", "svg"} else "png"


def raw_html_to_text(raw: str) -> str:
    def img_alt(m):
        a = re.search(r'alt="([^"]+)"', m.group(0))
        return f"[{a.group(1)}]" if a else "[icon]"
    text = re.sub(r"</div>|</p>|</li>|<br\s*/?>", "\n", raw)
    text = re.sub(r"<img[^>]+>", img_alt, text)
    text = re.sub(r"<[^>]+>", "", text)
    return html.unescape(text).strip()


def parse_tooltip(text: str, trait_name: str) -> tuple[str, list]:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if lines and trait_name.lower() in lines[0].lower():
        lines = lines[1:]
    desc_parts, milestones, in_ms = [], [], False
    for line in lines:
        hits = list(re.finditer(r"\((\d+)\)\s*(.*?)(?=\(\d+\)|$)", line))
        if hits:
            prefix = line[:hits[0].start()].strip()
            if prefix and not in_ms:
                desc_parts.append(prefix)
            in_ms = True
            for h in hits:
                effect = re.sub(r"Tướng\s*:.*", "", h.group(2)).strip().rstrip("|").strip()
                milestones.append({"unit": int(h.group(1)), "effect": effect})
        else:
            clean = re.sub(r"Tướng\s*:.*", "", line).strip()
            if not in_ms:
                desc_parts.append(clean)
            elif milestones:
                milestones[-1]["effect"] = (milestones[-1]["effect"] + " " + clean).strip()
    return " ".join(desc_parts).strip(), milestones


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
function getFiberProps(el, maxDepth) {
    const rk = Object.keys(el).find(k => k.startsWith('__reactFiber'));
    if (!rk) return [];
    let fiber = el[rk], results = [], depth = 0;
    while (fiber && depth < maxDepth) {
        if (fiber.memoizedProps && typeof fiber.memoizedProps === 'object')
            results.push(fiber.memoizedProps);
        fiber = fiber.return;
        depth++;
    }
    return results;
}

function findTooltip(propsArr) {
    const keys = ['tooltip','content','tooltipContent','description','desc','data','trait'];
    for (const props of propsArr) {
        for (const key of keys) {
            const val = props[key];
            if (typeof val === 'string' && val.length > 5) return val;
            if (val && typeof val === 'object' && val.description) return val.description;
        }
        if (props.trait) {
            const t = props.trait;
            if (t.description) return t.description;
            if (t.tooltip)     return t.tooltip;
        }
    }
    return "";
}

return [...document.querySelectorAll("tr[role='row']")].map(row => {
    const qt  = sel => (row.querySelector(sel) || {}).textContent || "";
    const qts = sel => [...row.querySelectorAll(sel)].map(n => n.textContent.trim());
    const icon = row.querySelector(".TraitIcon");
    const tooltipData = icon ? findTooltip(getFiberProps(icon, 20)) : "";
    const pickRight = qt(".TableNumRight").trim().split(/\s+/);
    return {
        name:         qt(".StatLink").trim(),
        tier:         qt(".StatTierBadge").trim(),
        placement:    qt(".TablePlacement").trim(),
        top4:         qts(".TableNum")[0] || "",
        pick_count:   pickRight[0] || "",
        pick_percent: pickRight[1] || "",
        image:        icon ? icon.src : "",
        tooltip_data: tooltipData,
    };
}).filter(r => r.name);
"""


def process_item(item: dict) -> dict | None:
    name = item["name"].strip()
    if not name:
        return None

    image_url = item.get("image", "")
    slug = ""
    if image_url:
        import urllib.parse
        parsed = urllib.parse.urlparse(image_url)
        path = urllib.parse.unquote(parsed.path)
        slug = path.split("/")[-1].split(".")[0]
        slug = slug.replace("_", "").lower()
        
    if not slug:
        slug = vn_to_slug(name)

    ext       = get_ext_from_url(image_url) if image_url else "png"
    r2_key    = f"{R2_FOLDER}/{slug}.{ext}"
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

    td = item.get("tooltip_data", "")
    desc, milestones = "", []
    if td:
        if "<" in td:
            desc, milestones = parse_tooltip(raw_html_to_text(td), name)
        else:
            desc = td

    return {
        "name":         name,
        "slug":         slug,
        "tier":         item.get("tier", ""),
        "placement":    item.get("placement", ""),
        "top4":         item.get("top4", ""),
        "pick_count":   item.get("pick_count", ""),
        "pick_percent": item.get("pick_percent", ""),
        "description":  desc,
        "milestones":   milestones,
        "image":        r2_url,
    }


def main():
    start = time.time()

    driver = setup_driver()
    try:
        driver.get(URL)
        w = WebDriverWait(driver, 15)
        btn = w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Tổng Quan') or contains(text(),'Overview')]")
        ))
        driver.execute_script("arguments[0].click();", btn)
        w.until(EC.presence_of_element_located((By.CSS_SELECTOR, "tr[role='row']")))
        time.sleep(1.5)
        raw_rows = driver.execute_script(_JS_SCRAPE)
    finally:
        driver.quit()

    seen, unique_items = set(), []
    for r in raw_rows:
        name = r.get("name", "").strip()
        if name and name not in seen:
            seen.add(name)
            unique_items.append(r)

    print(f"{len(unique_items)} traits (tho: {len(raw_rows)})")

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
            if done % 10 == 0 or done == len(unique_items):
                print(f"  {done}/{len(unique_items)}  ({time.time() - start:.1f}s)")

    order = {item["name"].strip(): i for i, item in enumerate(unique_items)}
    results.sort(key=lambda r: order.get(r["name"], 9999))

    with open(JSON_OUT, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"Xong! {len(results)} traits -> {JSON_OUT}  ({time.time() - start:.1f}s)")


if __name__ == "__main__":
    main()