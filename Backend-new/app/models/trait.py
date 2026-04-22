from sqlalchemy import Column, Integer, String, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from app.core.database import Base

class Trait(Base):
    __tablename__ = "traits"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100), unique=True, nullable=False)
    type          = Column(String(50), nullable=False)
    rank          = Column(String, nullable=True)
    avg_placement = Column("avg_placement", Float, nullable=True)
    top_rate      = Column("top_rate", String, nullable=True)
    win_rate      = Column("win_rate", String, nullable=True)
    games_played  = Column("games_played", Integer, default=0)
    icon_path     = Column("icon_path", String, nullable=True)
    milestones    = Column(JSON, default=list)
    created_at    = Column("created_at", DateTime(timezone=True), server_default=func.now())
    updated_at    = Column("updated_at", DateTime(timezone=True), onupdate=func.now())
