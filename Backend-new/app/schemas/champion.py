from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any

class ItemSimple(BaseModel):
    id: int
    name: str
    image: str
    model_config = ConfigDict(from_attributes=True)

class BuildResponse(BaseModel):
    item_1: Optional[ItemSimple]
    item_2: Optional[ItemSimple]
    item_3: Optional[ItemSimple]
    avg_placement: float
    win_rate: str
    model_config = ConfigDict(from_attributes=True)

class ItemStatResponse(BaseModel):
    item: Optional[ItemSimple]
    avg_placement: float
    win_rate: str
    pick_percent: str
    model_config = ConfigDict(from_attributes=True)

class TraitSimple(BaseModel):
    name: str
    slug: str
    model_config = ConfigDict(from_attributes=True)

class SkillResponse(BaseModel):
    name: str
    mana_start: int
    mana_max: int
    description: str
    ability_stats: Optional[Dict[str, Any]]
    icon_path: str
    model_config = ConfigDict(from_attributes=True)

class ChampionBase(BaseModel):
    id: int
    name: str
    slug: str
    cost: int
    rank: str
    avg_placement: float
    win_rate: str
    games_played: str
    pick_rate: str
    icon_path: str
    splash_path: str

class ChampionListResponse(ChampionBase):
    id: int
    skill: Optional[SkillResponse] = None
    traits: List[TraitSimple] = []
    best_items: List[ItemStatResponse] = []
    model_config = ConfigDict(from_attributes=True)

class ChampionDetailResponse(ChampionBase):
    base_stats: Optional[Dict[str, Any]]
    skill: Optional[SkillResponse]
    traits: List[TraitSimple] = []
    best_builds: List[BuildResponse] = []
    best_items: List[ItemStatResponse] = []
    model_config = ConfigDict(from_attributes=True)