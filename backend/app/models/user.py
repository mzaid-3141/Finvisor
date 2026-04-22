from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.enum import UserRoleEnum

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(Enum(UserRoleEnum), default=UserRoleEnum.CUSTOMER)
    password = Column(String)

    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")
