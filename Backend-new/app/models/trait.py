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
    avg_placement = Column("avgPlacement", Float, nullable=True)
    top_rate      = Column("topRate", String, nullable=True)
    win_rate      = Column("winRate", String, nullable=True)
    games_played  = Column("gamesPlayed", Integer, default=0)
    icon_path     = Column("iconPath", String, nullable=True)
    milestones    = Column(JSON, default=list)
    created_at    = Column("created_at", DateTime(timezone=True), server_default=func.now())
    updated_at    = Column("updated_at", DateTime(timezone=True), onupdate=func.now())
