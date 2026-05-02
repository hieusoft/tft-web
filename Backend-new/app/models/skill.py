from sqlalchemy import Column, Integer, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    slug = Column(String(100), unique=True)
    mana_start = Column(Integer)
    mana_max = Column(Integer)
    description = Column(Text)
    ability_stats = Column(JSONB)
    icon_path = Column(String(255))
