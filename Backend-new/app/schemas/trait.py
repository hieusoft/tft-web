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

class TraitCreate(BaseModel):
    name: str
    type: str
    icon_path: Optional[str] = None
    milestones: Optional[List[MilestoneSchema]] = []

class TraitUpdateMeta(BaseModel):
    games_played: Optional[int] = None
    win_rate: Optional[str] = None
    avg_placement: Optional[float] = None

class TraitResponse(BaseModel):
    id: int
    name: str
    type: str
    rank: Optional[str] = None
    avg_placement: Optional[float] = None
    top_rate: Optional[str] = None
    win_rate: Optional[str] = None
    games_played: int
    icon_path: Optional[str] = None
    milestones: List[MilestoneSchema] = []

    class Config:
        from_attributes = True
