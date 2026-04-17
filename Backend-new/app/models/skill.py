from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    mana_start = Column(Integer, default=0)
    mana_max = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    ability_stats = Column(JSONB, nullable=True)
    icon_path = Column(String(255), nullable=True)