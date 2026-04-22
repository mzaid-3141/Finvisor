from sqlalchemy import Column, Integer, String, Float, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.enum import AssetTypeEnum

class Asset(Base):
    __tablename__ = "asset_classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    asset_type = Column(Enum(AssetTypeEnum))
    risk_score = Column(Integer) 
    expected_return = Column(Float)

    allocations = relationship("Allocation", back_populates="asset", cascade="all, delete-orphan")
