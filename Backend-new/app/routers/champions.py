import json
import redis
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session, joinedload, selectinload, defer
from typing import List
from app.core.database import get_db
from app.core.redis import get_redis
from app.models.champion import Champion, ChampionBuildStats, ChampionItemStats
from app.schemas.champion import (
    ChampionListResponse,
    ChampionDetailResponse,
    ChampionCreate,
    ChampionUpdate,
    ChampionBulkResponse,
)

router = APIRouter()
CACHE_KEY = "champions:all_list"

def _clear_cache(r: redis.Redis):
    r.delete(CACHE_KEY)

@router.get("/", response_model=List[ChampionListResponse])
def get_all(db: Session = Depends(get_db), r: redis.Redis = Depends(get_redis)):
    cached = r.get(CACHE_KEY)
    if cached: 
        return json.loads(cached)

    champs = db.query(Champion).options(
        joinedload(Champion.skill),
        selectinload(Champion.traits),
        selectinload(Champion.best_items).joinedload(ChampionItemStats.item),
        selectinload(Champion.best_builds).options(
            joinedload(ChampionBuildStats.item_1),
            joinedload(ChampionBuildStats.item_2),
            joinedload(ChampionBuildStats.item_3)
        )
    ).order_by(Champion.cost.desc()).all()
    result = [ChampionListResponse.model_validate(c).model_dump(mode='json') for c in champs]
    r.setex(CACHE_KEY, 300, json.dumps(result))
    
    return result

@router.get("/{slug}", response_model=ChampionDetailResponse)
def get_detail(slug: str, db: Session = Depends(get_db)):
    champ = db.query(Champion).options(
        defer(Champion.icon_path),
        joinedload(Champion.skill),
        selectinload(Champion.traits),
        selectinload(Champion.best_items).joinedload(ChampionItemStats.item),
        selectinload(Champion.best_builds).options(
            joinedload(ChampionBuildStats.item_1),
            joinedload(ChampionBuildStats.item_2),
            joinedload(ChampionBuildStats.item_3)
        )
    ).filter(Champion.slug == slug).first()

    if not champ:
        raise HTTPException(status_code=404, detail="Không tìm thấy tướng")
    
    return champ

@router.post("/", response_model=ChampionDetailResponse, status_code=status.HTTP_201_CREATED)
def create_champion(
    body: ChampionCreate,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    if db.query(Champion).filter(Champion.slug == body.slug).first():
        raise HTTPException(status_code=400, detail=f"Slug '{body.slug}' đã tồn tại")
    
    champ = Champion(**body.model_dump())
    db.add(champ)
    try:
        db.commit()
        db.refresh(champ)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi khi tạo tướng") from exc

    _clear_cache(r)
    return champ

@router.patch("/{slug}", response_model=ChampionDetailResponse)
def update_champion(
    slug: str,
    body: ChampionUpdate,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    champ = db.query(Champion).filter(Champion.slug == slug).first()
    if not champ:
        raise HTTPException(status_code=404, detail="Không tìm thấy tướng")

    update_data = body.model_dump(exclude_none=True)
    if "slug" in update_data and update_data["slug"] != slug:
        if db.query(Champion).filter(Champion.slug == update_data["slug"]).first():
            raise HTTPException(status_code=400, detail=f"Slug '{update_data['slug']}' đã tồn tại")

    for key, value in update_data.items():
        setattr(champ, key, value)

    try:
        db.commit()
        db.refresh(champ)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi khi cập nhật tướng") from exc

    _clear_cache(r)
    return champ

@router.delete("/{slug}", status_code=200)
def delete_champion(
    slug: str,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    champ = db.query(Champion).filter(Champion.slug == slug).first()
    if not champ:
        raise HTTPException(status_code=404, detail="Không tìm thấy tướng")

    try:
        db.delete(champ)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi khi xóa tướng") from exc

    _clear_cache(r)
    return {"message": f"Đã xóa tướng '{slug}'"}

@router.post("/bulk", response_model=ChampionBulkResponse, status_code=status.HTTP_201_CREATED)
def bulk_sync_champions(
    body: List[ChampionCreate],
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    if not body:
        raise HTTPException(status_code=422, detail="Danh sách tướng không được rỗng")
    try:
        db.execute(text("TRUNCATE TABLE champions RESTART IDENTITY CASCADE;"))
        for item in body:
            db.add(Champion(**item.model_dump()))
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi bulk sync: {exc}") from exc

    _clear_cache(r)
    return ChampionBulkResponse(
        status="success",
        message=f"Đã nạp mới {len(body)} tướng thành công.",
        inserted=len(body),
    )