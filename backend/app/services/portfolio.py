from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.portfolio import Portfolio
from app.models.allocation import Allocation
from app.models.asset import Asset
from app.schemas.portfolio import PortfolioCreate, PortfolioUpdate


def create_portfolio(db: Session, portfolio_data: PortfolioCreate, user_id: int):
    new_portfolio = Portfolio(
        user_id=user_id,
        capital=portfolio_data.capital,
        risk_level=portfolio_data.risk_level,
    )
    db.add(new_portfolio)
    db.commit()
    db.refresh(new_portfolio)

    assets = db.query(Asset).all()
    _create_allocations(db, new_portfolio, assets)

    db.refresh(new_portfolio)
    return new_portfolio


def _create_allocations(db: Session, portfolio: Portfolio, assets: list):
    if not assets:
        return

    # Weight each asset by proximity to target risk: weight = 2^(5 - distance)
    # Closer to the target risk level => exponentially higher allocation
    weights = {}
    for asset in assets:
        distance = abs(portfolio.risk_level - asset.risk_score)
        weights[asset.id] = 2 ** (5 - distance)

    total_weight = sum(weights.values())

    for asset in assets:
        pct = weights[asset.id] / total_weight
        allocation = Allocation(
            portfolio_id=portfolio.id,
            asset_class_id=asset.id,
            percentage=round(pct * 100, 2),
            amount=round(portfolio.capital * pct, 2),
        )
        db.add(allocation)

    db.commit()


def update_portfolio(db: Session, portfolio_id: int, portfolio_data: PortfolioUpdate, user_id: int):
    db_portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not db_portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    if db_portfolio.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if portfolio_data.name is not None:
        db_portfolio.name = portfolio_data.name
    if portfolio_data.description is not None:
        db_portfolio.description = portfolio_data.description

    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio


def delete_portfolio(db: Session, portfolio_id: int, user_id: int):
    db_portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not db_portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    if db_portfolio.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(db_portfolio)
    db.commit()
    return {"message": "Portfolio deleted successfully"}


def get_portfolio(db: Session, portfolio_id: int, user_id: int):
    db_portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not db_portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    if db_portfolio.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db_portfolio


def list_portfolios(db: Session, user_id: int):
    return db.query(Portfolio).filter(Portfolio.user_id == user_id).all()
