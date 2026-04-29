from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class TraitBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Tên Tộc/Hệ (ví dụ: Học Giả)")
    description: Optional[str] = Field(None, description="Mô tả chi tiết kỹ năng")
    tier: Optional[str] = Field(None, description="Xếp hạng Meta: S, A, B, C...")
    placement: Optional[float] = Field(None, description="Thứ hạng trung bình (ví dụ: 4.25)")
    top4: Optional[str] = Field(None, description="Tỷ lệ lọt vào Top 4 (ví dụ: 52.1%)")
    pick_count: Optional[str] = Field(None, description="Số lượt chọn (ví dụ: 1.2M)")
    pick_percent: Optional[str] = Field(None, description="Tỷ lệ chọn (ví dụ: 12.5%)")
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

class TraitResponse(TraitBase):
    id: int
    image: Optional[str] = Field(None, description="Link ảnh từ Cloudflare R2")
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class TraitDeleteResponse(BaseModel):
    message: str
    status: str = "success"

class TraitResponse(TraitBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_trait(cls, trait) -> "TraitResponse":
        ms = [
            Milestone(**m) if isinstance(m, dict) else m 
            for m in (trait.milestones or [])
        ]
        
        return cls(
            id=trait.id,
            name=trait.name,
            description=trait.description or "",
            tier=trait.tier,
            placement=trait.placement,
            top4=trait.top4,
            pick_count=trait.pick_count,
            pick_percent=trait.pick_percent,
            image=trait.image,
            milestones=ms
        )

class TraitBulkResponse(BaseModel):
    status: str
    message: str