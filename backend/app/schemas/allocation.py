from pydantic import BaseModel
from app.schemas.asset import AssetResponse


class AllocationResponse(BaseModel):
    id: int
    asset_class_id: int
    asset: AssetResponse
    percentage: float
    amount: float

    model_config = {"from_attributes": True}
