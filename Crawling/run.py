"""
Scraper for https://www.metatft.com/traits using requests + BeautifulSoup4.

NOTE: metatft.com is a React/JS-rendered SPA. The raw HTML from a simple
requests.get() will NOT contain trait data. This script uses two strategies:

  Strategy A (fast)     - Hit known JSON API / CDN endpoints that the SPA
                          fetches internally (Community Dragon, metatft API).
  Strategy B (fallback) - Use Selenium (headless Chrome) to render the page,
                          then parse the resulting HTML with BeautifulSoup4.

Requirements:
    pip install requests beautifulsoup4 selenium webdriver-manager
    python run.py
"""

# Force UTF-8 stdout so Unicode prints work on Windows (cp1252 default).
import io
import sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import json
import time

import requests
from bs4 import BeautifulSoup


# ─────────────────────────── constants ──────────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/html, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.metatft.com/",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)

# Candidate JSON endpoints (checked in order)
JSON_CANDIDATES = [
    "https://api.metatft.com/tft/traits",
    "https://api.metatft.com/tft/trait_stats",
    "https://api.metatft.com/public/tft/traits",
    # Community Dragon — Tiếng Việt (vi_vn) trước, fallback về en_us
    "https://raw.communitydragon.org/latest/cdragon/tft/vi_vn.json",
    "https://raw.communitydragon.org/latest/cdragon/tft/en_us.json",
]


# ─────────────── Strategy A: JSON API / CDN endpoints ───────────────────────

def try_json_apis() -> list[dict] | None:
    """Try each JSON endpoint and return traits if found."""
    for url in JSON_CANDIDATES:
        try:
            print(f"  Trying: {url}")
            r = SESSION.get(url, timeout=20)
            if r.status_code != 200:
                print(f"    -> HTTP {r.status_code}, skipping")
                continue
            ct = r.headers.get("Content-Type", "")
            if "json" not in ct:
                print(f"    -> Content-Type '{ct}' not JSON, skipping")
                continue
            data = r.json()
            traits = _parse_json(data, url)
            if traits:
                print(f"  [OK] {len(traits)} traits from {url}")
                return traits
            print("    -> Parsed but 0 traits found")
        except Exception as exc:
            print(f"    -> Error: {exc}")
    return None


def _parse_json(data: dict | list, source: str) -> list[dict]:
    """Normalize various JSON shapes into a flat list of trait dicts."""
    traits = []

    # ── Community Dragon: {"sets": {"N": {"traits": [...]}}} ──
    if isinstance(data, dict) and "sets" in data:
        sets: dict = data["sets"]
        try:
            latest = str(max(int(k) for k in sets.keys()))
        except ValueError:
            latest = list(sets.keys())[-1]

        for t in sets[latest].get("traits", []):
            traits.append({
                "name": t.get("name", ""),
                "description": t.get("desc", ""),
                "breakpoints": [
                    e.get("minUnits") for e in t.get("effects", [])
                    if e.get("minUnits") is not None
                ],
                "source": source,
            })
        return traits

    # ── Simple list of objects ──
    if isinstance(data, list):
        for item in data:
            if isinstance(item, dict) and ("name" in item or "trait_name" in item):
                traits.append({
                    "name": item.get("name") or item.get("trait_name", ""),
                    "description": item.get("description") or item.get("desc", ""),
                    "breakpoints": item.get("breakpoints") or item.get("levels", []),
                    "source": source,
                })
        return traits

    # ── Dict with "traits" key ──
    if isinstance(data, dict) and "traits" in data:
        return _parse_json(data["traits"], source)

    return traits


# ──────────── Strategy B: Selenium headless + BeautifulSoup4 ─────────────────

def try_selenium_scrape() -> list[dict] | None:
    """Render metatft.com/traits with headless Chrome and parse with BS4."""
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support import expected_conditions as EC
        from selenium.webdriver.support.ui import WebDriverWait
        from webdriver_manager.chrome import ChromeDriverManager
    except ImportError:
        print("  selenium / webdriver-manager not installed.")
        print("  Install: pip install selenium webdriver-manager")
        return None

    url = "https://www.metatft.com/traits"
    print(f"  Launching headless Chrome -> {url}")

    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1920,1080")
    opts.add_argument(f"user-agent={HEADERS['User-Agent']}")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=opts,
    )
    try:
        driver.get(url)
        # Wait until at least one trait link/row appears
        wait = WebDriverWait(driver, 30)
        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "a[class*='StatLink'], a[href*='/traits/'], table tr")
        ))
        time.sleep(2)  # allow lazy-loaded rows to settle
        html = driver.page_source
    finally:
        driver.quit()

    return _parse_html(html)


def _parse_html(html: str) -> list[dict]:
    """Parse rendered HTML with BeautifulSoup4."""
    soup = BeautifulSoup(html, "html.parser")
    traits: list[dict] = []
    seen: set[str] = set()

    # ── Primary: trait <a> links ──
    links = soup.select("a[class*='StatLink'], a[href*='/traits/']")
    for a in links:
        href = a.get("href", "")
        if href in ("", "/traits", "/traits/"):
            continue

        name = a.get_text(strip=True)
        if not name or name in seen:
            continue
        seen.add(name)

        # Look for sibling numbers (breakpoints) in the same row/card
        row = a.find_parent("tr") or a.find_parent("div")
        breakpoints: list[int] = []
        if row:
            for text in row.stripped_strings:
                if text.isdigit():
                    breakpoints.append(int(text))

        traits.append({
            "name": name,
            "slug": href.rstrip("/").split("/")[-1],
            "breakpoints": sorted(set(breakpoints)),
            "detail_url": (
                f"https://www.metatft.com{href}"
                if href.startswith("/") else href
            ),
        })

    # ── Fallback: generic table rows ──
    if not traits:
        for row in soup.select("tr"):
            cells = row.find_all("td")
            if len(cells) >= 2:
                name = cells[0].get_text(strip=True)
                if name and name not in seen:
                    seen.add(name)
                    traits.append({
                        "name": name,
                        "raw_cells": [c.get_text(strip=True) for c in cells],
                    })

    return traits


# ─────────────────────────────── main ────────────────────────────────────────

def main() -> None:
    print("=" * 60)
    print("  MetaTFT Traits Scraper  -  metatft.com/traits")
    print("=" * 60)

    # Strategy A
    print("\n[Strategy A] Fetching from JSON API / CDN …")
    traits = try_json_apis()

    # Strategy B
    if not traits:
        print("\n[Strategy B] Rendering page with Selenium + BeautifulSoup4 …")
        traits = try_selenium_scrape()

    if not traits:
        print("\n[FAIL] Could not retrieve any traits.")
        sys.exit(1)

    # Print summary
    print(f"\n[OK] Scraped {len(traits)} traits.\n")
    for i, t in enumerate(traits, 1):
        bp_str = ", ".join(str(b) for b in t.get("breakpoints", [])) or "-"
        print(f"  {i:>3}. {t['name']:<30}  breakpoints: [{bp_str}]")
        if t.get("description"):
            print(f"       {t['description'][:100]}")

    # Save output
    out_file = "traits.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(traits, f, ensure_ascii=False, indent=2)
    print(f"\n[OK] Saved {len(traits)} traits to '{out_file}'")


if __name__ == "__main__":
    main()