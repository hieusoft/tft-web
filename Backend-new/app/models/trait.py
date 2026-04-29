from sqlalchemy import Column, Integer, String, Float, JSON, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Trait(Base):
    __tablename__ = "traits"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String(100), unique=True, nullable=False, index=True)
    description  = Column(Text, nullable=True)
    tier         = Column(String(10), nullable=True)     
    placement    = Column(Float, nullable=True)          
    top4         = Column(String(20), nullable=True)     
    pick_count   = Column(String(50), nullable=True)     
    pick_percent = Column(String(20), nullable=True)     
    image        = Column(String(512), nullable=True) 
    milestones   = Column(JSON, nullable=False, server_default='[]') 
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())