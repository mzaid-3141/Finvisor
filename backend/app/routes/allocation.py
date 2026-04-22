from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas, services
from app.database import get_db
from app.auth import require_role, get_current_user
from app.models.enum import UserRoleEnum

router = APIRouter()


@router.get("/{allocation_id}", response_model=schemas.AllocationResponse)
def get_allocation(
    allocation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return services.allocation.get_allocation(db, allocation_id, current_user.id)


@router.delete("/{allocation_id}")
def delete_allocation(
    allocation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRoleEnum.ADMIN)),
):
    return services.allocation.delete_allocation(db, allocation_id)
