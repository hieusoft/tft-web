import json
import time
import re
import os
import sys
import io
from playwright.sync_api import sync_playwright

# Đặt mã hóa UTF-8 cho stdout trên Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

# Bản đồ vị trí bàn cờ TFT: Hex_N -> row
# hex 0-27, đếm trái→phải, dưới→trên
# FE tính vị trí trong hàng: hex % 7  (0=trái, 6=phải)
HEX_POSITION_MAP = {
    # Row 0 (hàng đầu, gần địch nhất)
     0: 0,  1: 0,  2: 0,  3: 0,  4: 0,  5: 0,  6: 0,
    # Row 1
     7: 1,  8: 1,  9: 1, 10: 1, 11: 1, 12: 1, 13: 1,
    # Row 2
    14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2,
    # Row 3 (hàng sau, xa địch nhất)
    21: 3, 22: 3, 23: 3, 24: 3, 25: 3, 26: 3, 27: 3,
}

# JS đọc full board SVG sau khi expand: lấy {championId: hex_index}
# Fill của polygon có dạng url(#mask-TFT17_Akali-405007) -> chứa champion ID thật
_JS_GET_CHAMPION_HEX = r"""
() => {
    const result = [];  // Array of { champ: string, hex: number }
    document.querySelectorAll('polygon[id^="Hex_"]').forEach(poly => {
        const fill = poly.getAttribute('fill') || '';
        // fill = "url(#mask-TFT17_Akali-405007)" hoac "url(#mask-TFTxx_Champ-id)"
        const m = fill.match(/url\(#mask-(TFT[\w]+)-/i);
        if (m) {
            const hexNum = parseInt(poly.id.replace('Hex_', ''));
            result.push({ champ: m[1], hex: hexNum });
        }
    });
    return result;
}
"""

def clean_float(text):
    if not text: return 0.0
    match = re.search(r"(\d+[\.,]\d+|\d+)", text)
    if match:
        return float(match.group(1).replace(',', '.'))
    return 0.0

def load_mappings():
    try:
        with open(os.path.join(DATA_DIR, 'items.json'), 'r', encoding='utf-8') as f:
            items_data = json.load(f)
        with open(os.path.join(DATA_DIR, 'champions.json'), 'r', encoding='utf-8') as f:
            champions_data = json.load(f)
        
        try:
            with open(os.path.join(DATA_DIR, 'augments.json'), 'r', encoding='utf-8') as f:
                augs_data = json.load(f)
            aug_map = {a['name']: a.get('id', idx + 1) for idx, a in enumerate(augs_data)}
        except:
            aug_map = {}
            
        item_map = {item['name']: item.get('id', idx + 1) for idx, item in enumerate(items_data)}
        champ_map = {champ['name']: champ.get('id', idx + 1) for idx, champ in enumerate(champions_data)}
        
        # Build map: champion name -> TFT slug (dùng để match với SVG fill URL)
        # icon_path: "https://.../tft17_akali.png" -> slug = "TFT17_Akali"
        tft_slug_map = {}
        for champ in champions_data:
            name = champ.get('name', '')
            icon = champ.get('icon_path', '')
            if name and icon:
                # Extract "tft17_akali" từ URL, capitalize -> "TFT17_Akali"
                filename = icon.rstrip('/').split('/')[-1].replace('.png', '')
                # tft17_akali -> TFT17_Akali
                parts = filename.split('_', 1)
                if len(parts) == 2:
                    tft_slug = parts[0].upper() + '_' + parts[1].capitalize()
                    # Handle multi-word: tft17_masteryi -> TFT17_Masteryi (MetaTFT dung PascalCase)
                    tft_slug_map[name] = tft_slug
        
        return champ_map, item_map, aug_map, tft_slug_map
            
    except Exception as e:
        print(f"⚠️ Cảnh báo: Lỗi load mapping. Lỗi: {e}")
        return {}, {}, {}, {}

_JS_EXTRACT_DETAILS = r"""
(rowNode) => {
    let detailNode = rowNode.nextElementSibling;
    let allNodes = [...rowNode.querySelectorAll('div, span, p')];
    
    if (detailNode && !detailNode.classList.contains('CompRow')) {
        allNodes = allNodes.concat([...detailNode.querySelectorAll('div, span, p')]);
    } else {
        detailNode = rowNode; 
    }
    
    let carousel = [];
    let raw_leveling = "";
    let early = {};
    let augments = [];
    
    const playstyleBadges = [...rowNode.querySelectorAll(".Comp_Badge, .Badge")].map(b => b.textContent.trim());
    const playstyle = playstyleBadges.length > 0 ? playstyleBadges.join(" | ") : "Trung Bình";

    let carouselEl = allNodes.find(el => el.textContent && (el.textContent.trim() === 'Ưu Tiên Vòng Đi Chợ' || el.textContent.includes('Carousel')));
    if (carouselEl && carouselEl.parentElement) {
        let container = carouselEl.parentElement;
        for(let j=0; j<3; j++) {
            if(container && container.querySelectorAll('img').length > 0) break;
            if(container) container = container.parentElement;
        }
        if(container) carousel = Array.from(container.querySelectorAll('img')).map(i => i.alt).filter(Boolean);
    }

    let levelEl = allNodes.find(el => el.textContent && el.textContent.includes('Lên Cấp:'));
    if (levelEl && levelEl.parentElement) {
        let parent = levelEl.parentElement;
        if (parent && parent.parentElement) parent = parent.parentElement;
        raw_leveling = parent.innerText || parent.textContent;
    }

    // 🛑 CHIẾN THUẬT TREEWALKER: QUÉT ĐÚNG TRÌNH TỰ MẮT ĐỌC 
    let walker = document.createTreeWalker(detailNode, NodeFilter.SHOW_ELEMENT, null, false);
    let node;
    let currentCap = null;

    while ((node = walker.nextNode())) {
        // Nếu gặp Text báo hiệu Cấp độ
        if (node.children.length === 0 && /^Cấp\s*[4-9]$/.test(node.textContent.trim())) {
            currentCap = node.textContent.trim();
            if (!early[currentCap]) early[currentCap] = [];
        } 
        // Nếu đang trong túi của một Cấp, và gặp Ảnh Tướng
        else if (currentCap && node.tagName === 'IMG' && (node.classList.contains('Unit_img') || node.src.includes('champions'))) {
            // Thêm vào danh sách Cấp hiện tại (Chống lặp)
            if (node.alt && !early[currentCap].includes(node.alt)) {
                early[currentCap].push(node.alt);
            }
        }
    }
    
    // Dọn dẹp túi rỗng
    for (let k in early) {
        if (early[k].length === 0) delete early[k];
    }

    // --- Lấy Lõi ---
    let augImgs = Array.from(detailNode.querySelectorAll('.Augment_img, img[src*="augment"]'));
    let tooltips = document.querySelectorAll('.tippy-box, .tippy-content, [data-tippy-root], [class*="Tooltip"], [class*="Popover"]');
    tooltips.forEach(t => {
        let tImgs = Array.from(t.querySelectorAll('.Augment_img, img[src*="augment"]'));
        augImgs = augImgs.concat(tImgs);
    });
    
    let uniqueAugs = [...new Set(augImgs.map(img => img.alt).filter(Boolean))];
    augments = uniqueAugs;

    // --- Lấy tọa độ bàn cờ (Hex positions) ---
    let hexPositions = [];
    // Tìm khung chứa bản đồ (thường là svg hoặc div chứa các Hex_...)
    let boardContainer = detailNode.querySelector('.FullBoard, [class*="Board"], svg');
    if (!boardContainer) boardContainer = detailNode; // Fallback

    boardContainer.querySelectorAll('polygon[id^="Hex_"]').forEach(poly => {
        const fill = poly.getAttribute('fill') || '';
        // match mask-TFT17_Akali... hoac tương tự
        const m = fill.match(/url\(#mask-([\w]+)-/i);
        if (m) {
            const hexNum = parseInt(poly.id.replace('Hex_', ''));
            hexPositions.push({ champ: m[1], hex: hexNum });
        }
    });

    return { playstyle, carousel, raw_leveling, early, augments, hexPositions };
}
"""

def scrape_live_metatft_vi():
    champ_map, item_map, aug_map, tft_slug_map = load_mappings()
    final_data = []
    target_count = 150 
    seen_names = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True) 
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()
        
        print("🚀 Đang tiến vào MetaTFT...")
        page.goto("https://www.metatft.com/comps", wait_until="load", timeout=60000)
        
        try:
            print("🇻🇳 Đang chuyển vùng sang tiếng Việt...")
            page.wait_for_selector(".LanguageSelect", timeout=10000)
            page.click(".LanguageSelect")
            page.wait_for_selector("[class*='-menu']", timeout=5000)
            
            vi_option = page.locator("[class*='-option']").filter(has_text=re.compile(r"^vi$", re.IGNORECASE))
            vi_option.scroll_into_view_if_needed()
            vi_option.click()
            time.sleep(4) 
        except Exception:
            pass

        page.wait_for_selector(".Comp_Title", timeout=15000) 

        last_len = 0
        patience = 0

        while len(final_data) < target_count:
            rows_locator = page.locator(".CompRow:not(.CompRowPlaceholder)")
            count = rows_locator.count()
            processed_any = False
            
            for i in range(count):
                try:
                    row_loc = rows_locator.nth(i)
                    
                    basic_data = row_loc.evaluate("""el => {
                        const name = (el.querySelector('.Comp_Title') || {}).textContent || "";
                        const tier = (el.querySelector('.CompRowTierBadge') || {}).textContent || "N/A";
                        const stats = [...el.querySelectorAll('.Stat_Number')].map(n => n.textContent);
                        const units = [...el.querySelectorAll('.Unit_Wrapper')].map(u => {
                            const img = u.querySelector('img.Unit_img');
                            const star = u.querySelector('.stars_div img');
                            const items = [...u.querySelectorAll('.Item_img')].map(i => i.alt).filter(Boolean);
                            return {
                                name: img ? img.alt : "",
                                is_three_star: star ? (star.alt || "").includes("Three Star") : false,
                                items: items
                            };
                        });
                        return { name: name.trim(), tier: tier.trim(), stats, units };
                    }""")
                    
                    name = basic_data.get('name')
                    if not name or name in seen_names: 
                        continue 

                    row_loc.evaluate("el => el.scrollIntoView({block: 'center', behavior: 'instant'})")
                    page.wait_for_timeout(300) 
                    row_loc.evaluate("el => el.click()")
                    page.wait_for_timeout(1500)  # Tăng thời gian chờ bản đồ render
                    
                    details_data = row_loc.evaluate(_JS_EXTRACT_DETAILS)
                    champ_hex_list = details_data.get('hexPositions', [])
                    remaining_hexes = champ_hex_list.copy() # List of {champ, hex}
                    
                    try:
                        box = row_loc.evaluate("""el => {
                            let next = el.nextElementSibling;
                            if (!next) return null;
                            let btn = Array.from(next.querySelectorAll('*')).find(n => n.textContent === 'Thêm' || n.textContent === '+ Thêm');
                            if (btn) {
                                let rect = btn.getBoundingClientRect();
                                return {x: rect.x + rect.width/2, y: rect.y + rect.height/2};
                            }
                            return null;
                        }""")
                        if box:
                            page.mouse.move(box['x'], box['y'])
                            page.wait_for_timeout(600) 
                    except:
                        pass
                    
                    row_loc.evaluate("el => el.click()")
                    page.mouse.move(0, 0)
                    page.wait_for_timeout(300)

                    # ----- XỬ LÝ MAP ID VÀ LƯU DATA -----
                    # champ_hex_map: {"TFT17_Akali": 2, "TFT17_Briar": 5, ...}
                    # HEX_POSITION_MAP: {2: {row:0, col:5}, ...}
                    units = []
                    for u in basic_data['units']:
                        u_name = u['name']
                        if not u_name: continue
                        
                        # Lấy champion ID (dạng TFT17_Akali) để lookup hex
                        # Thử map từ tên tiếng Anh sang ID qua champ_map
                        champ_id = champ_map.get(u_name, u_name)
                        
                        # Tìm hex index: dùng TFT slug (match với fill URL trong SVG)
                        tft_slug = tft_slug_map.get(u_name, '')
                        hex_idx = None
                        
                        if tft_slug:
                            for idx, h_item in enumerate(remaining_hexes):
                                if h_item['champ'] == tft_slug:
                                    hex_idx = h_item['hex']
                                    remaining_hexes.pop(idx) # Lấy ra rồi thì xóa để con sau không bị trùng
                                    break
                        
                        # Fallback: thử tìm bằng các biến thể khác của slug
                        if hex_idx is None and u_name:
                            name_clean = u_name.lower().replace(' ', '').replace("'", '')
                            for idx, h_item in enumerate(remaining_hexes):
                                if name_clean in h_item['champ'].lower():
                                    hex_idx = h_item['hex']
                                    remaining_hexes.pop(idx)
                                    break
                        
                        row = HEX_POSITION_MAP.get(hex_idx)  # int (0-3) hoặc None
                        
                        units.append({
                            "champion": champ_id,
                            "is_three_star": u['is_three_star'],
                            "items": [item_map.get(i_name, i_name) for i_name in u['items']],
                            "position": {
                                "hex": hex_idx,   # ô số mấy trên bàn (0-27), FE tính col_in_row = hex % 7
                                "row": row        # hàng (0=front gần địch, 3=back xa địch)
                            }
                        })

                    carousel_priority = []
                    for alt in details_data.get('carousel', []):
                        item_id = item_map.get(alt)
                        if item_id and item_id not in carousel_priority: 
                            carousel_priority.append(item_id)
                            
                    early_boards = {}
                    for cap_name, champs in details_data.get('early', {}).items():
                        board_units = [champ_map[c] for c in champs if c in champ_map]
                        if board_units:
                            level_num = cap_name.replace("Cấp ", "").strip()
                            early_boards[f"level_{level_num}"] = board_units

                    leveling_guide = {}
                    raw_lvl = details_data.get('raw_leveling', "")
                    if raw_lvl:
                        caps = re.findall(r"Cấp (\d+)", raw_lvl)
                        rounds = re.findall(r"(\d-\d+)", raw_lvl)
                        if len(caps) > 1 and "Lên Cấp: Cấp" in raw_lvl: caps = caps[1:]
                        if len(caps) > len(rounds) and len(rounds) > 0: caps = caps[-len(rounds):]
                        for j in range(min(len(caps), len(rounds))):
                            leveling_guide[f"level_{caps[j]}"] = rounds[j]

                    recommended_augments = []
                    for aug in details_data.get('augments', []):
                        aug_id = aug_map.get(aug, aug) 
                        if aug_id not in recommended_augments:
                            recommended_augments.append(aug_id)

                    stats_arr = basic_data.get('stats', [])
                    if units:
                        final_data.append({
                            "name": name,
                            "tier": basic_data.get('tier'),
                            "playstyle": details_data.get('playstyle', 'Trung Bình'),
                            "avg_placement": clean_float(stats_arr[0] if len(stats_arr)>0 else ""),
                            "pick_rate": clean_float(stats_arr[1] if len(stats_arr)>1 else ""),
                            "win_rate": clean_float(stats_arr[2] if len(stats_arr)>2 else ""),
                            "top4_rate": clean_float(stats_arr[3] if len(stats_arr)>3 else ""),
                            "final_board": units,
                            "early_boards": early_boards,
                            "leveling_guide": leveling_guide,
                            "carousel_priority": carousel_priority,
                            "recommended_augments": recommended_augments
                        })
                        seen_names.add(name)
                        print(f"⚡ [{basic_data.get('tier')}] {name} - Lõi: {len(recommended_augments)} | Form: {len(early_boards)}")
                        
                        processed_any = True
                        break 

                except Exception as e:
                    continue 

            if not processed_any:
                page.mouse.wheel(0, 1500)
                time.sleep(2)

                if len(final_data) == last_len:
                    patience += 1
                else:
                    patience = 0
                
                last_len = len(final_data)
                if patience > 3: break 

        browser.close()

    return final_data

if __name__ == "__main__":
    data = scrape_live_metatft_vi()
    with open("comps_final_ready.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"\n🚀 ĐỈNH CAO CHÂN TRỜI MỚI! Đã cào {len(data)} đội hình (Sạch Lỗi, Chuẩn Database) VÀO comps_final_ready.json")