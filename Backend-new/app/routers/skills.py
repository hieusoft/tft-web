import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import redis

from app.core.database import get_db
from app.core.redis import get_redis
from app.models.skill import Skill
from app.schemas.skill import SkillCreate, SkillResponse, SkillUpdate

router = APIRouter()

SKILLS_CACHE_KEY = "skills:all"
CACHE_TTL = 60 * 5


@router.get("/", response_model=List[SkillResponse])
def get_all(
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    cached = r.get(SKILLS_CACHE_KEY)
    if cached:
        return json.loads(cached)

    skills = db.query(Skill).all()
    result = [SkillResponse.from_orm_skill(s).model_dump() for s in skills]  # ✅
    r.setex(SKILLS_CACHE_KEY, CACHE_TTL, json.dumps(result, default=str))
    return result


@router.get("/{id}", response_model=SkillResponse)
def get_skill(
    id: int,
    db: Session = Depends(get_db),
):
    skill = db.query(Skill).filter(Skill.id == id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Kỹ năng không tồn tại")
    return SkillResponse.from_orm_skill(skill)




@router.post("/", response_model=SkillResponse)
def create(
    body: SkillCreate,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    db_skill = db.query(Skill).filter(Skill.name == body.name).first()
    if db_skill:
        raise HTTPException(status_code=400, detail="Kỹ năng với tên này đã tồn tại!")

    skill = Skill(**body.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    r.delete(SKILLS_CACHE_KEY)
    return SkillResponse.from_orm_skill(skill)  # ✅


@router.patch("/{id}", response_model=SkillResponse)
def update_skill(
    id: int,
    body: SkillUpdate,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    skill = db.query(Skill).filter(Skill.id == id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Kỹ năng không tồn tại")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(skill, field, value)

    db.commit()
    db.refresh(skill)
    r.delete(SKILLS_CACHE_KEY)
    return SkillResponse.from_orm_skill(skill)  # ✅


@router.delete("/{id}")
def delete(
    id: int,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
):
    skill = db.query(Skill).filter(Skill.id == id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Kỹ năng không tồn tại")
    try:
        db.delete(skill)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Không thể xóa! Đang có Tướng sử dụng Kỹ năng này.")

    r.delete(SKILLS_CACHE_KEY)
    return {"message": f"Đã xóa thành công kỹ năng ID {id}"}

