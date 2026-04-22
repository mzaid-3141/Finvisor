from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app import schemas, services
from app.database import get_db
from app.auth import require_role
from app.models.enum import UserRoleEnum

router = APIRouter()


@router.post("/", response_model=schemas.AssetResponse)
def create_asset(
    asset: schemas.AssetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRoleEnum.ADMIN)),
):
    return services.asset.create_asset(db, asset)


@router.put("/{asset_id}", response_model=schemas.AssetResponse)
def update_asset(
    asset_id: int,
    asset: schemas.AssetUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRoleEnum.ADMIN)),
):
    return services.asset.update_asset(db, asset_id, asset)


@router.delete("/{asset_id}")
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRoleEnum.ADMIN)),
):
    return services.asset.delete_asset(db, asset_id)


@router.get("/", response_model=List[schemas.AssetResponse])
def list_assets(db: Session = Depends(get_db)):
    return services.asset.list_assets(db)


@router.get("/{asset_id}", response_model=schemas.AssetResponse)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    return services.asset.get_asset(db, asset_id)
