from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import re

ABILITY_STAT_LABELS = {
    "Damage": "Sát thương",
    "ADDamage": "Sát thương vật lý",
    "APDamage": "Sát thương phép",
    "HealAmount": "Hồi máu",
    "ShieldAmount": "Khiên",
    "Duration": "Thời gian",
    "SlashDuration": "Thời gian",       
    "Stun": "Choáng",
    "ManaRestore": "Hồi năng lượng",
    "AttackSpeed": "Tốc độ đánh",
    "AS": "Tốc độ đánh",
    "PercentHealth": "% Máu",
    "PercentMissingHealth": "% Máu đã mất",
    "PercentBonusDamage": "Sát thương thêm",
    "BonusArmor": "Giáp thêm",
    "BonusMagicResist": "Kháng phép thêm",
    "CritChance": "Chí mạng",
    "NumSlashes": "Số nhát chém",
    "BaseNumSlashes": "Số nhát chém",    
    "RoundsToHatch": "Số vòng",
}

VARIABLE_MAP = {
    "TotalDamage": "ADDamage",           
    "TotalNumSlashes": "BaseNumSlashes", 
    "ModifiedDamage": "ADDamage",      
    "BonusHP": "HealAmount",
    "PercentBonusDamage": "PercentBonusDamage",
    "SlashDuration": "SlashDuration",    
}

INTERNAL_STAT_KEYS = {
    "BonusASBreakpoint",
    "NumProcsPerSimulatedAttack", 
    "Gold",
}


def _resolve_description(text: str, stats: list) -> str:
    if not text:
        return ""

    stat_lookup = {}
    for item in (stats or []):
        key = item.get("name") if isinstance(item, dict) else item.name
        val = item.get("value") if isinstance(item, dict) else item.value
        stat_lookup[key] = val

    def replace_var(match):
        expr = match.group(1)
        multiply = 1
        if "*100" in expr:
            expr = expr.replace("*100", "")
            multiply = 100

        stat_key = VARIABLE_MAP.get(expr, expr)
        values = stat_lookup.get(stat_key)
        if values:
            converted = [int(v * multiply) if isinstance(v, float) else v * multiply for v in values]
            if len(set(converted)) == 1:
                return str(converted[0])
            return "/".join(str(v) for v in converted)
        return ""
    
    def replace_list(match):
        vals = [v.strip() for v in match.group(1).split(",")]
        if len(set(vals)) == 1:
            return vals[0]
        return "/".join(vals)

    text = re.sub(r"@([\w*]+)@", replace_var, text)
    text = re.sub(r"\[([^\]]+)\]", replace_list, text) 
    text = re.sub(r"%i:\w+%", "", text)
    text = re.sub(r"\(%[^)]*%\)", "", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\(\s*\)", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

class AbilityStat(BaseModel):
    name: str
    value: List[Any]  

class SkillBase(BaseModel):
    name: str
    slug: str
    mana_start: Optional[int] = 0
    mana_max: Optional[int] = 0
    description: Optional[str] = None
    ability_stats: Optional[List[AbilityStat]] = [] 
    icon_path: Optional[str] = None


class SkillCreate(SkillBase):
    pass

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    mana_start: Optional[int] = None
    mana_max: Optional[int] = None
    description: Optional[str] = None
    ability_stats: Optional[List[AbilityStat]] = None
    icon_path: Optional[str] = None

class AbilityStatDisplay(BaseModel):
    key: str         
    label: str       
    values: List[Any] 


class SkillResponse(BaseModel):
    id: int
    name: str
    slug: str
    mana_start: int
    mana_max: int
    icon_path: Optional[str] = None
    description: str                       
    stats: List[AbilityStatDisplay] = []    

    @classmethod
    def from_orm_skill(cls, skill) -> "SkillResponse":
        raw = skill.ability_stats or []
        stats = []
        for item in raw:
            key = item.get("name") if isinstance(item, dict) else item.name
            values = item.get("value") if isinstance(item, dict) else item.value

            if key in INTERNAL_STAT_KEYS: 
                continue

            label = ABILITY_STAT_LABELS.get(key, key) 
            stats.append(AbilityStatDisplay(key=key, label=label, values=values))

        return cls(
            id=skill.id,
            name=skill.name,
            slug=skill.slug,
            mana_start=skill.mana_start or 0,
            mana_max=skill.mana_max or 0,
            icon_path=skill.icon_path,
            description=_resolve_description(skill.description or "", raw),
            # stats=stats,
    )
    class Config:
        from_attributes = True