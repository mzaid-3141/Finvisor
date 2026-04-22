from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.allocation import AllocationResponse


class PortfolioCreate(BaseModel):
    capital: float = Field(..., gt=0, description="Total investment capital")
    risk_level: int = Field(..., ge=1, le=5, description="Risk appetite: 1 (lowest) to 5 (highest)")


class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class PortfolioResponse(BaseModel):
    id: int
    capital: float
    risk_level: int
    name: Optional[str] = None
    description: Optional[str] = None
    allocations: List[AllocationResponse] = []

    model_config = {"from_attributes": True}
