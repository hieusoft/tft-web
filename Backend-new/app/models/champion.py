from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class Champion(Base):
    __tablename__ = "champions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    cost = Column(Integer, nullable=False)
    accent_color = Column(String(7), nullable=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)
    base_stats = Column(JSONB, nullable=True)
    icon_path = Column(String(255), nullable=True)
    splash_path = Column(String(255), nullable=True)
    avg_placement = Column(Float, nullable=True)
    top_4_rate = Column(String(20), nullable=True)
    win_rate = Column(String(20), nullable=True)
    match_count = Column(Integer, default=0)
    skill = relationship("Skill")