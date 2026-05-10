from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from app.core.database import Base


class Comp(Base):
    __tablename__ = "comps"

    id: int = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name: str = Column(String(255), nullable=False, unique=True, index=True)
    slug: str = Column(String(255), nullable=False, unique=True, index=True)
    tier: str = Column(String(2), nullable=False)         
    playstyle: str = Column(String(100), nullable=True)
    avg_placement: str = Column(String(50), nullable=True)
    final_board: dict = Column(JSONB, nullable=True)
    carousel_priority: list = Column(ARRAY(Text), nullable=True, default=list)
    recommended_augments: list = Column(ARRAY(Text), nullable=True, default=list)
