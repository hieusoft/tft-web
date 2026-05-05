from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ChampionSimpleTrait(BaseModel):
    id: int
    name: str
    slug: str
    cost: int
    icon_path: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class TraitBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Tên Tộc/Hệ (ví dụ: Học Giả)")
    slug: Optional[str] = Field(None, description="Slug tiếng Anh (SEO-friendly)")
    description: Optional[str] = Field(None, description="Mô tả chi tiết kỹ năng")
    tier: Optional[str] = Field(None, description="Xếp hạng Meta: S, A, B, C...")
    placement: Optional[float] = Field(None, description="Thứ hạng trung bình (ví dụ: 4.25)")
    top4: Optional[str] = Field(None, description="Tỷ lệ lọt vào Top 4 (ví dụ: 52.1%)")
    pick_count: Optional[str] = Field(None, description="Số lượt chọn (ví dụ: 1.2M)")
    pick_percent: Optional[str] = Field(None, description="Tỷ lệ chọn (ví dụ: 12.5%)")
    image: Optional[str] = Field(None, description="Link ảnh")
    milestones: List[Dict[str, Any]] = Field(default_factory=list, description="Danh sách các mốc kích hoạt")

class TraitCreate(TraitBase):
    pass
    
class TraitUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    type: Optional[str] = None
    tier: Optional[str] = None
    placement: Optional[float] = None
    top4: Optional[str] = None
    pick_count: Optional[str] = None
    pick_percent: Optional[str] = None
    image: Optional[str] = None 
    milestones: Optional[List[Dict[str, Any]]] = None

class TraitDeleteResponse(BaseModel):
    message: str
    status: str = "success"

class TraitResponse(TraitBase):
    id: int
    champions: List[ChampionSimpleTrait] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_trait(cls, trait) -> "TraitResponse":
        return cls(
            id=trait.id,
            name=trait.name,
            slug=trait.slug,
            description=trait.description or "",
            tier=trait.tier,
            placement=trait.placement,
            top4=trait.top4,
            pick_count=trait.pick_count,
            pick_percent=trait.pick_percent,
            image=trait.image,
            milestones=trait.milestones or [],
            champions=[ChampionSimpleTrait.model_validate(c) for c in trait.champions] if hasattr(trait, 'champions') else [],
            created_at=trait.created_at,
            updated_at=trait.updated_at
        )

class TraitBulkResponse(BaseModel):
    status: str
    message: str