import json
import redis
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from sqlalchemy import text
from pydantic import BaseModel

from app.core.database import get_db
from app.models.god import God
from app.schemas.gods import (
    GodBase,
    GodResponse, 
    GodDetailResponse
)
from app.core.redis import get_redis

class GodBulkResponse(BaseModel):
    status: str
    message: str

router = APIRouter()

GODS_CACHE_KEY = "gods:all"
CACHE_TTL = 3600 

@router.get("/", response_model=List[GodResponse])
def get_all_gods(
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    cached = r.get(GODS_CACHE_KEY)
    if cached:
        return json.loads(cached)
    gods = db.query(God).all()
    result = [GodResponse.model_validate(g).model_dump() for g in gods]
    r.setex(GODS_CACHE_KEY, CACHE_TTL, json.dumps(result))
    
    return gods


@router.get("/{slug}", response_model=GodDetailResponse)
def get_god_details(
    slug: str, 
    db: Session = Depends(get_db),
):
    god = db.query(God).options(joinedload(God.augment)).filter(God.slug == slug).first()
    if not god:
        raise HTTPException(status_code=404, detail="Không tìm thấy Thần")
    return god


@router.post("/", response_model=GodResponse)
def create_god(
    body: GodBase, 
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    if db.query(God).filter(God.name == body.name).first():
        raise HTTPException(status_code=400, detail="Tên Thần đã tồn tại")
    
    new_god = God(**body.model_dump())
    db.add(new_god)
    db.commit()
    db.refresh(new_god)
    
    r.delete(GODS_CACHE_KEY)
    return new_god

@router.post("/bulk", response_model=GodBulkResponse, status_code=status.HTTP_201_CREATED)
def bulk_sync_gods(
    body: List[GodBase], 
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    try:
        db.execute(text("TRUNCATE TABLE gods RESTART IDENTITY CASCADE;"))
        
        for item in body:
            new_god = God(**item.model_dump())
            db.add(new_god)
        
        db.commit()
        r.delete(GODS_CACHE_KEY)
        
        return {
            "status": "success", 
            "message": f"Đã xóa toàn bộ cũ và nạp mới {len(body)} Thần thành công."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi xóa/nạp dữ liệu Thần: {str(e)}")
        
@router.patch("/{slug}", response_model=GodResponse)
def update_god(
    slug: str,
    body: GodBase,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    god = db.query(God).filter(God.slug == slug).first()
    if not god:
        raise HTTPException(status_code=404, detail="Không tìm thấy Thần")
        
    update_data = body.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(god, key, value)

    db.commit()
    db.refresh(god)
    r.delete(GODS_CACHE_KEY)
    return god

@router.delete("/{slug}")
def delete_god(
    slug: str, 
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    god = db.query(God).filter(God.slug == slug).first()
    if not god:
        raise HTTPException(status_code=404, detail="Không tìm thấy Thần")
    
    db.delete(god)
    db.commit()
    r.delete(GODS_CACHE_KEY)
    return {"message": "Đã xóa Thần thành công"}