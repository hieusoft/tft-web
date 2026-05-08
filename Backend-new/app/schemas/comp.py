"""
Pydantic v2 schemas cho Comp (đội hình TFT).

Hierarchy:
    CompBase          -- Các field chung (dùng cho Create/Update) — nhận IDs
    CompCreate        -- Schema tạo mới (kế thừa CompBase)
    CompUpdate        -- Schema cập nhật (tất cả field Optional)
    CompResponse      -- Schema trả về client (raw, bao gồm id)
    CompDetailResponse-- Schema trả về client (enriched, đã resolve IDs → objects)
    CompBulkResponse  -- Schema phản hồi bulk sync
"""

from __future__ import annotations

from typing import Any, Optional, List
from pydantic import BaseModel, ConfigDict, Field, field_validator


# ---------------------------------------------------------------------------
# Validators / helpers
# ---------------------------------------------------------------------------

VALID_TIERS = {"S", "A", "B", "C", "D"}


# ---------------------------------------------------------------------------
# Nested schemas cho enriched response
# ---------------------------------------------------------------------------

class ChampionSimpleInComp(BaseModel):
    """Thông tin tóm tắt champion trong board."""
    id: int
    name: str
    slug: Optional[str] = None
    cost: Optional[int] = None
    icon_path: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ItemSimpleInComp(BaseModel):
    """Thông tin tóm tắt item."""
    id: int
    name: str
    slug: Optional[str] = None
    image: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AugmentSimpleInComp(BaseModel):
    """Thông tin tóm tắt augment."""
    id: int
    name: str
    description: Optional[str] = None
    tier: Optional[int] = None
    image: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class BoardSlotEnriched(BaseModel):
    """Một slot trên board — đã resolve champion/items thành objects."""
    champion: Optional[ChampionSimpleInComp] = None
    items: List[ItemSimpleInComp] = []
    is_three_star: bool = False
    hex: Optional[int] = None    # vị trí hex (0-27) trên bàn cờ
    row: Optional[int] = None    # hàng (0-3) trên bàn cờ


# ---------------------------------------------------------------------------
# Input schemas (nhận IDs)
# ---------------------------------------------------------------------------

class CompBase(BaseModel):
    """Các field cơ bản của một đội hình TFT."""

    name: str = Field(..., min_length=1, max_length=255, description="Tên đội hình, phải là duy nhất")
    tier: str = Field(..., description="Tier đánh giá: S | A | B | C | D")
    playstyle: Optional[str] = Field(None, max_length=100, description="Cách chơi, e.g. 'Fast 8', 'Reroll 3'")
    avg_placement: Optional[float] = Field(None, ge=1.0, le=8.0, description="Hạng trung bình từ 1.0 đến 8.0")

    # JSONB fields — client gửi object Python thuần
    final_board: Optional[Any] = Field(None, description="Board cuối game (JSONB)")
    early_boards: Optional[Any] = Field(None, description="Board đầu game theo từng level (JSONB)")

    # ARRAY fields
    carousel_priority: Optional[List[str]] = Field(default_factory=list, description="Danh sách ưu tiên băng chuyền (item IDs)")
    recommended_augments: Optional[List[str]] = Field(default_factory=list, description="Danh sách augment đề xuất (IDs)")

    # ------------------------------------------------------------------
    # Validators
    # ------------------------------------------------------------------

    @field_validator("tier")
    @classmethod
    def validate_tier(cls, v: str) -> str:
        upper = v.strip().upper()
        if upper not in VALID_TIERS:
            raise ValueError(f"tier phải là một trong {sorted(VALID_TIERS)}, nhận được '{v}'")
        return upper

    @field_validator("carousel_priority", mode="before")
    @classmethod
    def coerce_carousel_priority(cls, v: Any) -> Optional[List[str]]:
        """Tự động convert int -> str cho carousel_priority."""
        if v is None:
            return v
        if isinstance(v, list):
            return [str(item) for item in v]
        return v

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        return v.strip()


class CompCreate(CompBase):
    """Schema dùng khi tạo mới một đội hình."""
    pass


class CompUpdate(BaseModel):
    """
    Schema cập nhật — tất cả field đều Optional.
    Chỉ field nào được gửi lên mới được cập nhật (PATCH semantics).
    """

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    tier: Optional[str] = None
    playstyle: Optional[str] = Field(None, max_length=100)
    avg_placement: Optional[float] = Field(None, ge=1.0, le=8.0)
    final_board: Optional[Any] = None
    early_boards: Optional[Any] = None
    carousel_priority: Optional[List[str]] = None
    recommended_augments: Optional[List[str]] = None

    @field_validator("carousel_priority", mode="before")
    @classmethod
    def coerce_carousel_priority(cls, v: Any) -> Optional[List[str]]:
        if v is None:
            return v
        if isinstance(v, list):
            return [str(item) for item in v]
        return v

    @field_validator("tier", mode="before")
    @classmethod
    def validate_tier_optional(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        upper = v.strip().upper()
        if upper not in VALID_TIERS:
            raise ValueError(f"tier phải là một trong {sorted(VALID_TIERS)}, nhận được '{v}'")
        return upper


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class CompResponse(CompBase):
    """Schema trả về cho client (raw — chưa resolve IDs)."""

    id: int

    model_config = ConfigDict(from_attributes=True)


class CompDetailResponse(BaseModel):
    """Schema trả về cho client — đã resolve IDs thành objects đầy đủ."""

    id: int
    name: str
    tier: str
    playstyle: Optional[str] = None
    avg_placement: Optional[float] = None

    # Enriched fields
    final_board: Optional[List[BoardSlotEnriched]] = None
    early_boards: Optional[Any] = None
    carousel_priority: List[ItemSimpleInComp] = []
    recommended_augments: List[AugmentSimpleInComp] = []

    model_config = ConfigDict(from_attributes=True)


class CompBulkResponse(BaseModel):
    """Schema phản hồi sau khi bulk sync dữ liệu."""

    status: str
    message: str
    inserted: int = 0
