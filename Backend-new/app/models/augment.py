from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base

class Augment(Base):
    __tablename__ = "augments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    tier = Column(Integer, nullable=False)
    icon_path = Column(String(255), nullable=True)
    ranking = Column(String(10), nullable=True)