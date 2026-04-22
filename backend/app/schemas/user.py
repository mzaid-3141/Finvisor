from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models.enum import UserRoleEnum


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[UserRoleEnum] = UserRoleEnum.CUSTOMER


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int

    model_config = {"from_attributes": True}
