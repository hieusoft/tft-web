from pydantic import BaseModel
from typing import Optional
from enum import IntEnum, Enum # Thêm Enum

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
    ranking: Optional[RankingTier] = None # THÊM TRƯỜNG NÀY VÀO BASE

class AugmentCreate(AugmentBase):
    id: int

class AugmentResponse(AugmentBase):
    id: int
    class Config:
        from_attributes = True

# THÊM SCHEMA DÀNH CHO API UPDATE META
class AugmentUpdateMeta(BaseModel):
    ranking: Optional[RankingTier] = None