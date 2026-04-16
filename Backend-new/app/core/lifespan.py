"""
Quản lý vòng đời ứng dụng (startup / shutdown).
Khi khởi động: kiểm tra kết nối DB, tự động tạo bảng nếu chưa tồn tại.
"""
import logging
from contextlib import asynccontextmanager
from sqlalchemy import inspect, text

from app.core.database import Base, engine

# Import ĐỦ tất cả models ở đây để SQLAlchemy biết cần tạo bảng nào
from app.models import trait, augment, item  # noqa: F401

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app):
    """Startup / shutdown lifecycle của FastAPI."""
    # ── STARTUP ──────────────────────────────────────────
    logger.info("⏳  Đang kết nối tới PostgreSQL...")

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✅  Kết nối PostgreSQL thành công.")
    except Exception as e:
        logger.error(f"❌  Không thể kết nối PostgreSQL: {e}")
        raise

    # Kiểm tra từng bảng và tạo nếu chưa có
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    expected_tables = set(Base.metadata.tables.keys())

    missing = expected_tables - existing_tables

    if not missing:
        logger.info(f"✅  Tất cả {len(expected_tables)} bảng đã tồn tại: {sorted(expected_tables)}")
    else:
        logger.warning(f"⚠️   Các bảng chưa tồn tại: {sorted(missing)} — đang tạo...")
        Base.metadata.create_all(bind=engine, checkfirst=True)

        # Xác nhận lại sau khi tạo
        inspector = inspect(engine)
        created = set(inspector.get_table_names()) & missing
        logger.info(f"✅  Đã tạo thành công {len(created)} bảng: {sorted(created)}")

    # ── APP RUNNING ───────────────────────────────────────
    yield

    # ── SHUTDOWN ─────────────────────────────────────────
    logger.info("🛑  Ứng dụng đang tắt, đóng kết nối DB...")
    engine.dispose()
    logger.info("✅  Đã đóng kết nối DB.")
