from pydantic import BaseModel
from typing import Optional, Dict, Any

class SkillBase(BaseModel):
    name: str
    mana_start: Optional[int] = 0
    mana_max: Optional[int] = 0
    description: Optional[str] = None
    ability_stats: Optional[Dict[str, Any]] = None
    icon_path: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    class Config:
        from_attributes = True

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    mana_start: Optional[int] = None
    mana_max: Optional[int] = None
    description: Optional[str] = None
    ability_stats: Optional[Dict[str, Any]] = None
    icon_path: Optional[str] = None