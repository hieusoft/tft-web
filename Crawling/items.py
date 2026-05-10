import sys, io, re, html, json, unicodedata, os, mimetypes, time
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
import boto3
from dotenv import load_dotenv

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
load_dotenv()

_DIR        = os.path.dirname(os.path.abspath(__file__))
JSON_OUT    = os.path.join(_DIR, "items.json")
R2_FOLDER   = "items"
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

CATEGORIES = [
    ("Thường",    "https://www.metatft.com/items/normal"),
    ("Tạo Tác",   "https://www.metatft.com/items/artifact"),
    ("Ánh Sáng",  "https://www.metatft.com/items/radiant"),
    ("Ấn Tộc/Hệ", "https://www.metatft.com/items/emblem"),
    ("Tộc/Hệ",    "https://www.metatft.com/items/trait"),
    ("Hỗ Trợ",    "https://www.metatft.com/items"),
]

def setup_driver():
    opts = Options()
    for arg in ["--headless", "--no-sandbox", "--disable-dev-shm-usage", "--window-size=1920,1080", "--lang=vi"]:
        opts.add_argument(arg)
    opts.add_experimental_option("prefs", {"intl.accept_languages": "vi,vi-VN"})
    opts.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
    return webdriver.Chrome(options=opts)

def slugify(text: str) -> str:
    if not text: return "unknown"
    text = text.lower()
    text = text.replace('đ', 'd').replace('Đ', 'd')
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def clean_img_url(url: str) -> str:
    if not url: return ""
    if "cdn-cgi/image" in url:
        match = re.search(r'(https://cdn\.metatft\.com/file/.+)', url)
        if match:
            return match.group(1)
    return url

def get_ext_from_url(url: str) -> str:
    if not url: return "png"
    ext = url.split(".")[-1].split("?")[0].lower()
    return ext if ext in {"png", "jpg", "jpeg", "webp"} else "png"


STAT_MAP = {
    "AD": "SMCK",
    "AP": "SMPT",
    "AS": "Tốc Độ Đánh",
    "Armor": "Giáp",
    "MagicResist": "Kháng Phép",
    "Health": "Máu",
    "Mana": "Năng Lượng",
    "CritChance": "Tỉ Lệ Chí Mạng",
    "CritDamage": "Sát Thương Chí Mạng",
    "DodgeChance": "Tỉ Lệ Né Tránh",
    "Omnivamp": "Hút Máu Toàn Phần",
    "StatOmnivamp": "Hút Máu Toàn Phần",
    "OmnivampEffectiveness": "Hiệu Quả Hút Máu",
    "SplashDamage": "Sát Thương Lan",
    "HexRange": "Tầm Đánh",
    "BriarHitsOnCast": "Đòn Đánh Của Briar",
    "Frequency": "Tần Suất",
    "AuroraAPOnHit": "SMPT Của Aurora",
    "DecayingAS": "Tốc Độ Đánh Giảm Dần",
    "Duration": "Thời Gian (Giây)",
    "ExecuteThresholdForTarget": "Ngưỡng Máu Kết Liễu",
    "BonusDamage": "Sát Thương Thêm",
    "Shield": "Lá Chắn",
    "Heal": "Hồi Máu",
    "DamageReduction": "Giảm Sát Thương",
    "MaxHealth": "Máu Tối Đa",
}

EXTRA_MAP = {
    '1StarAoEDamage': 'Sát Thương Diện Rộng 1 Sao',
    '2StarAoEDamage': 'Sát Thương Diện Rộng 2 Sao',
    '3StarAoEDamage': 'Sát Thương Diện Rộng 3 Sao',
    '4StarAoEDamage': 'Sát Thương Diện Rộng 4 Sao',
    'ADAPPerTakedown': 'SMCK/SMPT Mỗi Hạ Gục',
    'ADDamage': 'SMCK',
    'ADOnAttack': 'SMCK Mỗi Đòn Đánh',
    'ADPerBonus': 'SMCK Mỗi Thưởng',
    'AD_NotStatBar': 'SMCK',
    'ADandAPPerTick': 'SMCK/SMPT Mỗi Giây',
    'APGain': 'SMPT Nhận Được',
    'APLoss': 'SMPT Mất Đi',
    'APPerBonus': 'SMPT Mỗi Thưởng',
    'APPerInterval': 'SMPT Mỗi Chu Kỳ',
    'APScalar': 'Tỉ Lệ SMPT',
    'APToGrant': 'SMPT Tăng Thêm',
    'AP_NotStatBar': 'SMPT',
    'ARReductionAmount': 'Lượng Giảm Giáp',
    'ASCapstone': 'Mốc Tốc Độ Đánh',
    'ASPerMissingHealthPercent': 'Tốc Độ Đánh Mỗi % Máu Đã Mất',
    'ASPerStack': 'Tốc Độ Đánh Mỗi Cộng Dồn',
    'ASStriker': 'Tốc Độ Đánh Đột Kích',
    'ASTeam': 'Tốc Độ Đánh Đội',
    'AbilityDA': 'Sát Thương Kỹ Năng',
    'AllyHealing': 'Hồi Máu Đồng Minh',
    'ArmorBreakDuration': 'Thời Gian Phá Giáp',
    'ArmorPerEnemy': 'Giáp Mỗi Kẻ Địch',
    'ArmorReductionPercent': '% Giảm Giáp',
    'ArmorStealPerTick': 'Giáp Đánh Cắp Mỗi Giây',
    'ArmorStriker': 'Giáp Đột Kích',
    'ArmorTeam': 'Giáp Đội',
    'ArrowDamagePercent': '% Sát Thương Mũi Tên',
    'ArrowsOnTakedown': 'Mũi Tên Khi Hạ Gục',
    'AttackPct': '% Đòn Đánh',
    'AttackSpeed': 'Tốc Độ Đánh',
    'AttackSpeedCap': 'Giới Hạn Tốc Độ Đánh',
    'AttackSpeedGoldLimit': 'Giới Hạn Vàng Tốc Độ Đánh',
    'AttackSpeedPerGold': 'Tốc Độ Đánh Mỗi Vàng',
    'AttackSpeedPerStack': 'Tốc Độ Đánh Mỗi Cộng Dồn',
    'AutoDamageReduction': 'Giảm Sát Thương Tự Động',
    'BacklineADAP': 'SMCK/SMPT Tuyến Sau',
    'BaseDamage': 'Sát Thương Cơ Bản',
    'BaseDamageReduction': 'Giảm Sát Thương Cơ Bản',
    'BaseDurability': 'Chống Chịu Cơ Bản',
    'BaseHeal': 'Hồi Máu Cơ Bản',
    'BaseHealthPerStack': 'Máu Cơ Bản Mỗi Cộng Dồn',
    'BaseManaOnHit': 'Năng Lượng Cơ Bản Mỗi Đòn',
    'BaseResistsPerStack': 'Kháng Cơ Bản Mỗi Cộng Dồn',
    'BleedDuration': 'Thời Gian Chảy Máu',
    'BonusArmorMR': 'Giáp/Kháng Phép Thêm',
    'BonusAttackSpeed': 'Tốc Độ Đánh Thêm',
    'BonusOmnivamp': 'Hút Máu Toàn Phần Thêm',
    'BonusPercentHP': '% Máu Thêm',
    'BonusResistDuration': 'Thời Gian Kháng Thêm',
    'BonusResists': 'Kháng Thêm',
    'BuffDamageAmp': 'Khuếch Đại Sát Thương Buff',
    'BuffDuration': 'Thời Gian Buff',
    'BurnDuration': 'Thời Gian Thiêu Đốt',
    'BurnPercent': '% Thiêu Đốt',
    'CasterDuration_TOOLTIPONLY': 'Thời Gian Niệm',
    'CasterHPRatio_TOOLTIPONLY': 'Tỉ Lệ Máu Người Niệm',
    'CasterHexRadius_TOOLTIPONLY': 'Tầm Lục Giác Niệm',
    'CasterManaSpent_TOOLTIPONLY': 'Năng Lượng Tiêu Hao',
    'ChanceToProc': 'Tỉ Lệ Kích Hoạt',
    'CleaveDamage': 'Sát Thương Đánh Lan',
    'CombatStartMana': 'Năng Lượng Đầu Giao Tranh',
    'Cooldown': 'Thời Gian Hồi',
    'CritDamageBonusPercent': '% Sát Thương Chí Mạng Thêm',
    'Damage': 'Sát Thương',
    'DamageAmp': 'Khuếch Đại Sát Thương',
    'DamageAmpPerHex': 'Khuếch Đại Sát Thương Mỗi Ô',
    'DamageIncrease': 'Tăng Sát Thương',
    'DamageIncreasePercent': '% Tăng Sát Thương',
    'DamageRepeat': 'Sát Thương Lặp Lại',
    'DamageShare': 'Chia Sẻ Sát Thương',
    'DamageStore': 'Sát Thương Lưu Trữ',
    'DamageToHealthConversion': 'Chuyển Hóa Sát Thương Thành Máu',
    'Delay': 'Độ Trễ',
    'DoublestrikeChance': 'Tỉ Lệ Đánh Đôi',
    'Durability': 'Chống Chịu',
    'EmpowerDamageReduction': 'Giảm Sát Thương Cường Hóa',
    'EmpoweredDurability': 'Chống Chịu Cường Hóa',
    'ExecutePercent': '% Máu Kết Liễu',
    'ExtraADandAP': 'SMCK/SMPT Cực Đại',
    'ExtraHealth': 'Máu Cực Đại',
    'FighterAD_TOOLTIPONLY': 'SMCK Đấu Sĩ',
    'FighterAP_TOOLTIPONLY': 'SMPT Đấu Sĩ',
    'FighterHealthThreshold_TOOLTIPONLY': 'Ngưỡng Máu Đấu Sĩ',
    'FlatMagicDamage': 'Sát Thương Phép',
    'FlatManaReduction': 'Lượng Giảm Năng Lượng',
    'FlatManaRestore': 'Lượng Hồi Năng Lượng',
    'FrontlineResists': 'Kháng Tuyến Đầu',
    'GoldAmount': 'Lượng Vàng',
    'GoldAtFullStacks': 'Vàng Khi Đầy Cộng Dồn',
    'GoldChance': 'Tỉ Lệ Vàng',
    'GoldDropChance': 'Tỉ Lệ Rớt Vàng',
    'GoldInterval': 'Chu Kỳ Vàng',
    'GoldPerProc': 'Vàng Mỗi Kích Hoạt',
    'GrievousWoundsPercent': '% Vết Thương Sâu',
    'GrooveDuration': 'Thời Gian Quẩy',
    'HPThreshold': 'Ngưỡng Máu',
    'HealPct': '% Hồi Máu',
    'HealTickRate': 'Chu Kỳ Hồi Máu',
    'HealingPercentPerTickPerStage': '% Hồi Máu Mỗi Giây Theo Vòng',
    'HealingReductionPct': '% Giảm Hồi Máu',
    'HealthPerMissile': 'Máu Mỗi Mũi Tên',
    'HealthPercBonus': '% Máu Thêm',
    'HealthPercent': '% Máu',
    'HealthRatio': 'Tỉ Lệ Máu',
    'HealthRegenInterval': 'Chu Kỳ Hồi Máu',
    'HealthThreshold': 'Ngưỡng Máu',
    'HealthThreshold1': 'Ngưỡng Máu 1',
    'HealthThreshold2': 'Ngưỡng Máu 2',
    'HealthThreshold3': 'Ngưỡng Máu 3',
    'HealthThreshold4': 'Ngưỡng Máu 4',
    'HexFalloff': 'Giảm Sát Thương Theo Ô',
    'HexRadius': 'Bán Kính Ô',
    'HexRadiusBase': 'Bán Kính Ô Cơ Bản',
    'HexRangeIncrease': 'Tăng Tầm Đánh',
    'HexRangeIncreasePerProc': 'Tăng Tầm Đánh Mỗi Kích Hoạt',
    'HexRequirement': 'Yêu Cầu Ô',
    'ICD': 'Thời Gian Hồi Nội Bộ',
    'IgnorePainPercent': '% Phớt Lờ Đau Đớn',
    'IllaoiEffectiveness': 'Hiệu Quả Illaoi',
    'InitialPercentHealthStore': '% Máu Lưu Trữ Ban Đầu',
    'Interval': 'Chu Kỳ',
    'IntervalSeconds': 'Chu Kỳ (Giây)',
    'InvulnDuration': 'Thời Gian Bất Tử',
    'JinxPercentIncrease': '% Tăng Của Jinx',
    'LifeSteal': 'Hút Máu',
    'MRPerEnemy': 'Kháng Phép Mỗi Kẻ Địch',
    'MRReduction': 'Giảm Kháng Phép',
    'MRShred': 'Xuyên Kháng Phép',
    'MRShredDuration': 'Thời Gian Xuyên Kháng Phép',
    'MRStealPerTick': 'Kháng Phép Đánh Cắp Mỗi Giây',
    'ManaGain': 'Năng Lượng Nhận Được',
    'ManaOnCrit': 'Năng Lượng Khi Chí Mạng',
    'ManaPerProjectile': 'Năng Lượng Mỗi Đạn',
    'ManaPercIncrease': '% Tăng Năng Lượng',
    'ManaRatio': 'Tỉ Lệ Năng Lượng',
    'ManaReducePct': '% Giảm Năng Lượng',
    'ManaRegen': 'Hồi Năng Lượng',
    'ManaRegenOverTime': 'Hồi Năng Lượng Theo Thời Gian',
    'ManaRegenPerLoss': 'Hồi Năng Lượng Mỗi Tổn Thất',
    'ManaRegenPerMeep': 'Hồi Năng Lượng Mỗi Meep',
    'ManaRegenToGrant': 'Hồi Năng Lượng Tăng Thêm',
    'ManaSharePercent': '% Chia Sẻ Năng Lượng',
    'ManaSpent': 'Năng Lượng Đã Tiêu',
    'ManaThreshold': 'Ngưỡng Năng Lượng',
    'ManaToGrant': 'Năng Lượng Tăng Thêm',
    'MarksmanBonusAS_TOOLTIPONLY': 'Tốc Độ Đánh Thêm Của Xạ Thủ',
    'MarksmanKnockbackRange_TOOLTIPONLY': 'Tầm Đẩy Lùi Của Xạ Thủ',
    'MaxArmySizeIncrease': 'Tăng Quy Mô Đội Hình Tối Đa',
    'MaxHeal': 'Hồi Máu Tối Đa',
    'MaxHealthDamage': 'Sát Thương Theo Máu Tối Đa',
    'MaxHealthPercent': '% Máu Tối Đa',
    'MaxHealthPercentDamage': 'Sát Thương % Máu Tối Đa',
    'MaxHealthRegen': 'Hồi Máu Tối Đa',
    'MaxPerSpell': 'Tối Đa Mỗi Lần Niệm',
    'MaxStacks': 'Cộng Dồn Tối Đa',
    'MinimumTotalMana': 'Năng Lượng Tổng Tối Thiểu',
    'MissingHealthHeal': 'Hồi Máu Theo Máu Đã Mất',
    'MissingHealthPercent': '% Máu Đã Mất',
    'MissingHealthRestore': 'Phục Hồi Máu Đã Mất',
    'ModifiedADAP': 'SMCK/SMPT Sửa Đổi',
    'MonsterCap': 'Giới Hạn Quái',
    'NumArrows': 'Số Mũi Tên',
    'NumAttacks': 'Số Đòn Đánh',
    'NumBonusAttacks': 'Số Đòn Đánh Thêm',
    'NumCritsNeeded': 'Số Lần Chí Mạng Cần Thiết',
    'NumGrenades': 'Số Lựu Đạn',
    'NumMiracles': 'Số Phép Màu',
    'NumRockets': 'Số Tên Lửa',
    'NumTargets': 'Số Mục Tiêu',
    'NumUwUBlasts': 'Số Lần UwU',
    'PctMaxHP': '% Máu Tối Đa',
    'PercentAPShield': '% Lá Chắn SMPT',
    'PercentAttackDamageSplash': '% Sát Thương Lan SMCK',
    'PercentDR': '% Giảm Sát Thương',
    'PercentGoldChance': '% Tỉ Lệ Vàng',
    'PercentHPAttack': '% Đòn Đánh Theo Máu',
    'PercentHatLoss': '% Mất Mũ',
    'PercentHealing': '% Hồi Máu',
    'PercentHealthDamage': '% Sát Thương Theo Máu',
    'PercentHealthHeal': '% Hồi Máu Theo Máu',
    'PercentHealthShield': '% Lá Chắn Theo Máu',
    'PercentHealthStore': '% Lưu Trữ Máu',
    'PercentHealthThreshold': '% Ngưỡng Máu',
    'PercentMaxHP': '% Máu Tối Đa',
    'PercentMaxHealthSplash': '% Sát Thương Lan Máu Tối Đa',
    'PercentOfOverkill': '% Sát Thương Dư',
    'PercentOfResists': '% Chống Chịu',
    'PercentSpeedIncrease': '% Tăng Tốc Độ',
    'Period': 'Chu Kỳ',
    'PlayerHealth': 'Máu Người Chơi',
    'PrismaticNumTargets': 'Số Mục Tiêu Kim Cương',
    'ProcAttackSpeed': 'Tốc Độ Đánh Khi Kích Hoạt',
    'ReductionPerCast': 'Giảm Kháng Mỗi Lần Niệm',
    'ResistPercent': '% Kháng',
    'ResistReduce': 'Giảm Kháng',
    'ResistSteal': 'Đánh Cắp Kháng',
    'RocketDamagePercent': '% Sát Thương Tên Lửa',
    'Seconds': 'Giây',
    'ShieldBonusAP': 'SMPT Thêm Từ Lá Chắn',
    'ShieldCadence': 'Chu Kỳ Lá Chắn',
    'ShieldDuration': 'Thời Gian Lá Chắn',
    'ShieldHealthPercent': '% Máu Lá Chắn',
    'ShieldPercent': '% Lá Chắn',
    'ShieldSize': 'Lượng Lá Chắn',
    'ShredDuration': 'Thời Gian Trừ Giáp',
    'SizeIncrease': 'Tăng Kích Thước',
    'SpecialistMissileDamage_TOOLTIPONLY': 'Sát Thương Mũi Tên Chuyên Gia',
    'SpecialistNumStars_TOOLTIPONLY': 'Số Sao Chuyên Gia',
    'SpellShieldDuration': 'Thời Gian Khiên Phép',
    'StackCap': 'Giới Hạn Cộng Dồn',
    'StackedAmp': 'Khuếch Đại Cộng Dồn',
    'StackingAD': 'SMCK Cộng Dồn',
    'StackingSP': 'SMPT Cộng Dồn',
    'StackingStats': 'Chỉ Số Cộng Dồn',
    'StacksPerBonus': 'Cộng Dồn Mỗi Thưởng',
    'StatOmnivamp_NotStatBar': 'Hút Máu Toàn Phần',
    'StatsPerTakedown': 'Chỉ Số Mỗi Hạ Gục',
    'StealthDuration': 'Thời Gian Tàng Hình',
    'StunDuration': 'Thời Gian Choáng',
    'TankHP_TOOLTIPONLY': 'Máu Đỡ Đòn',
    'Threshold': 'Ngưỡng',
    'ThresholdForEmpower': 'Ngưỡng Cường Hóa',
    'TickRate': 'Chu Kỳ (Giây)',
    'TickRateWithAegisOfDawn': 'Chu Kỳ Có Khiên Bình Minh',
    'TickRateWithAegisOfDusk': 'Chu Kỳ Có Khiên Hoàng Hôn',
    'TicksPerSecond': 'Số Lần Mỗi Giây',
    'Timer': 'Đồng Hồ',
    'TotalHealRatio': 'Tỉ Lệ Tổng Hồi Máu',
    'TriggerMana': 'Năng Lượng Kích Hoạt',
    'TriggerRate': 'Tỉ Lệ Kích Hoạt',
    'TrueDamageConversion': 'Chuyển Hóa Sát Thương Chuẩn',
}

STAT_MAP.update(EXTRA_MAP)

def translate_key(k):
    if k in STAT_MAP: return STAT_MAP[k]
    parts = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?=[A-Z][a-z]|\d|\W|$)|\d+', k)
    if not parts: return k
    return " ".join(parts).title()

def clean_desc(text):
    if not text: return ""
    text = re.sub(r'<(?!/?br)[^>]+>', '', text, flags=re.IGNORECASE)
    return text.strip()

def format_stat(key, value):
    if value < 1 and value > 0:
        val_str = f"+{int(value * 100)}%"
    else:
        val_str = f"+{int(value)}"
    return translate_key(key), val_str

def r2_delete_folder(folder: str):
    try:
        all_keys = []
        paginator = s3.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=R2_BUCKET_NAME, Prefix=f"{folder}/"):
            all_keys.extend(obj["Key"] for obj in page.get("Contents", []))
        if not all_keys:
            return
        batches = [all_keys[i:i+1000] for i in range(0, len(all_keys), 1000)]
        def delete_batch(keys):
            s3.delete_objects(
                Bucket=R2_BUCKET_NAME,
                Delete={"Objects": [{"Key": k} for k in keys]},
            )
        with ThreadPoolExecutor(max_workers=5) as ex:
            list(ex.map(delete_batch, batches))
    except Exception:
        pass

def r2_put(data: bytes, r2_key: str, ext: str) -> str:
    mime_type = mimetypes.types_map.get(f".{ext}", "image/png")
    s3.put_object(
        Bucket=R2_BUCKET_NAME,
        Key=r2_key,
        Body=data,
        ContentType=mime_type,
    )
    return f"{R2_PUBLIC_URL}/{r2_key}"


_JS_GET_FIBER_DATA = """
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

function findData(propsArr) {
    for (const p of propsArr) {
        if (p.row && p.row.original) return p.row.original;
        if (p.data && p.data.name) return p.data;
        if (p.item && p.item.name) return p.item;
    }
    return null;
}

return [...document.querySelectorAll("tr[role='row']")].map(row => {
    const props = getFiberProps(row);
    if (!props) return null;
    const imgEl = row.querySelector("img");
    return {
        imgSrc: imgEl ? imgEl.src : null,
        data: findData(props)
    };
}).filter(Boolean);
"""

def main():
    driver = setup_driver()
    all_data, seen = [], set()

    try:
        for cat, url in CATEGORIES:
            driver.get(url)
            WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, "tr[role='row']")))
            time.sleep(2)

            raw_items = driver.execute_script(_JS_GET_FIBER_DATA)
            
            for item in raw_items:
                if not item or not item.get("data"): continue
                
                data = item["data"]
                details = data.get("item_details", {})
                name = details.get("name")
                
                if not name or name in seen: continue
                seen.add(name)
                
                stats = {}
                for k, v in details.get("effects", {}).items():
                    if k.startswith("{"): continue
                    k_str, v_str = format_stat(k, v)
                    stats[k_str] = v_str

                final_image = clean_img_url(item.get("imgSrc", ""))

                all_data.append({
                    "id": len(all_data) + 1,
                    "apiName": details.get("apiName"),
                    "name": name,
                    "slug": slugify(name),
                    "category": cat,
                    "rank": data.get("tier", {}).get("letter", ""),
                    "avg_placement": f"{data.get('avg_place', 0):.2f}",
                    "win_rate": f"{data.get('win_rate', 0) * 100:.1f}%",
                    "frequency": f"{data.get('frequency', {}).get('percent', 0) * 100:.1f}%",
                    "description": clean_desc(details.get("description", "")),
                    "stats": stats,
                    "component_1": None,
                    "component_2": None,
                    "image": final_image,
                    "_composition": details.get("composition", [])
                })

    finally:
        driver.quit()

    api_to_id = {d["apiName"]: d["id"] for d in all_data if d.get("apiName")}
    
    for d in all_data:
        comp = d.pop("_composition", [])
        if comp and len(comp) >= 1: d["component_1"] = api_to_id.get(comp[0])
        if comp and len(comp) >= 2: d["component_2"] = api_to_id.get(comp[1])
        d.pop("apiName", None)

    r2_delete_folder(R2_FOLDER)
    
    def process_upload(d: dict):
        image_url = d["image"]
        slug = d["slug"]
        r2_url = image_url
        if image_url:
            ext = get_ext_from_url(image_url)
            r2_key = f"{R2_FOLDER}/{slug}.{ext}"
            try:
                res = http.get(image_url, timeout=10)
                if res.status_code == 200:
                    r2_url = r2_put(res.content, r2_key, ext)
            except Exception:
                pass
        d["image"] = r2_url
        return d

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [executor.submit(process_upload, d) for d in all_data]
        for future in as_completed(futures):
            future.result()

    with open(JSON_OUT, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
