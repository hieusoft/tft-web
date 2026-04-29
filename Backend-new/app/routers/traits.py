import json
import redis
import uuid
from sqlalchemy import text
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.trait import Trait
from app.schemas.trait import TraitResponse, TraitCreate, TraitBulkResponse
from app.dependencies import verify_api_key
from app.core.redis import get_redis
from app.core.r2_storage import upload_images_to_r2

router = APIRouter(prefix="/traits", tags=["Traits"])

TRAITS_CACHE_KEY = "traits:all"
CACHE_TTL = 3600

@router.get("/", response_model=List[TraitResponse])
def read_all_traits(db: Session = Depends(get_db), r: redis.Redis = Depends(get_redis), _=Depends(verify_api_key)):
    cached = r.get(TRAITS_CACHE_KEY)
    if cached: return json.loads(cached)

    traits = db.query(Trait).all()
    result = [TraitResponse.model_validate(t).model_dump() for t in traits]
    r.setex(TRAITS_CACHE_KEY, CACHE_TTL, json.dumps(result, default=str))
    return traits

@router.post("/", response_model=TraitResponse)
async def create_trait(
    name: str = Form(...),
    description: str = Form(None),
    milestones: str = Form("[]"),
    image_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key)
):
    if db.query(Trait).filter(Trait.name == name).first():
        raise HTTPException(status_code=400, detail="Tên đã tồn tại")

    file_name = f"traits/{uuid.uuid4()}.{image_file.filename.split('.')[-1]}"
    img_url = upload_to_r2(image_file.file, file_name, image_file.content_type)

    new_trait = Trait(
        name=name, 
        description=description, 
        image=img_url, 
        milestones=json.loads(milestones)
    )
    db.add(new_trait)
    db.commit()
    db.refresh(new_trait)
    
    r.delete(TRAITS_CACHE_KEY)
    return new_trait

def bulk_sync_traits(body: List[TraitCreate], db: Session = Depends(get_db), r: redis.Redis = Depends(get_redis), _=Depends(verify_api_key)):
    for item in body:
        data = item.model_dump()
        existing = db.query(Trait).filter(Trait.name == item.name).first()
        if existing:
            for key, value in data.items(): setattr(existing, key, value)
        else:
            db.add(Trait(**data))
    db.commit()
    r.delete(TRAITS_CACHE_KEY)
    return {"status": "success"}

@router.delete("/{id}")
def delete_trait(id: int, db: Session = Depends(get_db), r: redis.Redis = Depends(get_redis), _=Depends(verify_api_key)):
    trait = db.query(Trait).filter(Trait.id == id).first()
    if not trait: raise HTTPException(status_code=404, detail="Không tìm thấy")
    db.delete(trait)
    db.commit()
    r.delete(TRAITS_CACHE_KEY)
    return {"message": "Đã xóa thành công"}

@router.post("/bulk", response_model=TraitBulkResponse)
def bulk_insert_traits(
    traits: List[TraitCreate], 
    db: Session = Depends(get_db), 
    r: redis.Redis = Depends(get_redis), 
    _=Depends(verify_api_key)
):
    try:
        db.execute(text("TRUNCATE TABLE traits RESTART IDENTITY CASCADE"))
        db.commit()
        db.add_all([Trait(**t.model_dump()) for t in traits])
        db.commit()
        r.delete(TRAITS_CACHE_KEY)

        return {"message": f"Đã insert {len(traits)} traits", "count": len(traits)}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))