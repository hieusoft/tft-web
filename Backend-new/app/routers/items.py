import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import redis

from app.core.database import get_db
from app.core.redis import get_redis
from app.dependencies import verify_api_key
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemResponse, ItemUpdateMeta

router = APIRouter()

ITEMS_CACHE_KEY = "items:all"
CACHE_TTL = 60 * 5  

@router.get("/", response_model=List[ItemResponse])
def get_all(
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    cached = r.get(ITEMS_CACHE_KEY)
    if cached:
        return json.loads(cached)

    items = db.query(Item).all()
    result = []
    for i in items:
        try:
            result.append(ItemResponse.from_orm_item(i).model_dump())
        except Exception as e:
            print(f"Item ID {i.id} - {i.name}: {e}") 
            raise
    return result
@router.post("/", response_model=ItemResponse)
def create(
    body: ItemCreate,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    db_item = db.query(Item).filter(Item.name == body.name).first()
    if db_item:
        raise HTTPException(status_code=400, detail="Trang bị với tên này đã tồn tại!")
        
    item = Item(**body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)

    r.delete(ITEMS_CACHE_KEY)
    return ItemResponse.from_orm_item(item) 

@router.patch("/{id}", response_model=ItemResponse)
def update_item(
    id: int,
    body: ItemUpdateMeta,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    item = db.query(Item).filter(Item.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Trang bị không tồn tại")
        
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(item, field, value)
        
    db.commit()
    db.refresh(item)
    
    r.delete(ITEMS_CACHE_KEY) 
    return ItemResponse.from_orm_item(item) 

@router.patch("/{id}/meta", response_model=ItemResponse)
def update_item_meta(
    id: int,
    body: ItemUpdateMeta,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    item = db.query(Item).filter(Item.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Trang bị không tồn tại")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(item, field, value)
        
    db.commit()
    db.refresh(item)
    
    r.delete(ITEMS_CACHE_KEY) 
    return ItemResponse.from_orm_item(item) 

@router.delete("/{id}")
def delete(
    id: int,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    item = db.query(Item).filter(Item.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Trang bị không tồn tại")
        
    db.delete(item)
    db.commit()
    
    r.delete(ITEMS_CACHE_KEY) 
    return {"message": f"Đã xóa thành công trang bị ID {id}"}

