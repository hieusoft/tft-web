from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base 

class God(Base):
    __tablename__ = "gods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    slug = Column(String(100), unique=True, index=True)
    trait = Column(String(100))
    rank = Column(String(10))
    stages = Column(JSONB) 
    image = Column(String(255))
    boon_augment_id = Column(Integer, ForeignKey("augments.id"), nullable=True)
    augment = relationship("Augment", backref="gods")