from sqlalchemy import Column, Integer, String, Text, Float, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50))
    rank = Column(String(10))
    avg_placement = Column(Float) 
    win_rate = Column(String(20))     
    games_played = Column(String(50)) 
    pick_rate = Column(String(20))    
    description = Column(Text)
    stats = Column(JSONB)
    component_1 = Column(Integer, nullable=True)
    component_2 = Column(Integer, nullable=True)
    image = Column(String(255))