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
    avg_placement = Column(Float, default=0.0)
    win_rate = Column(String(20))
    games_played = Column(String(50))
    pick_rate = Column(String(20))
    description = Column(String(500))
    stats = Column(JSON)
    image = Column(String(255))
    component_1_id = Column("component_1", Integer, ForeignKey("items.id"), nullable=True)
    component_2_id = Column("component_2", Integer, ForeignKey("items.id"), nullable=True)
    component_1 = relationship("Item", foreign_keys=[component_1_id], remote_side=[id])
    component_2 = relationship("Item", foreign_keys=[component_2_id], remote_side=[id])