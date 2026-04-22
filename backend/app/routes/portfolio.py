from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app import schemas, services
from app.database import get_db
from app.auth import get_current_user
from app.schemas.portfolio import PortfolioResponse

router = APIRouter()


@router.get("/", response_model=List[PortfolioResponse])
def list_portfolios(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return services.portfolio.list_portfolios(db, current_user.id)


@router.post("/", response_model=PortfolioResponse)
def create_portfolio(
    portfolio: schemas.PortfolioCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return services.portfolio.create_portfolio(db, portfolio, current_user.id)


@router.put("/{portfolio_id}", response_model=PortfolioResponse)
def update_portfolio(
    portfolio_id: int,
    portfolio: schemas.PortfolioUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return services.portfolio.update_portfolio(db, portfolio_id, portfolio, current_user.id)


@router.delete("/{portfolio_id}")
def delete_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return services.portfolio.delete_portfolio(db, portfolio_id, current_user.id)


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
def get_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return services.portfolio.get_portfolio(db, portfolio_id, current_user.id)
