import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.trait import Trait
from app.schemas.trait import TraitCreate, TraitUpdateMeta, TraitResponse, TraitUpdate
from app.dependencies import verify_api_key
from app.core.redis import get_redis
from typing import List
import redis

router = APIRouter()

TRAITS_CACHE_KEY = "traits:all"
CACHE_TTL = 60 * 5  


@router.get("/", response_model=List[TraitResponse])
def get_all(
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    cached = r.get(TRAITS_CACHE_KEY)
    if cached:
        return json.loads(cached)

    traits = db.query(Trait).all()
    result = [TraitResponse.model_validate(t).model_dump() for t in traits]
    r.setex(TRAITS_CACHE_KEY, CACHE_TTL, json.dumps(result, default=str))
    return result

@router.post("/", response_model=TraitResponse)
def create(
    body: TraitCreate,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    db_trait = db.query(Trait).filter(Trait.name == body.name).first()
    if db_trait:
        raise HTTPException(status_code=400, detail="Tộc/Hệ với tên này đã tồn tại!")
    
    trait = Trait(**body.model_dump())
    db.add(trait)
    db.commit()
    db.refresh(trait)
    r.delete(TRAITS_CACHE_KEY)
    return trait

@router.patch("/{id}/meta", response_model=TraitResponse)
def update_meta(
    id: int,
    body: TraitUpdateMeta,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    trait = db.query(Trait).filter(Trait.id == id).first()
    if not trait:
        raise HTTPException(status_code=404, detail="Tộc/Hệ với ID này không tồn tại")
        
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(trait, field, value)
        
    db.commit()
    db.refresh(trait)
    r.delete(TRAITS_CACHE_KEY) 
    return trait

@router.patch("/{id}", response_model=TraitResponse)
def update_trait(
    id: int,
    body: TraitUpdate,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    trait = db.query(Trait).filter(Trait.id == id).first()
    if not trait:
        raise HTTPException(status_code=404, detail="Tộc/Hệ không tồn tại")
        
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(trait, field, value)
        
    db.commit()
    db.refresh(trait)
    
    r.delete(TRAITS_CACHE_KEY) 
    return trait

@router.delete("/{id}")
def delete(
    id: int,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    trait = db.query(Trait).filter(Trait.id == id).first()
    if not trait:
        raise HTTPException(status_code=404, detail="Tộc/Hệ với ID này không tồn tại")
        
    db.delete(trait)
    db.commit()
    r.delete(TRAITS_CACHE_KEY)
    return {"message": f"Đã xóa thành công Tộc/Hệ với ID {id}"}