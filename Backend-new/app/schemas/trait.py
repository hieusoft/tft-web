from pydantic import BaseModel, computed_field
from typing import Optional, List, Dict, Any
import re

LABEL_MAP = {
    "PercentDamageIncrease": "Sát thương",
    "PerHexIncrease": "Sát thương/ô",
    "AttackSpeed": "Tốc độ đánh",
    "Armor": "Giáp",
    "MagicResist": "Kháng phép",
    "Health": "Máu",
    "AbilityPower": "SMPT"
}

TYPE_MAP = {
    "synergy": "Tộc",
    "class": "Hệ",
}

class VariableMatch(BaseModel):
    hash: Optional[str] = None
    type: Optional[str] = None
    match: str
    value: Any
    full_match: str


class Milestone(BaseModel):
    style: int
    minUnits: int = 0
    maxUnits: int = 0
    variables: Optional[Dict[str, Any]] = {}
    variable_matches: Optional[List[VariableMatch]] = []

class TraitBase(BaseModel):
    name: str
    type: str
    description: str
    icon_path: Optional[str] = None
    milestones: Optional[List[Milestone]] = []


class TraitCreate(TraitBase):
    pass

class TraitUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    icon_path: Optional[str] = None
    milestones: Optional[List[Milestone]] = None


class TraitUpdateMeta(BaseModel):
    rank: Optional[str] = None
    avg_placement: Optional[float] = None
    top_rate: Optional[str] = None
    win_rate: Optional[str] = None
    games_played: Optional[int] = None

def _clean_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text).strip()


def _resolve_description(description: str, milestones: List[Milestone]) -> str:
    intro = description.split("(@MinUnits@)")[0]
    return _clean_html(intro).strip()

def _build_tier_text(index: int, m: Milestone, description: str) -> str:
    meaningful_vars = {
        k: v for k, v in (m.variables or {}).items() if k != "MinUnits"
    }
    if meaningful_vars:
        parts = []
        for key, val in meaningful_vars.items():
            clean_val = int(val) if isinstance(val, float) and val.is_integer() else val
            label = LABEL_MAP.get(key, key)
            parts.append(f"{clean_val}% {label}")
        return ", ".join(parts)
    segments = re.split(r"\(@MinUnits@\)", description)
    target_index = index + 1
    if target_index < len(segments):
        return _clean_html(segments[target_index]).strip()

    return ""

class TierDisplay(BaseModel):
    units: int         
    style: int      
    text: str       


class TraitResponse(BaseModel):
    id: int
    name: str
    type: str 
    icon_path: Optional[str] = None
    description: str
    rank: Optional[str] = None
    avg_placement: Optional[float] = None
    top_rate: Optional[str] = None
    win_rate: Optional[str] = None
    games_played: int = 0
    tiers: List[TierDisplay] = []
        
    @classmethod
    def from_orm_trait(cls, trait) -> "TraitResponse":
        milestones: List[Milestone] = [
            Milestone(**m) if isinstance(m, dict) else m
            for m in (trait.milestones or [])
        ]

        clean_description = _resolve_description(trait.description or "", milestones)

        tiers = [
            TierDisplay(
                units=m.minUnits,
                style=m.style,
                text=_build_tier_text(i, m, trait.description or ""), 
            )
            for i, m in enumerate(milestones)
        ]

        return cls(
            id=trait.id,
            name=trait.name,
            type=TYPE_MAP.get(trait.type, trait.type), 
            icon_path=trait.icon_path,
            description=clean_description,
            rank=trait.rank,
            avg_placement=trait.avg_placement,
            top_rate=trait.top_rate,
            win_rate=trait.win_rate,
            games_played=trait.games_played or 0,
            tiers=tiers,
        )

    class Config:
        from_attributes = True