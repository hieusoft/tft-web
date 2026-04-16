from sqlalchemy import Column, Integer, String, Text, Float # Bổ sung Float
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    category = Column(String(20), nullable=False)
    component_1 = Column(Integer, nullable=True)
    component_2 = Column(Integer, nullable=True)
    stats = Column(JSONB, nullable=True)
    icon_path = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    avg_placement = Column(Float, nullable=True)
    top_4_rate = Column(String(20), nullable=True)
    win_rate = Column(String(20), nullable=True)
    games_played = Column(Integer, default=0)