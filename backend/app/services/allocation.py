from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.allocation import Allocation
from app.models.portfolio import Portfolio


def get_allocation(db: Session, allocation_id: int, user_id: int):
    allocation = db.query(Allocation).filter(Allocation.id == allocation_id).first()
    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found")
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == allocation.portfolio_id,
        Portfolio.user_id == user_id,
    ).first()
    if not portfolio:
        raise HTTPException(status_code=403, detail="Not authorized")
    return allocation


def delete_allocation(db: Session, allocation_id: int):
    allocation = db.query(Allocation).filter(Allocation.id == allocation_id).first()
    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found")
    db.delete(allocation)
    db.commit()
    return {"message": "Allocation deleted successfully"}
