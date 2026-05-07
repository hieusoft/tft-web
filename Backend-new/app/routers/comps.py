import json
import logging
import time
from typing import List, Dict, Optional

import redis
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session, load_only

from app.core.database import get_db
from app.core.redis import get_redis
from app.dependencies import verify_api_key
from app.models.comp import Comp
from app.models.champion import Champion, ChampionTrait
from app.models.item import Item
from app.models.augment import Augment
from app.models.trait import Trait
from app.schemas.comp import CompBulkResponse, CompCreate, CompResponse, CompUpdate

logger = logging.getLogger(__name__)
router = APIRouter()

COMPS_CACHE_KEY = "comps:all:v3"
COMP_CACHE_KEY_PREFIX = "comps:v3:"
CACHE_TTL = 3600

_MAPS_CACHE: Optional[dict] = None
_MAPS_CACHE_TIME: float = 0
_MAPS_CACHE_TTL: float = 300


def _get_comp_or_404(comp_id: int, db: Session) -> Comp:
    comp = db.query(Comp).filter(Comp.id == comp_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy đội hình id={comp_id}")
    return comp


def _invalidate_list_cache(r: redis.Redis) -> None:
    global _MAPS_CACHE, _MAPS_CACHE_TIME
    _MAPS_CACHE = None
    _MAPS_CACHE_TIME = 0
    try:
        r.delete(COMPS_CACHE_KEY)
    except Exception:
        pass


def _safe_int(val) -> Optional[int]:
    try:
        return int(val)
    except (ValueError, TypeError):
        return None


def _find(val, by_id: dict, by_name: dict):
    iid = _safe_int(val)
    if iid is not None:
        return by_id.get(iid)
    return by_name.get(str(val).strip())


def _build_lookup_maps(db: Session) -> dict:
    global _MAPS_CACHE, _MAPS_CACHE_TIME

    if _MAPS_CACHE and (time.time() - _MAPS_CACHE_TIME) < _MAPS_CACHE_TTL:
        return _MAPS_CACHE

    all_champions = (
        db.query(Champion)
        .options(load_only(Champion.id, Champion.name, Champion.slug, Champion.cost, Champion.icon_path))
        .all()
    )
    all_items = (
        db.query(Item)
        .options(load_only(Item.id, Item.name, Item.slug, Item.image))
        .all()
    )
    all_augments = (
        db.query(Augment)
        .options(load_only(Augment.id, Augment.name, Augment.description, Augment.tier, Augment.image))
        .all()
    )
    all_traits = (
        db.query(Trait)
        .options(load_only(Trait.id, Trait.name, Trait.slug, Trait.image, Trait.milestones))
        .all()
    )
    all_champ_traits = db.query(ChampionTrait).all()

    champ_trait_map: Dict[int, List[int]] = {}
    for ct in all_champ_traits:
        champ_trait_map.setdefault(ct.champion_id, []).append(ct.trait_id)

    _MAPS_CACHE = {
        "champ_by_id": {c.id: c for c in all_champions},
        "champ_by_name": {c.name.strip(): c for c in all_champions},
        "item_by_id": {i.id: i for i in all_items},
        "item_by_name": {i.name.strip(): i for i in all_items},
        "aug_by_id": {a.id: a for a in all_augments},
        "aug_by_name": {a.name.strip(): a for a in all_augments},
        "champ_trait_map": champ_trait_map,
        "trait_by_id": {t.id: t for t in all_traits},
    }
    _MAPS_CACHE_TIME = time.time()
    return _MAPS_CACHE


def _enrich_comp(comp: Comp, maps: dict) -> dict:
    cbi, cbn = maps["champ_by_id"], maps["champ_by_name"]
    ibi, ibn = maps["item_by_id"], maps["item_by_name"]
    abi, abn = maps["aug_by_id"], maps["aug_by_name"]

    enriched_board = None
    if comp.final_board and isinstance(comp.final_board, list):
        enriched_board = []
        for slot in comp.final_board:
            if not isinstance(slot, dict):
                continue

            champ_dict = None
            champ_val = slot.get("champion")
            if champ_val is not None:
                champ = _find(champ_val, cbi, cbn)
                if champ:
                    champ_dict = {
                        "id": champ.id,
                        "name": champ.name,
                        "slug": champ.slug,
                        "cost": champ.cost,
                        "icon_path": champ.icon_path,
                    }

            slot_items = []
            for item_val in slot.get("items", []):
                if item_val is None:
                    continue
                item = _find(item_val, ibi, ibn)
                if item:
                    slot_items.append({
                        "id": item.id,
                        "name": item.name,
                        "slug": item.slug,
                        "image": item.image,
                    })

            enriched_board.append({
                "champion": champ_dict,
                "items": slot_items,
                "is_three_star": slot.get("is_three_star", False),
            })

    enriched_carousel = []
    if comp.carousel_priority:
        for val in comp.carousel_priority:
            item = _find(val, ibi, ibn)
            if item:
                enriched_carousel.append({
                    "id": item.id, "name": item.name,
                    "slug": item.slug, "image": item.image,
                })

    enriched_augments = []
    if comp.recommended_augments:
        for val in comp.recommended_augments:
            aug = _find(val, abi, abn)
            if aug:
                enriched_augments.append({
                    "id": aug.id, "name": aug.name,
                    "description": aug.description,
                    "tier": aug.tier, "image": aug.image,
                })

    active_traits = []
    if comp.final_board and isinstance(comp.final_board, list):
        champ_trait_map = maps["champ_trait_map"]
        trait_by_id = maps["trait_by_id"]

        trait_count: Dict[int, int] = {}
        for slot in comp.final_board:
            if not isinstance(slot, dict):
                continue
            champ_val = slot.get("champion")
            if champ_val is None:
                continue
            champ = _find(champ_val, cbi, cbn)
            if not champ:
                continue
            for trait_id in champ_trait_map.get(champ.id, []):
                trait_count[trait_id] = trait_count.get(trait_id, 0) + 1

        for trait_id, count in sorted(trait_count.items(), key=lambda x: x[1], reverse=True):
            trait = trait_by_id.get(trait_id)
            if not trait:
                continue

            current_style = 0
            total_styles = 0
            milestones = trait.milestones or []
            if isinstance(milestones, list):
                total_styles = len(milestones)
                for i, ms in enumerate(milestones):
                    min_units = ms if isinstance(ms, int) else ms.get("min_units", 0) if isinstance(ms, dict) else 0
                    if count >= min_units:
                        current_style = i + 1

            active_traits.append({
                "id": trait.id, "name": trait.name,
                "slug": trait.slug, "image": trait.image,
                "count": count,
                "current_style": current_style,
                "total_styles": total_styles,
            })

    return {
        "id": comp.id,
        "name": comp.name,
        "tier": comp.tier,
        "playstyle": comp.playstyle,
        "avg_placement": comp.avg_placement,
        "final_board": enriched_board,
        "carousel_priority": enriched_carousel,
        "recommended_augments": enriched_augments,
        "active_traits": active_traits,
    }


# ── Endpoints ─────────────────────────────────────────────────────────────


@router.delete("/cache", summary="Xóa cache")
def clear_comps_cache(r: redis.Redis = Depends(get_redis), _=Depends(verify_api_key)):
    try:
        for key in r.scan_iter("comps:*"):
            r.delete(key)
        global _MAPS_CACHE, _MAPS_CACHE_TIME
        _MAPS_CACHE = None
        _MAPS_CACHE_TIME = 0
        return {"message": "Đã xóa toàn bộ cache comps"}
    except Exception as exc:
        return {"message": f"Lỗi khi xóa cache: {exc}"}


@router.get("/", summary="Lấy toàn bộ đội hình")
def get_all_comps(
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    t0 = time.perf_counter()

    try:
        cached = r.get(COMPS_CACHE_KEY)
        if cached:
            print(f"⚡ Cache hit: {(time.perf_counter() - t0) * 1000:.0f}ms")
            return json.loads(cached)
    except Exception:
        pass

    t1 = time.perf_counter()
    maps = _build_lookup_maps(db)
    t2 = time.perf_counter()
    comps = db.query(Comp).order_by(Comp.id).all()
    t3 = time.perf_counter()
    result = [_enrich_comp(c, maps) for c in comps]
    t4 = time.perf_counter()

    try:
        r.setex(COMPS_CACHE_KEY, CACHE_TTL, json.dumps(result))
    except Exception:
        pass
    t5 = time.perf_counter()

    print(
        f"📊 maps={( t2 - t1) * 1000:.0f}ms | query={(t3 - t2) * 1000:.0f}ms "
        f"| enrich={(t4 - t3) * 1000:.0f}ms | cache={(t5 - t4) * 1000:.0f}ms "
        f"| total={(t5 - t0) * 1000:.0f}ms"
    )

    return result


@router.get("/{comp_id}", summary="Lấy chi tiết đội hình")
def get_comp(
    comp_id: int,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    cache_key = f"{COMP_CACHE_KEY_PREFIX}{comp_id}"

    try:
        cached = r.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception:
        pass

    comp = _get_comp_or_404(comp_id, db)
    maps = _build_lookup_maps(db)
    result = _enrich_comp(comp, maps)

    try:
        r.setex(cache_key, CACHE_TTL, json.dumps(result))
    except Exception:
        pass

    return result


@router.post("/", response_model=CompResponse, status_code=201, summary="Tạo đội hình")
def create_comp(
    body: CompCreate,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    if db.query(Comp).filter(Comp.name == body.name).first():
        raise HTTPException(status_code=400, detail=f"Đội hình '{body.name}' đã tồn tại")

    new_comp = Comp(**body.model_dump())
    db.add(new_comp)

    try:
        db.commit()
        db.refresh(new_comp)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi máy chủ khi tạo đội hình") from exc

    _invalidate_list_cache(r)
    return new_comp


@router.post("/bulk", response_model=CompBulkResponse, status_code=201, summary="Bulk sync đội hình")
def bulk_sync_comps(
    body: List[CompCreate],
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    if not body:
        raise HTTPException(status_code=422, detail="Danh sách đội hình không được rỗng")

    try:
        db.execute(text("TRUNCATE TABLE comps RESTART IDENTITY CASCADE;"))
        for item in body:
            db.add(Comp(**item.model_dump()))
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi bulk sync: {exc}") from exc

    _invalidate_list_cache(r)
    return CompBulkResponse(
        status="success",
        message=f"Đã nạp mới {len(body)} đội hình thành công.",
        inserted=len(body),
    )


@router.patch("/{comp_id}", response_model=CompResponse, summary="Cập nhật đội hình")
def update_comp(
    comp_id: int,
    body: CompUpdate,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    comp = _get_comp_or_404(comp_id, db)
    update_data = body.model_dump(exclude_none=True)

    if "name" in update_data and update_data["name"] != comp.name:
        if db.query(Comp).filter(Comp.name == update_data["name"]).first():
            raise HTTPException(status_code=400, detail=f"Tên '{update_data['name']}' đã tồn tại")

    for key, value in update_data.items():
        setattr(comp, key, value)

    try:
        db.commit()
        db.refresh(comp)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi cập nhật đội hình") from exc

    _invalidate_list_cache(r)
    r.delete(f"{COMP_CACHE_KEY_PREFIX}{comp_id}")
    return comp


@router.delete("/{comp_id}", status_code=200, summary="Xoá đội hình")
def delete_comp(
    comp_id: int,
    db: Session = Depends(get_db),
    r: redis.Redis = Depends(get_redis),
    _=Depends(verify_api_key),
):
    comp = _get_comp_or_404(comp_id, db)

    try:
        db.delete(comp)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi xoá đội hình") from exc

    _invalidate_list_cache(r)
    r.delete(f"{COMP_CACHE_KEY_PREFIX}{comp_id}")
    return {"message": f"Đã xoá đội hình id={comp_id}"}
