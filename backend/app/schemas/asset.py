from pydantic import BaseModel, Field
from typing import Optional
from app.models.enum import AssetTypeEnum


class AssetCreate(BaseModel):
    name: str
    asset_type: AssetTypeEnum
    risk_score: int = Field(..., ge=1, le=5)
    expected_return: float


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    asset_type: Optional[AssetTypeEnum] = None
    risk_score: Optional[int] = Field(None, ge=1, le=5)
    expected_return: Optional[float] = None


class AssetResponse(BaseModel):
    id: int
    name: str
    asset_type: AssetTypeEnum
    risk_score: int
    expected_return: float

    model_config = {"from_attributes": True}
