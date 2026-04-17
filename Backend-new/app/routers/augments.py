import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import redis

from app.core.database import get_db
from app.core.redis import get_redis
from app.dependencies import verify_api_key
from app.models.augment import Augment
from app.schemas.augment import AugmentCreate, AugmentResponse, AugmentUpdateMeta, AugmentUpdate

router = APIRouter()

AUGMENTS_CACHE_KEY = "augments:all"
CACHE_TTL = 60 * 5 

@router.get("/", response_model=List[AugmentResponse])
def get_all(
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    cached = r.get(AUGMENTS_CACHE_KEY)
    if cached:
        return json.loads(cached)

    augments = db.query(Augment).all()
    result = [AugmentResponse.model_validate(a).model_dump() for a in augments]
    r.setex(AUGMENTS_CACHE_KEY, CACHE_TTL, json.dumps(result, default=str))
    return result


@router.post("/", response_model=AugmentResponse)
def create(
    body: AugmentCreate,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    db_augment = db.query(Augment).filter(Augment.name == body.name).first()
    if db_augment:
        raise HTTPException(status_code=400, detail="Lõi công nghệ với tên này đã tồn tại!")
        
    augment = Augment(**body.model_dump())
    db.add(augment)
    db.commit()
    db.refresh(augment)
    
    r.delete(AUGMENTS_CACHE_KEY)
    return augment

@router.patch("/{id}", response_model=AugmentResponse)
def update_augment(
    id: int,
    body: AugmentUpdate,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    augment = db.query(Augment).filter(Augment.id == id).first()
    if not augment:
        raise HTTPException(status_code=404, detail="Lõi công nghệ không tồn tại")
        
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(augment, field, value)
        
    db.commit()
    db.refresh(augment)
    
    r.delete(AUGMENTS_CACHE_KEY) 
    return augment

@router.patch("/{id}/meta", response_model=AugmentResponse)
def update_meta(
    id: int,
    body: AugmentUpdateMeta,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    augment = db.query(Augment).filter(Augment.id == id).first()
    if not augment:
        raise HTTPException(status_code=404, detail="Lõi công nghệ không tồn tại")
        
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(augment, field, value)
        
    db.commit()
    db.refresh(augment)
    
    r.delete(AUGMENTS_CACHE_KEY) 
    return augment
    
@router.delete("/{id}")
def delete(
    id: int,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    augment = db.query(Augment).filter(Augment.id == id).first()
    if not augment:
        raise HTTPException(status_code=404, detail="Lõi công nghệ không tồn tại")
        
    db.delete(augment)
    db.commit()

    r.delete(AUGMENTS_CACHE_KEY)
    return {"message": f"Delete success augment with {id}"}

