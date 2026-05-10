from sqlalchemy import Column, Integer, String, JSON, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True)
    category = Column(String(50))
    rank = Column(String(20))
    avg_placement = Column(String(50))
    win_rate = Column(String(20))
    frequency = Column(String(50))
    description = Column(String(500))
    stats = Column(JSON)
    image = Column(String(255))
    component_1 = Column(String(255), nullable=True)
    component_2 = Column(String(255), nullable=True)
    best_users = relationship("ChampionItemStats", back_populates="item")