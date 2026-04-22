from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Allocation(Base):
    __tablename__ = "allocations"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"))
    asset_class_id = Column(Integer, ForeignKey("asset_classes.id", ondelete="CASCADE"))
    percentage = Column(Float)
    amount = Column(Float)

    portfolio = relationship("Portfolio", back_populates="allocations")
    asset = relationship("Asset", back_populates="allocations")
