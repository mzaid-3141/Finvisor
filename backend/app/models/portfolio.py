from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    name = Column(String, nullable=True)
    description = Column(String, nullable=True)
    capital = Column(Float)
    risk_level = Column(Integer)  # 1-5

    user = relationship("User", back_populates="portfolios")
    allocations = relationship("Allocation", back_populates="portfolio", cascade="all, delete-orphan")
