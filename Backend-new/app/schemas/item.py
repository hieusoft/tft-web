from pydantic import BaseModel, field_validator, Field
from typing import Optional, Dict, Any, List
from enum import Enum
import re

class ItemCategory(str, Enum):
    component = "component"
    normal_component = "normal_component"
    completed = "completed"
    normal_completed = "normal_completed"
    radiant = "radiant"
    artifact = "artifact"
    emblem = "emblem"
    support = "support"

CATEGORY_LABELS = {
    "component": "Thành phần",
    "normal_component": "Thành phần",
    "completed": "Hoàn chỉnh",
    "normal_completed": "Hoàn chỉnh",
    "radiant": "Ánh sáng",
    "artifact": "Tạo tác",
    "emblem": "Ấn",
    "support": "Hỗ trợ",
}

STAT_LABELS = {
    "AP": "SMPT",
    "AD": "SMCK",
    "AS": "Tốc độ đánh",
    "AttackPct": "Tốc độ đánh",
    "Armor": "Giáp",
    "MagicResist": "Kháng phép",
    "Health": "Máu",
    "Mana": "Năng lượng",
    "CritChance": "Chí mạng",
    "Dodge": "Né tránh",
    "BonusDamage": "Sát thương thêm",
    "Omnivamp": "Hút máu toàn phần",
    "StatOmnivamp": "Hút máu",
}

PERCENT_STATS = {"Omnivamp", "CritChance", "AS", "AttackPct", "StatOmnivamp", "BonusDamage"}

def _clean_html(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text)          
    text = re.sub(r"tft\d+_\w+", "", text)       
    text = re.sub(r"\(%[^)]*%\)", "", text)     
    text = re.sub(r"%i:\w+%", "", text)         
    text = re.sub(r"Tướng khu[yê]n? ?[dđ]ùng.*|Tướng khuyến nghị.*", "", text)  
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _format_stat(key: str, val: Any) -> Optional[dict]:
    if key not in STAT_LABELS:
        return None

    label = STAT_LABELS[key]

    if isinstance(val, (int, float)) and 0 < float(val) < 1:
        value_str = f"+{int(round(float(val) * 100))}%"
    elif key in PERCENT_STATS:
        clean = int(val) if isinstance(val, float) and val.is_integer() else val
        value_str = f"+{clean}%"
    else:
        clean = int(val) if isinstance(val, float) and val.is_integer() else val
        value_str = f"+{clean}"

    return {"key": key, "label": label, "value": value_str}

class ItemBase(BaseModel):
    name: str
    category: ItemCategory
    component_1: Optional[int] = None
    component_2: Optional[int] = None
    stats: Dict[str, Any] = Field(default_factory=dict)
    icon_path: Optional[str] = None
    description: Optional[str] = ""
    avg_placement: Optional[float] = None
    top_4_rate: Optional[str] = None
    win_rate: Optional[str] = None
    games_played: Optional[int] = 0

    @field_validator("stats", mode="before")
    @classmethod
    def clean_stats(cls, v: Any) -> Dict[str, Any]:
        if not isinstance(v, dict):
            return {}
        cleaned = {}
        for k, val in v.items():
            if isinstance(val, float):
                val = round(val, 4)
                val = int(val) if val.is_integer() else val
            cleaned[k] = val
        return cleaned
    
class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[ItemCategory] = None
    component_1: Optional[int] = None
    component_2: Optional[int] = None
    stats: Optional[Dict[str, Any]] = None
    icon_path: Optional[str] = None
    description: Optional[str] = None


class ItemUpdateMeta(BaseModel):
    avg_placement: Optional[float] = None
    top_4_rate: Optional[str] = None
    win_rate: Optional[str] = None
    games_played: Optional[int] = None

class StatDisplay(BaseModel):
    key: str
    label: str
    value: str


class ItemResponse(BaseModel):
    id: int
    name: str
    category: str
    icon_path: Optional[str] = None
    description: str
    recipe: List[int]
    stats: List[StatDisplay]
    avg_placement: Optional[float] = None
    top_4_rate: Optional[str] = None
    win_rate: Optional[str] = None
    games_played: int = 0

    @classmethod
    def from_orm_item(cls, item) -> "ItemResponse":
        cat_val = item.category.value if hasattr(item.category, "value") else str(item.category)

        return cls(
            id=item.id,
            name=item.name,
            category=CATEGORY_LABELS.get(cat_val, cat_val),
            icon_path=item.icon_path,
            description=_clean_html(item.description or ""),
            recipe=[c for c in (item.component_1, item.component_2) if c is not None],
            stats=[
                StatDisplay(**f)
                for key, val in (item.stats or {}).items()
                if (f := _format_stat(key, val))
            ],
            avg_placement=item.avg_placement,
            top_4_rate=item.top_4_rate,
            win_rate=item.win_rate,
            games_played=item.games_played or 0,
        )

    class Config:
        from_attributes = True