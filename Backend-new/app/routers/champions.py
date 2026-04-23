import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
import redis

from app.core.database import get_db
from app.core.redis import get_redis
from app.dependencies import verify_api_key
from app.models.champion import Champion
from app.schemas.champion import ChampionCreate, ChampionResponse, ChampionUpdateMeta, ChampionUpdate

router = APIRouter()

CHAMPIONS_CACHE_KEY = "champions:all"
CACHE_TTL = 60 * 5

@router.get("/", response_model=List[ChampionResponse])
def get_all(
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    cached = r.get(CHAMPIONS_CACHE_KEY)
    if cached:
        return json.loads(cached)

    champions = db.query(Champion).options(joinedload(Champion.skill)).all()
    result = [ChampionResponse.from_orm_champion(c).model_dump() for c in champions]  # ✅
    r.setex(CHAMPIONS_CACHE_KEY, CACHE_TTL, json.dumps(result, default=str))
    return result


@router.post("/", response_model=ChampionResponse)
def create(
    body: ChampionCreate,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    db_champ = db.query(Champion).filter(Champion.name == body.name).first()
    if db_champ:
        raise HTTPException(status_code=400, detail="Tướng với tên này đã tồn tại!")

    champ = Champion(**body.model_dump())
    try:
        db.add(champ)
        db.commit()
        db.refresh(champ)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Lỗi! Có thể skill_id bạn truyền vào chưa được tạo trong bảng Skills.")

    r.delete(CHAMPIONS_CACHE_KEY)
    return ChampionResponse.from_orm_champion(champ)  

@router.patch("/{id}", response_model=ChampionResponse)
def update_champion(
    id: int,
    body: ChampionUpdate,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    champ = db.query(Champion).options(joinedload(Champion.skill)).filter(Champion.id == id).first()
    if not champ:
        raise HTTPException(status_code=404, detail="Tướng không tồn tại")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(champ, field, value)

    try:
        db.commit()
        db.refresh(champ)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Lỗi! skill_id không tồn tại trong bảng Kỹ năng.")

    r.delete(CHAMPIONS_CACHE_KEY)
    return ChampionResponse.from_orm_champion(champ) 


@router.patch("/{id}/meta", response_model=ChampionResponse)
def update_champion_meta(
    id: int,
    body: ChampionUpdateMeta,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    champ = db.query(Champion).options(joinedload(Champion.skill)).filter(Champion.id == id).first()
    if not champ:
        raise HTTPException(status_code=404, detail="Tướng không tồn tại")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(champ, field, value)

    db.commit()
    db.refresh(champ)
    r.delete(CHAMPIONS_CACHE_KEY)
    return ChampionResponse.from_orm_champion(champ) 


@router.delete("/{id}")
def delete(
    id: int,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    champ = db.query(Champion).filter(Champion.id == id).first()
    if not champ:
        raise HTTPException(status_code=404, detail="Tướng không tồn tại")

    db.delete(champ)
    db.commit()
    r.delete(CHAMPIONS_CACHE_KEY)
    return {"message": f"Đã xóa thành công tướng ID {id}"}

@router.delete("/cache/clear")
def clear_cache(r: redis.Redis = Depends(get_redis), _=Depends(verify_api_key)):
    r.delete(CHAMPIONS_CACHE_KEY)
    return {"message": "Cache đã được xóa"}