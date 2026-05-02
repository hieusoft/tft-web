import json
import redis
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload, selectinload, defer
from typing import List
from app.core.database import get_db
from app.core.redis import get_redis
from app.models.champion import Champion, ChampionBuildStats, ChampionItemStats
from app.schemas.champion import ChampionListResponse, ChampionDetailResponse

router = APIRouter()
CACHE_KEY = "champions:all_list"

@router.get("/", response_model=List[ChampionListResponse])
def get_all(db: Session = Depends(get_db), r: redis.Redis = Depends(get_redis)):
    cached = r.get(CACHE_KEY)
    if cached: 
        return json.loads(cached)

    champs = db.query(Champion).options(
        joinedload(Champion.skill),
        selectinload(Champion.traits),
        selectinload(Champion.best_items).joinedload(ChampionItemStats.item),
        selectinload(Champion.best_builds).options(
            joinedload(ChampionBuildStats.item_1),
            joinedload(ChampionBuildStats.item_2),
            joinedload(ChampionBuildStats.item_3)
        )
    ).order_by(Champion.cost.desc()).all()
    result = [ChampionListResponse.model_validate(c).model_dump(mode='json') for c in champs]
    r.setex(CACHE_KEY, 300, json.dumps(result))
    
    return result

@router.get("/{slug}", response_model=ChampionDetailResponse)
def get_detail(slug: str, db: Session = Depends(get_db)):
    champ = db.query(Champion).options(
        defer(Champion.icon_path),
        joinedload(Champion.skill),
        selectinload(Champion.traits),
        selectinload(Champion.best_items).joinedload(ChampionItemStats.item),
        selectinload(Champion.best_builds).options(
            joinedload(ChampionBuildStats.item_1),
            joinedload(ChampionBuildStats.item_2),
            joinedload(ChampionBuildStats.item_3)
        )
    ).filter(Champion.slug == slug).first()

    if not champ:
        raise HTTPException(status_code=404, detail="Không tìm thấy tướng")
    
    return champ