from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.schemas.skill import SkillResponse

class ChampionBase(BaseModel):
    name: str
    cost: int
    accent_color: Optional[str] = None
    skill_id: Optional[int] = None
    base_stats: Optional[Dict[str, Any]] = None
    icon_path: Optional[str] = None
    splash_path: Optional[str] = None
    avg_placement: Optional[float] = None
    top_4_rate: Optional[str] = None
    win_rate: Optional[str] = None
    match_count: Optional[int] = 0

class ChampionCreate(ChampionBase):
    pass
    
class ChampionResponse(ChampionBase):
    id: int
    skill: Optional[SkillResponse] = None 
    
    class Config:
        from_attributes = True

class ChampionUpdate(BaseModel):
    name: Optional[str] = None
    cost: Optional[int] = None
    accent_color: Optional[str] = None
    skill_id: Optional[int] = None
    base_stats: Optional[Dict[str, Any]] = None
    icon_path: Optional[str] = None
    splash_path: Optional[str] = None
    
class ChampionUpdateMeta(BaseModel):
    avg_placement: Optional[float] = None
    top_4_rate: Optional[str] = None
    win_rate: Optional[str] = None
    match_count: Optional[int] = None

