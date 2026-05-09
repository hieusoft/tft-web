from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List

class AugmentBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    tier: Optional[int] = None
    rank: Optional[str] = None
    image: Optional[str] = None
    
    @field_validator('image')
    @classmethod
    def transform_image_url(cls, v: Optional[str]) -> Optional[str]:
        old_domain = 'https://pub-4ca9b263aabc47338081a76c5a3a687c.r2.dev/'
        new_domain = 'https://cdn.tftmeta.gg/'
        if v and old_domain in v:
            return v.replace(old_domain, new_domain)
        return v

class AugmentCreate(AugmentBase):
    pass

class AugmentUpdate(AugmentBase):
    name: Optional[str] = None

class AugmentResponse(AugmentBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class AugmentBulkResponse(BaseModel):
    status: str
    message: str