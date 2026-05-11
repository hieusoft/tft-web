import sys, io, re, html, time, json, os, mimetypes, unicodedata
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

BASE_URL = "https://www.metatft.com"
LIST_URL = f"{BASE_URL}/units"

STAT_LABELS = [
    "Máu", "Mana",
    "Sát thương tấn công", "Sát thương kỹ năng",
    "Giáp", "Kháng phép",
    "Tốc độ tấn công", "Tỷ lệ chí mạng",
    "Sát thương chí mạng", "Tầm bắn",
]

_JS_SCRAPE_ITEMS = """
const tables = document.querySelectorAll('table');
let targetTable = null;

for (const tbl of tables) {
    if (tbl.textContent.includes('Tỷ Lệ Thắng') || tbl.textContent.includes('Hạng TB')) {
        targetTable = tbl;
        break;
    }
}

if (!targetTable) return []; 

const rows = [...targetTable.querySelectorAll('tbody tr')];
return rows.map(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 6) return null;
    
    const img = cells[0].querySelector('img');
    if (!img) return null;

    const freqText = cells[5].textContent.trim().split(/[\\s\\n]+/);
    
    return {
        item_name: img.alt,
        tier: cells[1].textContent.trim(),
        avg_placement: cells[2].textContent.trim(),
        win_rate: cells[4].textContent.trim(),       
        match_count: freqText[0] || null,            
        pick_percent: freqText[1] || null            
    };
}).filter(Boolean); 
"""

_JS_SCRAPE_BUILDS = """
const tables = document.querySelectorAll('table');
let targetTable = null;
for (const tbl of tables) {
    const text = tbl.textContent.toLowerCase();
    if (text.includes('build') && (text.includes('avg place') || text.includes('hạng tb'))) {
        targetTable = tbl;
        break;
    }
}
if (!targetTable) return [];
const rows = [...targetTable.querySelectorAll('tbody tr')]
             .filter(r => r.querySelectorAll('img').length >= 3);

return rows.map(row => {
    const imgs = [...row.querySelectorAll('img')].slice(0, 3);
    const itemNames = imgs.map(img => img.alt);
    const cells = row.querySelectorAll('td');
    return {
        items: itemNames,
        text_content: row.textContent,
        tier: cells.length > 1 ? cells[1].textContent.trim() : null
    };
});
"""

_JS_SCRAPE_SKILL = """
let result = {
    name: "",
    mana_start: null,
    mana_max: null,
    description: "",
    ability_stats: {},
    skill_icon: "" 
};

// 1. TÊN KỸ NĂNG VÀ ICON
const nameEl = document.querySelector('[class*="AbilityName"], [class*="abilityName"], [class*="SkillName"]');
if (nameEl) {
    result.name = nameEl.textContent.trim();
}

// TÌM ICON KỸ NĂNG (Dựa theo "chỉ điểm" của ông giáo)
const iconEl = document.querySelector('.UnitAbilityStart img, .UnitAbilityIcon img, [class*="AbilityIcon"] img');
if (iconEl) {
    result.skill_icon = iconEl.src;
} else if (nameEl && nameEl.previousElementSibling && nameEl.previousElementSibling.tagName === 'IMG') {
    // Trường hợp dự phòng: ảnh nằm ngay trước tên kỹ năng
    result.skill_icon = nameEl.previousElementSibling.src;
}

// 2. MANA
const manaEl = document.querySelector('[class*="UnitAbilityMana"]');
if (manaEl) {
    const manaMatch = manaEl.textContent.trim().match(/(\\d+)\\s*\\/\\s*(\\d+)/);
    if (manaMatch) {
        result.mana_start = parseInt(manaMatch[1], 10);
        result.mana_max = parseInt(manaMatch[2], 10);
    }
}

// 3. MÔ TẢ KỸ NĂNG
const descEl = document.querySelector('[class*="AbilityDesc"], [class*="abilityDesc"], [class*="SkillDesc"], [class*="AbilityDescription"]');
if (descEl) {
    result.description = descEl.innerText.trim();
}

return result;
"""

# ==========================================
# CÁC HÀM XỬ LÝ ẢNH & R2
# ==========================================
def clean_img_url(url: str) -> str:
    if not url: return ""
    if "cdn-cgi/image" in url:
        idx = url.find("http", url.find("cdn-cgi/image"))
        if idx != -1:
            return f"https://cdn.metatft.com/cdn-cgi/image/width=1920,height=1080,format=auto/{url[idx:]}"
    return url

def get_r2_client():
    return boto3.client(
        's3',
        endpoint_url=os.getenv('R2_ENDPOINT'),
        aws_access_key_id=os.getenv('R2_ACCESS_KEY'),
        aws_secret_access_key=os.getenv('R2_SECRET_KEY'),
        region_name='auto'
    )

def upload_image_to_r2(image_url, folder, s3_client, bucket, cdn_url):
    if not image_url:
        return ""
    if not bucket:
        print(f"  [⚠] Lỗi: Không tìm thấy R2_BUCKET_NAME trong file .env hoặc biến môi trường!")
        return image_url
        
    en_name = image_url.split('/')[-1].split('.')[0].split('?')[0]
    ext = image_url.split('.')[-1].split('?')[0] or "png"
    filename = f"{en_name}.{ext}"
    object_key = f"{folder}/{filename}"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }
    
    for attempt in range(3):
        try:
            res = requests.get(image_url, headers=headers, timeout=15)
            if res.status_code == 200:
                mime, _ = mimetypes.guess_type(filename)
                s3_client.upload_fileobj(
                    io.BytesIO(res.content),
                    bucket,
                    object_key,
                    ExtraArgs={'ContentType': mime or 'image/png'}
                )
                return f"{cdn_url}/{object_key}"
            else:
                break
        except Exception as e:
            if attempt == 2:
                print(f"  [⚠] Lỗi up ảnh {filename} lên R2: {e}")
            time.sleep(1)

    return image_url

def slug_from_url(url: str) -> str:
    if not url: return ""
    name = url.split("?")[0].split("/")[-1].lower().rsplit(".", 1)[0]
    name = re.sub(r'^tft\d*_spell_|^tft\d*_ability_', '', name)
    return name.replace("_", "-")

def vi_slug(text: str) -> str:
    if not text: return ""
    text = text.replace('đ', 'd').replace('Đ', 'D')
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^a-zA-Z0-9]+', '-', text)
    return text.strip('-').lower()

# ==========================================
# SETUP DRIVER & CÀO DATA
# ==========================================
def setup_driver():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1920,8000")
    opts.add_argument("--start-maximized")
    opts.add_argument("--force-device-scale-factor=1")
    opts.add_argument("--lang=vi")
    opts.add_experimental_option("prefs", {"intl.accept_languages": "vi,vi-VN"})
    opts.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
    
    driver = webdriver.Chrome(options=opts)
    driver.set_window_size(1920, 8000)
    return driver

def click_tab(driver, tab_text: str) -> bool:
    try:
        btn = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.XPATH, f"//button[normalize-space(text())='{tab_text}']"))
        )
        driver.execute_script("arguments[0].click();", btn)
        time.sleep(0.3)
        return True
    except:
        return False

def body_lines(driver) -> list[str]:
    return [l.strip() for l in driver.find_element(By.TAG_NAME, "body").text.splitlines() if l.strip()]

def parse_base_stats(lines: list[str]) -> dict:
    stats = {}
    for i, line in enumerate(lines):
        if line in STAT_LABELS and i + 1 < len(lines):
            val = lines[i + 1].strip()
            if re.match(r'^[\d./% ]+$', val):
                stats[line] = val
    return stats

def get_unit_list(driver) -> list[dict]:
    driver.get(LIST_URL)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "tr[role='row']")))
    time.sleep(0.5)
    
    rows = driver.find_elements(By.CSS_SELECTOR, "tr[role='row']")
    units = []

    for row in rows:
        try:
            link_el = row.find_element(By.CSS_SELECTOR, ".StatLink, td a")
            name    = link_el.text.strip()
            href    = link_el.get_attribute("href") or ""
            if not name or not href: continue

            slug = href.rstrip("/").split("/")[-1]
            url  = href if href.startswith("http") else BASE_URL + href

            rank = avg = win = freq = icon = ""
            try: rank = row.find_element(By.CSS_SELECTOR, ".StatTierBadge").text.strip()
            except: pass
            try: avg  = row.find_element(By.CSS_SELECTOR, ".TablePlacement").text.strip()
            except: pass
            try: win  = row.find_elements(By.CSS_SELECTOR, ".TableNum")[0].text.strip()
            except: pass
            try: freq = row.find_element(By.CSS_SELECTOR, ".TableNumRight").text.strip()
            except: pass
            try: icon = row.find_element(By.CSS_SELECTOR, "img").get_attribute("src") or ""
            except: pass

            parts        = freq.strip().split()
            games_played = parts[0].replace(".", "").replace(",", "") if parts else ""
            pick_rate    = parts[1] if len(parts) > 1 else ""

            units.append({"name": name, "slug": slug, "url": url,
                          "rank": rank, "avg_placement": avg, "win_rate": win,
                          "games_played": games_played, "pick_rate": pick_rate, "icon": clean_img_url(icon)})
        except Exception:
            continue
    return units

def get_unit_detail(driver, url: str, name: str) -> dict:
    detail = {"cost": None, "traits": [], "splash": "", "skill": {}, "base_stats": {}}
    driver.get(url)
    try:
        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.CLASS_NAME, "UnitNameContainer")))
    except:
        pass

    try:
        try: 
            splash_url = driver.find_element(By.CSS_SELECTOR, ".NewSetUnitSplashImg").get_attribute("src") or ""
            detail["splash"] = clean_img_url(splash_url)
        except: pass

        for sel in ["[class*='UnitCost']", "[class*='unitcost']", "[class*='Cost']", "[class*='cost']"]:
            try:
                for cost_el in driver.find_elements(By.CSS_SELECTOR, sel):
                    t = cost_el.text.strip()
                    if t.isdigit(): 
                        detail["cost"] = int(t)
                        break
                    imgs = cost_el.find_elements(By.TAG_NAME, "img")
                    if imgs: 
                        detail["cost"] = len(imgs)
                        break
                if detail.get("cost") is not None:
                    break
            except: pass

        try:
            container = driver.find_element(By.CLASS_NAME, "UnitTraitContainer")
            traits = []
            for el in container.find_elements(By.CSS_SELECTOR, "a, span, div"):
                t = el.text.strip()
                if t and t != name and len(t) < 30 and not re.search(r'\d', t) and t not in traits:
                    traits.append(t)
            detail["traits"] = traits
        except: pass

        click_tab(driver, "Kỹ Năng")
        
        try:
            skill_data = driver.execute_script(_JS_SCRAPE_SKILL)
            detail["skill"] = skill_data
        except Exception as skill_e:
            print(f"  Lỗi JS khi cào skill: {skill_e}")

        click_tab(driver, "Số Liệu")
        detail["base_stats"] = parse_base_stats(body_lines(driver))

    except Exception as e:
        print(f"  detail error [{name}]: {e}")
    return detail

def get_build_stats(driver) -> list[dict]:
    builds = []
    try:
        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.CSS_SELECTOR, "table tbody tr")))
        raw_data = driver.execute_script(_JS_SCRAPE_BUILDS)
        for data in raw_data:
            item_names = data.get("items", [])
            text = data.get("text_content", "")
            
            nums = re.findall(r'-?[\d.,]+%?', text)
            avg = wr = None
            for n in nums:
                if '%' in n: wr = n; break
            for n in nums:
                if '%' not in n and '-' not in n: avg = n; break

            builds.append({
                "items": item_names,
                "tier": data.get("tier"),
                "avg_placement": avg,
                "win_rate": wr,
            })
    except Exception as e:
        print(f"  build_stats error: {e}")
    return builds

def get_item_stats(driver) -> list[dict]:
    items = []
    try:
        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.CSS_SELECTOR, "table tbody tr")))

        raw_data = driver.execute_script(_JS_SCRAPE_ITEMS)
        
        for i, data in enumerate(raw_data):
            raw_games = data.get("match_count", "")
            games = raw_games.replace('.', '').replace(',', '') if raw_games else None
            
            items.append({
                "rank_priority": i + 1,
                "item_name":     data.get("item_name"),
                "tier":          data.get("tier"),
                "avg_placement": data.get("avg_placement"),
                "win_rate":      data.get("win_rate"),     
                "match_count":   games,                    
                "pick_percent":  data.get("pick_percent"), 
            })

    except Exception as e:
        print(f"  item_stats error: {e}")
    return items

def resolve_traits(champions: list, traits_path=os.path.join(_DIR, "traits.json")) -> list:
    champ_traits = []
    try:
        with open(traits_path, encoding="utf-8") as f:
            traits = json.load(f)
        name_to_id = {t["name"].strip().lower(): i + 1 for i, t in enumerate(traits)}
        ct_id = 1
        for c in champions:
            for tr in c.pop("_traits", []):
                champ_traits.append({
                    "id": ct_id, "champion_id": c["id"],
                    "trait_id": name_to_id.get(tr.strip().lower()),
                })
                ct_id += 1
    except FileNotFoundError:
        print("  ⚠ Không tìm thấy metatft_traits.json")
        for c in champions: c.pop("_traits", None)
    return champ_traits

# ==========================================
# MAIN FUNCTION
# ==========================================
def main():
    driver = setup_driver()

    s3_client = get_r2_client()
    bucket = os.getenv('R2_BUCKET_NAME')
    cdn_url = os.getenv('CDN_URL', 'https://cdn.tftmeta.gg')

    champions, skills = [], []
    champion_build_stats, champion_item_stats = [], []
    upload_tasks = []

    try:
        with open(os.path.join(_DIR, "items.json"), encoding="utf-8") as f:
            items_data = json.load(f)
        item_map = {item["name"].strip().lower(): item["id"] for item in items_data}
    except FileNotFoundError:
        print("  Không tìm thấy items.json, ID trang bị sẽ bị null.")
        item_map = {}

    try:
        units = get_unit_list(driver)
        for i, u in enumerate(units, 1):
            
            if i > 1 and i % 15 == 0:
                print(f"  🔄 Khởi động lại Chrome để giải phóng RAM (đã cào {i-1} tướng)...")
                try:
                    driver.quit()
                except:
                    pass
                driver = setup_driver()

            print(f"  [{i}/{len(units)}] Cào data {u['name']}...")

            detail = get_unit_detail(driver, u["url"], u["name"])

            click_tab(driver, "Lối Chơi")
            time.sleep(1) 
            builds     = get_build_stats(driver)

            click_tab(driver, "Trang Bị")
            time.sleep(1) 
            item_stats = get_item_stats(driver)


            for b in builds:
                clean_names = [n.replace("2nd ", "").replace("3rd ", "").strip() for n in (b["items"] or [])]
                ids = [item_map.get(n.lower()) for n in clean_names]
                champion_build_stats.append({
                    "id":            len(champion_build_stats) + 1,
                    "champion_id":   i,
                    "tier":          b.get("tier"),
                    "item_1_id":     ids[0] if len(ids) > 0 else None,
                    "item_1_name":   clean_names[0] if len(clean_names) > 0 else None,
                    "item_2_id":     ids[1] if len(ids) > 1 else None,
                    "item_2_name":   clean_names[1] if len(clean_names) > 1 else None,
                    "item_3_id":     ids[2] if len(ids) > 2 else None,
                    "item_3_name":   clean_names[2] if len(clean_names) > 2 else None,
                    "avg_placement": b["avg_placement"],
                    "win_rate":      b["win_rate"],
                })

            for s in item_stats:
                clean_name = s["item_name"].replace("2nd ", "").replace("3rd ", "").strip()
                champion_item_stats.append({
                    "id":            len(champion_item_stats) + 1,
                    "champion_id":   i,
                    "item_id":       item_map.get(clean_name.lower()),
                    "item_name":     clean_name,
                    "tier":          s.get("tier"),
                    "avg_placement": s["avg_placement"],
                    "win_rate":      s["win_rate"],
                    "match_count":   s["match_count"],
                    "pick_percent":  s["pick_percent"],
                    "rank_priority": s["rank_priority"],
                })

            sk = detail["skill"]
            raw_skill_icon = sk.get("skill_icon", "")
            raw_skill_icon = clean_img_url(raw_skill_icon)
            skills.append({
                "id":            i,
                "name":          sk.get("name", "")[:100],
                "slug":          vi_slug(sk.get("name", "")), 
                "mana_start":    sk.get("mana_start"),
                "mana_max":      sk.get("mana_max"),
                "description":   sk.get("description", ""),
                "ability_stats": sk.get("ability_stats", {}), 
                "icon_path":     "",
            })

            champ_dict = {
                "id":            i,
                "name":          u["name"][:50],
                "slug":          u["slug"],
                "cost":          detail["cost"],
                "rank":          u["rank"],
                "avg_placement": u["avg_placement"],
                "win_rate":      u["win_rate"],
                "games_played":  u["games_played"],
                "pick_rate":     u["pick_rate"],
                "skill_id":      i,
                "base_stats":    detail["base_stats"],
                "icon_path":     "",  
                "splash_path":   "",
                "_traits":       detail["traits"],
            }
            champions.append(champ_dict)
            
            # Setup refs for async upload
            if u.get("icon"):
                upload_tasks.append((champ_dict, "icon_path", u["icon"], "champions/icons"))
            if detail.get("splash"):
                upload_tasks.append((champ_dict, "splash_path", detail["splash"], "champions/splashes"))
            if raw_skill_icon:
                upload_tasks.append((skills[-1], "icon_path", raw_skill_icon, "skills/icons"))

    finally:
        driver.quit()
        
    def process_upload(task):
        obj, field, img_url, folder = task
        new_url = upload_image_to_r2(img_url, folder, s3_client, bucket, cdn_url)
        if new_url:
            obj[field] = new_url

    from concurrent.futures import ThreadPoolExecutor, as_completed
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(process_upload, task) for task in upload_tasks]
        for _ in as_completed(futures):
            pass

    champ_traits = resolve_traits(champions)

    with open(os.path.join(_DIR, "champions.json"),            "w", encoding="utf-8") as f: json.dump(champions,            f, ensure_ascii=False, indent=2)
    with open(os.path.join(_DIR, "skills.json"),               "w", encoding="utf-8") as f: json.dump(skills,               f, ensure_ascii=False, indent=2)
    with open(os.path.join(_DIR, "champion_traits.json"),      "w", encoding="utf-8") as f: json.dump(champ_traits,         f, ensure_ascii=False, indent=2)
    with open(os.path.join(_DIR, "champion_build_stats.json"), "w", encoding="utf-8") as f: json.dump(champion_build_stats, f, ensure_ascii=False, indent=2)
    with open(os.path.join(_DIR, "champion_item_stats.json"),  "w", encoding="utf-8") as f: json.dump(champion_item_stats,  f, ensure_ascii=False, indent=2)
if __name__ == "__main__":
    main()