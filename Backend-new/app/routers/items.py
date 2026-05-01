import json
import redis
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.redis import get_redis
from app.dependencies import verify_api_key
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemResponse, ItemUpdate

router = APIRouter()
CACHE_KEY = "items:all"

def clear_cache(r: redis.Redis):
    r.delete(CACHE_KEY)

@router.get("/", response_model=List[ItemResponse])
def get_all(db: Session = Depends(get_db), r: redis.Redis = Depends(get_redis)):
    cached = r.get(CACHE_KEY)
    if cached: return json.loads(cached)
    items = db.query(Item).all()
    result = [ItemResponse.model_validate(i).model_dump(mode='json') for i in items]
    
    r.setex(CACHE_KEY, 300, json.dumps(result))
    return items

@router.get("/{slug}", response_model=ItemResponse)
def get_detail(slug: str, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.slug == slug).first()
    if not item:
        raise HTTPException(status_code=404, detail="Không tìm thấy trang bị")
    return item

@router.post("/", response_model=ItemResponse)
def create(body: ItemCreate, db: Session = Depends(get_db), r: redis.Redis = Depends(get_redis), _=Depends(verify_api_key)):
    if db.query(Item).filter(Item.slug == body.slug).first():
        raise HTTPException(status_code=400, detail="Slug đã tồn tại")
        
    new_item = Item(**body.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    clear_cache(r)
    return new_item

@router.patch("/{slug}", response_model=ItemResponse)
def update(slug: str, body: ItemUpdate, db: Session = Depends(get_db), r: redis.Redis = Depends(get_redis), _=Depends(verify_api_key)):
    item = db.query(Item).filter(Item.slug == slug).first()
    if not item: raise HTTPException(status_code=404)
    
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    clear_cache(r)
    return item

@router.delete("/{slug}")
def delete(slug: str, db: Session = Depends(get_db), r: redis.Redis = Depends(get_redis), _=Depends(verify_api_key)):
    item = db.query(Item).filter(Item.slug == slug).first()
    if not item: raise HTTPException(status_code=404)
    
    db.delete(item)
    db.commit()
    clear_cache(r)
    return {"message": "Xóa thành công"}