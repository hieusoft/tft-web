from pydantic import BaseModel
from typing import Optional, Dict, Any
from enum import Enum

class ItemCategory(str, Enum):
    COMPONENT = "component"
    COMPLETED = "completed"
    RADIANT = "radiant"
    ARTIFACT = "artifact"
    EMBLEM = "emblem"
    SUPPORT = "support"

class ItemBase(BaseModel):
    name: str
    category: ItemCategory
    component_1: Optional[int] = None
    component_2: Optional[int] = None
    stats: Optional[Dict[str, Any]] = None
    icon_path: Optional[str] = None
    description: Optional[str] = None
    avg_placement: Optional[float] = None
    top_4_rate: Optional[str] = None
    win_rate: Optional[str] = None
    games_played: Optional[int] = 0

class ItemCreate(ItemBase):
    id: int

class ItemResponse(ItemBase):
    id: int
    class Config:
        from_attributes = True

class ItemUpdateMeta(BaseModel):
    avg_placement: Optional[float] = None
    top_4_rate: Optional[str] = None
    win_rate: Optional[str] = None
    games_played: Optional[int] = None