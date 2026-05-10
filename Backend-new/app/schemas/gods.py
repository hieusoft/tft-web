from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any

class AugmentBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None

    class Config:
        from_attributes = True

class GodBase(BaseModel):
    name: Optional[str] = None
    trait: Optional[str] = None
    rank: Optional[str] = None
    slug: Optional[str] = None 
    stages: Optional[List[Dict[str, Any]]] = None 
    image: Optional[str] = None
    boon_augment_id: Optional[int] = None
    model_config = ConfigDict(populate_by_name=True)


class GodResponse(GodBase):
    id: int

    class Config:
        from_attributes = True

class GodDetailResponse(GodResponse):
    augment: Optional[AugmentBase] = None 