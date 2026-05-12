import os
import sys
import io
import json
import psycopg2
from psycopg2.extras import execute_values, Json
from dotenv import load_dotenv

# Đặt mã hóa UTF-8 cho stdout trên Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import re
import unicodedata

def slugify(text):
    if not text: return ""
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

# Đường dẫn thư mục chứa file JSON
DATA_DIR = os.path.dirname(os.path.abspath(__file__))

# Tải biến môi trường từ .env của thư mục hiện tại (Crawling)
env_path = os.path.join(DATA_DIR, '.env')
load_dotenv(env_path)

# Lấy thông tin kết nối từ .env
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "tft_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASSWORD", "postgres")
DB_PORT = os.getenv("DB_PORT", "5432")

def get_connection():
    # Hoặc có thể sử dụng DATABASE_URL nếu có
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        return psycopg2.connect(db_url)
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        port=DB_PORT
    )

def create_tables(conn):
    with conn.cursor() as cur:
        # Xóa bảng cũ nếu tồn tại (cẩn thận khi chạy ở production)
        cur.execute("""
            DROP TABLE IF EXISTS champion_item_stats CASCADE;
            DROP TABLE IF EXISTS champion_build_stats CASCADE;
            DROP TABLE IF EXISTS champion_traits CASCADE;
            DROP TABLE IF EXISTS champions CASCADE;
            DROP TABLE IF EXISTS skills CASCADE;
            DROP TABLE IF EXISTS traits CASCADE;
            DROP TABLE IF EXISTS items CASCADE;
            DROP TABLE IF EXISTS augments CASCADE;
            DROP TABLE IF EXISTS gods CASCADE;
            DROP TABLE IF EXISTS comps CASCADE;
        """)

        # 1. Bảng Items
        cur.execute("""
            CREATE TABLE items (
                id INTEGER PRIMARY KEY,
                name VARCHAR(255),
                slug VARCHAR(255),
                category VARCHAR(255),
                rank VARCHAR(50),
                avg_placement VARCHAR(50),
                win_rate VARCHAR(50),
                frequency VARCHAR(50),
                description TEXT,
                stats JSONB,
                component_1 VARCHAR(255),
                component_2 VARCHAR(255),
                image VARCHAR(500)
            );
        """)

        # 2. Bảng Traits (Tộc/Hệ)
        cur.execute("""
            CREATE TABLE traits (
                id INTEGER PRIMARY KEY,
                name VARCHAR(255),
                slug VARCHAR(255),
                tier VARCHAR(50),
                placement VARCHAR(50),
                top4 VARCHAR(50),
                pick_count VARCHAR(50),
                pick_percent VARCHAR(50),
                description TEXT,
                milestones JSONB,
                image VARCHAR(500)
            );
        """)

        # 3. Bảng Skills (Kỹ Năng)
        cur.execute("""
            CREATE TABLE skills (
                id INTEGER PRIMARY KEY,
                name VARCHAR(255),
                slug VARCHAR(255),
                mana_start INTEGER,
                mana_max INTEGER,
                description TEXT,
                ability_stats JSONB,
                icon_path VARCHAR(500)
            );
        """)

        # 4. Bảng Champions (Tướng)
        cur.execute("""
            CREATE TABLE champions (
                id INTEGER PRIMARY KEY,
                name VARCHAR(255),
                slug VARCHAR(255),
                cost INTEGER,
                rank VARCHAR(50),
                avg_placement VARCHAR(50),
                win_rate VARCHAR(50),
                games_played VARCHAR(50),
                pick_rate VARCHAR(50),
                skill_id INTEGER REFERENCES skills(id) ON DELETE SET NULL,
                base_stats JSONB,
                icon_path VARCHAR(500),
                splash_path VARCHAR(500)
            );
        """)

        # 5. Bảng Champion Traits
        cur.execute("""
            CREATE TABLE champion_traits (
                id INTEGER PRIMARY KEY,
                champion_id INTEGER REFERENCES champions(id) ON DELETE CASCADE,
                trait_id INTEGER REFERENCES traits(id) ON DELETE CASCADE
            );
        """)

        # 6. Bảng Champion Build Stats (Lối Chơi)
        cur.execute("""
            CREATE TABLE champion_build_stats (
                id INTEGER PRIMARY KEY,
                champion_id INTEGER REFERENCES champions(id) ON DELETE CASCADE,
                tier VARCHAR(50),
                item_1_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
                item_1_name VARCHAR(255),
                item_2_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
                item_2_name VARCHAR(255),
                item_3_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
                item_3_name VARCHAR(255),
                avg_placement VARCHAR(50),
                win_rate VARCHAR(50)
            );
        """)

        # 7. Bảng Champion Item Stats (Trang Bị Của Tướng)
        cur.execute("""
            CREATE TABLE champion_item_stats (
                id INTEGER PRIMARY KEY,
                champion_id INTEGER REFERENCES champions(id) ON DELETE CASCADE,
                rank_priority INTEGER,
                item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
                item_name VARCHAR(255),
                tier VARCHAR(50),
                avg_placement VARCHAR(50),
                win_rate VARCHAR(50),
                match_count VARCHAR(50),
                pick_percent VARCHAR(50)
            );
        """)

        # 8. Bảng Augments (Nâng Cấp)
        cur.execute("""
            CREATE TABLE augments (
                id INTEGER PRIMARY KEY,
                name VARCHAR(255),
                slug VARCHAR(255),
                tier INTEGER,
                rank VARCHAR(50),
                description TEXT,
                image VARCHAR(500)
            );
        """)

        # 9. Bảng Gods (Thần)
        cur.execute("""
            CREATE TABLE gods (
                id INTEGER PRIMARY KEY,
                name VARCHAR(255),
                slug VARCHAR(255),
                trait VARCHAR(255),
                rank VARCHAR(50),
                stages JSONB,
                image VARCHAR(500),
                boon_augment_id INTEGER
            );
        """)

        # 10. Bảng Comps (Đội Hình)
        cur.execute("""
            CREATE TABLE comps (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                slug VARCHAR(255) UNIQUE,
                tier VARCHAR(50),
                playstyle VARCHAR(255),
                avg_placement VARCHAR(50),
                pick_rate VARCHAR(50),
                win_rate VARCHAR(50),
                top4_rate VARCHAR(50),
                final_board JSONB,
                early_boards JSONB,
                leveling_guide JSONB,
                carousel_priority JSONB,
                recommended_augments JSONB
            );
        """)
        conn.commit()

def load_json(filename):
    filepath = os.path.join(DATA_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            content = content.replace("https://pub-4ca9b263aabc47338081a76c5a3a687c.r2.dev", "https://cdn.tftmeta.gg")
            return json.loads(content)
    return []

def insert_data(conn):
    with conn.cursor() as cur:
        # 1. Insert Items
        print("Inserting items...")
        items = load_json('items.json')
        if items:
            query = """
                INSERT INTO items (id, name, slug, category, rank, avg_placement, win_rate, frequency, description, stats, component_1, component_2, image)
                VALUES %s
            """
            values = [[
                i.get('id') if i.get('id') is not None else idx + 1,
                i.get('name'), i.get('slug'), i.get('category'), i.get('rank'),
                i.get('avg_placement'), i.get('win_rate'), i.get('frequency'), i.get('description'),
                Json(i.get('stats', {})), i.get('component_1'), i.get('component_2'), i.get('image')
            ] for idx, i in enumerate(items)]
            execute_values(cur, query, values)

        # 2. Insert Traits
        print("Inserting traits...")
        traits = load_json('traits.json')
        if traits:
            query = """
                INSERT INTO traits (id, name, slug, tier, placement, top4, pick_count, pick_percent, description, milestones, image)
                VALUES %s
            """
            values = [[
                t.get('id') if t.get('id') is not None else idx + 1,
                t.get('name'), t.get('slug'), t.get('tier'), str(t.get('placement')),
                t.get('top4'), t.get('pick_count'), t.get('pick_percent'),
                t.get('description'), Json(t.get('milestones', [])), t.get('image')
            ] for idx, t in enumerate(traits)]
            execute_values(cur, query, values)

        # 3. Insert Skills
        print("Inserting skills...")
        skills = load_json('skills.json')
        if skills:
            query = """
                INSERT INTO skills (id, name, slug, mana_start, mana_max, description, ability_stats, icon_path)
                VALUES %s
            """
            values = [[
                s.get('id') if s.get('id') is not None else idx + 1,
                s.get('name'), s.get('slug'), s.get('mana_start'), s.get('mana_max'),
                s.get('description'), Json(s.get('ability_stats', {})), s.get('icon_path')
            ] for idx, s in enumerate(skills)]
            execute_values(cur, query, values)

        # 4. Insert Champions
        print("Inserting champions...")
        champions = load_json('champions.json')
        if champions:
            query = """
                INSERT INTO champions (id, name, slug, cost, rank, avg_placement, win_rate, games_played, pick_rate, skill_id, base_stats, icon_path, splash_path)
                VALUES %s
            """
            values = [[
                c.get('id') if c.get('id') is not None else idx + 1,
                c.get('name'), c.get('slug'), c.get('cost'), c.get('rank'),
                c.get('avg_placement'), c.get('win_rate'), c.get('games_played'), c.get('pick_rate'),
                c.get('skill_id'), Json(c.get('base_stats', {})), c.get('icon_path'), c.get('splash_path')
            ] for idx, c in enumerate(champions)]
            execute_values(cur, query, values)

        # 5. Insert Champion Traits
        print("Inserting champion traits...")
        champ_traits = load_json('champion_traits.json')
        if champ_traits:
            # Lọc bỏ những row có trait_id = null
            filtered_ct = [ct for ct in champ_traits if ct.get('trait_id') is not None]
            query = "INSERT INTO champion_traits (id, champion_id, trait_id) VALUES %s"
            values = [[ct.get('id'), ct.get('champion_id'), ct.get('trait_id')] for ct in filtered_ct]
            execute_values(cur, query, values)

        # 6. Insert Champion Build Stats
        print("Inserting champion build stats...")
        builds = load_json('champion_build_stats.json')
        if builds:
            query = """
                INSERT INTO champion_build_stats (id, champion_id, tier, item_1_id, item_1_name, item_2_id, item_2_name, item_3_id, item_3_name, avg_placement, win_rate)
                VALUES %s
            """
            values = [[
                b.get('id'), b.get('champion_id'), b.get('tier'),
                b.get('item_1_id'), b.get('item_1_name'),
                b.get('item_2_id'), b.get('item_2_name'),
                b.get('item_3_id'), b.get('item_3_name'),
                b.get('avg_placement'), b.get('win_rate')
            ] for b in builds]
            execute_values(cur, query, values)

        # 7. Insert Champion Item Stats
        print("Inserting champion item stats...")
        item_stats = load_json('champion_item_stats.json')
        if item_stats:
            query = """
                INSERT INTO champion_item_stats (id, champion_id, rank_priority, item_id, item_name, tier, avg_placement, win_rate, match_count, pick_percent)
                VALUES %s
            """
            values = [[
                s.get('id'), s.get('champion_id'), s.get('rank_priority'),
                s.get('item_id'), s.get('item_name'), s.get('tier'),
                s.get('avg_placement'), s.get('win_rate'),
                s.get('match_count'), s.get('pick_percent')
            ] for s in item_stats]
            execute_values(cur, query, values)

        # 8. Insert Augments
        print("Inserting augments...")
        augments = load_json('augments.json')
        if augments:
            query = """
                INSERT INTO augments (id, name, slug, tier, rank, description, image)
                VALUES %s
            """
            values = [[
                a.get('id') if a.get('id') is not None else idx + 1,
                a.get('name'), a.get('slug'), a.get('tier'), a.get('rank'),
                a.get('description'), a.get('image')
            ] for idx, a in enumerate(augments)]
            execute_values(cur, query, values)

        # 9. Insert Gods
        print("Inserting gods...")
        gods = load_json('gods.json')
        if gods:
            query = """
                INSERT INTO gods (id, name, slug, trait, rank, stages, image, boon_augment_id)
                VALUES %s
            """
            values = [[
                g.get('id') if g.get('id') is not None else idx + 1,
                g.get('name'), g.get('slug'), g.get('trait'), g.get('rank'),
                Json(g.get('stages', [])), g.get('image'), g.get('boon_augment_id')
            ] for idx, g in enumerate(gods)]
            execute_values(cur, query, values)

        # 10. Insert Comps
        print("Inserting comps...")
        comps = load_json('comps_final_ready.json')
        if comps:
            query = """
                INSERT INTO comps (name, slug, tier, playstyle, avg_placement, pick_rate, win_rate, top4_rate, final_board, early_boards, leveling_guide, carousel_priority, recommended_augments)
                VALUES %s
            """
            values = [[
                c.get('name'), slugify(c.get('name')), c.get('tier'), c.get('playstyle'),
                c.get('avg_placement'), c.get('pick_rate'), c.get('win_rate'), c.get('top4_rate'),
                Json(c.get('final_board', [])), Json(c.get('early_boards', {})),
                Json(c.get('leveling_guide', {})), Json(c.get('carousel_priority', [])),
                Json(c.get('recommended_augments', []))
            ] for c in comps]
            execute_values(cur, query, values)

        conn.commit()

if __name__ == "__main__":
    try:
        conn = get_connection()
        print("✅ Kết nối PostgreSQL thành công.")
        print("Đang tạo bảng...")
        create_tables(conn)
        print("Đang chèn dữ liệu...")
        insert_data(conn)
        print("✅ Đã chèn dữ liệu hoàn tất!")
        conn.close()
    except Exception as e:
        print(f"❌ Lỗi: {e}")
