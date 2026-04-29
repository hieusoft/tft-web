from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Augment(Base):
    __tablename__ = "augments"
    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String(150), unique=True, nullable=False)
    description  = Column(Text, nullable=True)
    tier         = Column(Integer, nullable=True) 
    rank         = Column(String(10), nullable=True)
    image        = Column(String(255), nullable=True)