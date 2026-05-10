from sqlalchemy import Column, Integer, String, Text, Float, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class Trait(Base):
    __tablename__ = "traits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True)
    description = Column(Text)
    tier = Column(String(10))
    placement = Column(String(50))
    top4 = Column(String(20))
    pick_count = Column(String(50))
    pick_percent = Column(String(20))
    image = Column(String(255))
    milestones = Column(JSONB)