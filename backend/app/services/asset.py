from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetUpdate


def create_asset(db: Session, asset_data: AssetCreate):
    new_asset = Asset(
        name=asset_data.name,
        asset_type=asset_data.asset_type,
        risk_score=asset_data.risk_score,
        expected_return=asset_data.expected_return,
    )
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset


def update_asset(db: Session, asset_id: int, asset_data: AssetUpdate):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")

    if asset_data.name is not None:
        asset.name = asset_data.name
    if asset_data.asset_type is not None:
        asset.asset_type = asset_data.asset_type
    if asset_data.risk_score is not None:
        asset.risk_score = asset_data.risk_score
    if asset_data.expected_return is not None:
        asset.expected_return = asset_data.expected_return

    db.commit()
    db.refresh(asset)
    return asset


def delete_asset(db: Session, asset_id: int):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    db.delete(asset)
    db.commit()
    return {"message": "Asset deleted successfully"}


def get_asset(db: Session, asset_id: int):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


def list_assets(db: Session):
    return db.query(Asset).all()
