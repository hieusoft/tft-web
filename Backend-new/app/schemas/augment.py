from pydantic import BaseModel
from typing import Optional
from enum import IntEnum, Enum 

class AugmentTier(IntEnum):
    SILVER = 1
    GOLD = 2
    PRISMATIC = 3

class RankingTier(str, Enum):
    S_PLUS = "S+"
    S = "S"
    A = "A"
    B = "B"
    C = "C"

class AugmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    tier: AugmentTier
    icon_path: Optional[str] = None
    ranking: Optional[RankingTier] = None 

class AugmentCreate(AugmentBase):
    pass

class AugmentResponse(AugmentBase):
    id: int
    class Config:
        from_attributes = True

class AugmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tier: Optional[AugmentTier] = None
    icon_path: Optional[str] = None

class AugmentUpdateMeta(BaseModel):
    ranking: Optional[RankingTier] = None