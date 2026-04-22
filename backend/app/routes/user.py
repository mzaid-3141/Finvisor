from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, services
from app.database import get_db
from app.auth import get_current_user
from app.schemas.user import UserResponse
from app.models.enum import UserRoleEnum

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if user.role != UserRoleEnum.CUSTOMER:
        raise HTTPException(
            status_code=403,
            detail="Sign up is only available for customers. Admin accounts are provisioned by the system.",
        )
    return services.user.create_user(db, user)

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    return services.user.login_user(db, user)

@router.get("/me", response_model=UserResponse)
def get_me(current_user=Depends(get_current_user)):
    return current_user
