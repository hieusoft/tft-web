import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import List

router = APIRouter()

# Đường dẫn tuyệt đối đến thư mục Images (nằm ở gốc Backend-new)
IMAGES_DIR = Path(__file__).resolve().parents[2] / "Images"

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}


@router.get("/", response_model=List[str], summary="Lấy danh sách tên file ảnh")
def list_images():
    """Trả về danh sách tên tất cả các file ảnh trong thư mục Images."""
    if not IMAGES_DIR.exists():
        raise HTTPException(status_code=404, detail="Thư mục Images không tồn tại")

    files = [
        f.name
        for f in IMAGES_DIR.iterdir()
        if f.is_file() and f.suffix.lower() in ALLOWED_EXTENSIONS
    ]
    return sorted(files)


@router.get("/{filename}", summary="Lấy ảnh theo tên file")
def get_image(filename: str):
    """Trả về file ảnh theo tên. Ví dụ: /api/v1/images/TFT17_Nami_Square.TFT_Set17.jpg"""
    # Chặn path traversal attack
    safe_name = Path(filename).name
    if safe_name != filename:
        raise HTTPException(status_code=400, detail="Tên file không hợp lệ")

    file_path = IMAGES_DIR / safe_name

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail=f"Không tìm thấy ảnh: {filename}")

    if file_path.suffix.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Định dạng file không được hỗ trợ")

    return FileResponse(
        path=str(file_path),
        media_type=_get_media_type(file_path.suffix.lower()),
        headers={
            "Content-Disposition": f'inline; filename="{safe_name}"'
        }
    )


def _get_media_type(ext: str) -> str:
    mapping = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
    }
    return mapping.get(ext, "application/octet-stream")
