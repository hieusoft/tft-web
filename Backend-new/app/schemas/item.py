from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class ItemBase(BaseModel):
    name: str
    slug: str
    category: Optional[str] = None
    rank: Optional[str] = None
    avg_placement: Optional[float] = 0.0
    win_rate: Optional[str] = None
    games_played: Optional[str] = None
    pick_rate: Optional[str] = None
    description: Optional[str] = None
    stats: Optional[Dict[str, Any]] = None
    component_1: Optional[int] = None
    component_2: Optional[int] = None
    image: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(ItemBase):
    name: Optional[str] = None
    slug: Optional[str] = None

class ItemResponse(ItemBase):
    id: int
    model_config = ConfigDict(from_attributes=True)