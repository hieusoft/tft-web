import json
import redis
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import text
from app.core.database import get_db
from app.models.augment import Augment
from app.schemas.augment import (
    AugmentCreate, 
    AugmentUpdate, 
    AugmentResponse, 
    AugmentBulkResponse
)
from app.core.redis import get_redis

router = APIRouter()

AUGMENTS_CACHE_KEY = "augments:all"
CACHE_TTL = 3600 

@router.get("/", response_model=List[AugmentResponse])
def get_all_augments(
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    cached = r.get(AUGMENTS_CACHE_KEY)
    if cached:
        return json.loads(cached)
    augments = db.query(Augment).all()
    result = [AugmentResponse.model_validate(a).model_dump() for a in augments]
    r.setex(AUGMENTS_CACHE_KEY, CACHE_TTL, json.dumps(result))
    
    return augments

@router.get("/{id}", response_model=AugmentResponse)
def get_augment(
    id: int, 
    db: Session = Depends(get_db),
):
    augment = db.query(Augment).filter(Augment.id == id).first()
    if not augment:
        raise HTTPException(status_code=404, detail="Không tìm thấy Lõi Công Nghệ")
    return augment

@router.post("/", response_model=AugmentResponse)
def create_augment(
    body: AugmentCreate,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    if db.query(Augment).filter(Augment.name == body.name).first():
        raise HTTPException(status_code=400, detail="Tên lõi đã tồn tại")
    
    new_augment = Augment(**body.model_dump())
    db.add(new_augment)
    db.commit()
    db.refresh(new_augment)
    r.delete(AUGMENTS_CACHE_KEY)
    return new_augment

@router.post("/bulk", response_model=AugmentBulkResponse, status_code=status.HTTP_201_CREATED)
def bulk_sync_augments(
    body: List[AugmentCreate],
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    try:
        db.execute(text("TRUNCATE TABLE augments RESTART IDENTITY CASCADE;"))
        
        for item in body:
            new_augment = Augment(**item.model_dump())
            db.add(new_augment)
        
        db.commit()
        r.delete(AUGMENTS_CACHE_KEY)
        
        return {
            "status": "success", 
            "message": f"Đã xóa toàn bộ cũ và nạp mới {len(body)} Lõi thành công."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi xóa/nạp dữ liệu: {str(e)}")


@router.patch("/{id}", response_model=AugmentResponse)
def update_augment(
    id: int,
    body: AugmentUpdate,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    augment = db.query(Augment).filter(Augment.id == id).first()
    if not augment:
        raise HTTPException(status_code=404, detail="Không tìm thấy Lõi")
    update_data = body.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(augment, key, value)

    db.commit()
    db.refresh(augment)
    r.delete(AUGMENTS_CACHE_KEY)
    return augment

@router.delete("/{id}")
def delete_augment(
    id: int, 
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    augment = db.query(Augment).filter(Augment.id == id).first()
    if not augment:
        raise HTTPException(status_code=404, detail="Không tìm thấy Lõi")
    
    db.delete(augment)
    db.commit()
    r.delete(AUGMENTS_CACHE_KEY)
    return {"message": "Đã xóa Lõi Công Nghệ thành công"}