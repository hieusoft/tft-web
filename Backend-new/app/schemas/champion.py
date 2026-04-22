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
    
class ChampionResponse(BaseModel):
    id: int
    name: str
    cost: int
    accent_color: Optional[str] = None
    icon_path: Optional[str] = None
    splash_path: Optional[str] = None
    skill: Optional[SkillResponse] = None
    # stats meta
    avg_placement: Optional[float] = None
    top_4_rate: Optional[str] = None
    win_rate: Optional[str] = None
    match_count: int = 0

    @classmethod
    def from_orm_champion(cls, champ) -> "ChampionResponse":
        return cls(
            id=champ.id,
            name=champ.name,
            cost=champ.cost,
            accent_color=champ.accent_color,
            icon_path=champ.icon_path,
            splash_path=champ.splash_path,
            skill=SkillResponse.from_orm_skill(champ.skill) if champ.skill else None,
            avg_placement=champ.avg_placement,
            top_4_rate=champ.top_4_rate,
            win_rate=champ.win_rate,
            match_count=champ.match_count or 0,
        )

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

