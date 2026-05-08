import json
import redis
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.core.redis import get_redis
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemResponse, ItemUpdate
from app.models.champion import ChampionItemStats

router = APIRouter()
CACHE_KEY = "items:all"

def clear_cache(r: redis.Redis):
    r.delete(CACHE_KEY)

@router.get("/", response_model=List[ItemResponse])
def get_items(db: Session = Depends(get_db)):
    items = db.query(Item).options(
        joinedload(Item.component_1),
        joinedload(Item.component_2)
    ).all()
    return items

from sqlalchemy.orm import joinedload

@router.get("/{slug}", response_model=ItemResponse)
def get_item_detail(slug: str, db: Session = Depends(get_db)):
    item = db.query(Item).options(
        joinedload(Item.best_users)             
        .joinedload(ChampionItemStats.champion)
    ).filter(Item.slug == slug).first()
    
    return item

@router.post("/", response_model=ItemResponse)
def create(body: ItemCreate, db: Session = Depends(get_db), r: redis.Redis = Depends(get_redis)):
    if db.query(Item).filter(Item.slug == body.slug).first():
        raise HTTPException(status_code=400, detail="Slug đã tồn tại")
        
    new_item = Item(**body.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    clear_cache(r)
    return new_item

@router.patch("/{slug}", response_model=ItemResponse)
def update(slug: str, body: ItemUpdate, db: Session = Depends(get_db), r: redis.Redis = Depends(get_redis)):
    item = db.query(Item).filter(Item.slug == slug).first()
    if not item: raise HTTPException(status_code=404)
    
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    clear_cache(r)
    return item

@router.delete("/{slug}")
def delete(slug: str, db: Session = Depends(get_db), r: redis.Redis = Depends(get_redis)):
    item = db.query(Item).filter(Item.slug == slug).first()
    if not item: raise HTTPException(status_code=404)
    
    db.delete(item)
    db.commit()
    clear_cache(r)
    return {"message": "Xóa thành công"}