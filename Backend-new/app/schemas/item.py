from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

class ItemBase(BaseModel):
    name: str
    slug: str
    category: Optional[str] = None
    rank: Optional[str] = None
    avg_placement: Optional[str] = None
    win_rate: Optional[str] = None
    frequency: Optional[str] = None
    description: Optional[str] = None
    stats: Optional[Dict[str, Any]] = None
    component_1: Optional[str] = None
    component_2: Optional[str] = None
    image: Optional[str] = None

class ItemSimpleResponse(BaseModel):
    id: int
    name: str
    slug: str
    image: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ItemCreate(ItemBase):
    pass

class ItemUpdate(ItemBase):
    name: Optional[str] = None
    slug: Optional[str] = None

class ChampionSimple(BaseModel):
    name: str
    icon_path: str
    model_config = ConfigDict(from_attributes=True)

class ChampionUsageResponse(BaseModel):
    avg_placement: str
    pick_percent: str
    champion: Optional[ChampionSimple] = None 
    model_config = ConfigDict(from_attributes=True)

class ItemResponse(ItemBase):
    id: int
    component_1: Optional[str] = None
    component_2: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)
    best_users: List[ChampionUsageResponse] = []
    model_config = ConfigDict(from_attributes=True)

