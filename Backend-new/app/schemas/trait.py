from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class MilestoneColor(str, Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD   = "gold"

class MilestoneSchema(BaseModel):
    count: int
    effect: str
    color: MilestoneColor

class TraitBase(BaseModel):
    name: str
    type: str
    icon_path: Optional[str] = None
    milestones: Optional[List[MilestoneSchema]] = []

class TraitCreate(TraitBase):
    pass

class TraitUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    icon_path: Optional[str] = None
    milestones: Optional[List[MilestoneSchema]] = None
    
class TraitUpdateMeta(BaseModel):
    rank: Optional[str] = None
    avg_placement: Optional[float] = None
    top_rate: Optional[str] = None
    win_rate: Optional[str] = None
    games_played: Optional[int] = None

class TraitResponse(TraitBase):
    id: int
    rank: Optional[str] = None
    avg_placement: Optional[float] = None
    top_rate: Optional[str] = None
    win_rate: Optional[str] = None
    games_played: Optional[int] = 0

    class Config:
        from_attributes = True