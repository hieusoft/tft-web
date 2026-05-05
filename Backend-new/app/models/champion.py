from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, func, Numeric
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.skill import Skill
from app.models.item import Item

class ChampionTrait(Base):
    __tablename__ = "champion_traits"
    id = Column(Integer, primary_key=True)
    champion_id = Column(Integer, ForeignKey("champions.id", ondelete="CASCADE"))
    trait_id = Column(Integer, ForeignKey("traits.id", ondelete="CASCADE"))

class Champion(Base):
    __tablename__ = "champions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(50 ), unique=True, index=True)
    cost = Column(Integer)
    rank = Column(String(20))
    avg_placement = Column(Float)
    win_rate = Column(String(20))
    games_played = Column(String(50))
    pick_rate = Column(String(50))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    base_stats = Column(JSONB) 
    icon_path = Column(String(255))
    splash_path = Column(String(255))
    skill = relationship("Skill", backref="champion", uselist=False)
    traits = relationship("Trait", secondary="champion_traits", backref="champions")
    best_builds = relationship("ChampionBuildStats", backref="champion")
    best_items = relationship("ChampionItemStats", backref="champion")

class ChampionBuildStats(Base):
    __tablename__ = "champion_build_stats"
    id = Column(Integer, primary_key=True)
    champion_id = Column(Integer, ForeignKey("champions.id"))
    item_1_id = Column(Integer, ForeignKey("items.id"))
    item_2_id = Column(Integer, ForeignKey("items.id"))
    item_3_id = Column(Integer, ForeignKey("items.id"))
    avg_placement = Column(Numeric(5, 2))
    win_rate = Column(String(10))
    item_1 = relationship("Item", foreign_keys=[item_1_id])
    item_2 = relationship("Item", foreign_keys=[item_2_id])
    item_3 = relationship("Item", foreign_keys=[item_3_id])

class ChampionItemStats(Base):
    __tablename__ = "champion_item_stats"
    id = Column(Integer, primary_key=True)
    champion_id = Column(Integer, ForeignKey("champions.id"))
    item_id = Column(Integer, ForeignKey("items.id"))
    avg_placement = Column(String(10))
    win_rate = Column(String(10))
    match_count = Column(Integer)
    pick_percent = Column(String(50))
    rank_priority = Column(Integer)
    item = relationship("Item")