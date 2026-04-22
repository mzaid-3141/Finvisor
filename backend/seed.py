"""
Seed script — run once to bootstrap the database.

Creates:
  - Admin user  (admin@finvisor.com / Admin@1234)
  - 5 asset classes covering the full risk spectrum

Usage:
    cd backend
    source venv/bin/activate
    python seed.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.asset import Asset
from app.models.enum import UserRoleEnum
from app.auth import hash_password

ADMIN_EMAIL    = "admin@finvisor.com"
ADMIN_PASSWORD = "Admin@1234"
ADMIN_NAME     = "Admin"

ASSETS = [
    {"name": "Government Bonds", "asset_type": "Bond",          "risk_score": 1, "expected_return": 3.5},
    {"name": "Corporate Bonds",  "asset_type": "Bond",          "risk_score": 2, "expected_return": 5.0},
    {"name": "Blue Chip Stocks", "asset_type": "Stock",         "risk_score": 3, "expected_return": 8.0},
    {"name": "Growth Stocks",    "asset_type": "Stock",         "risk_score": 4, "expected_return": 12.0},
    {"name": "Crypto",           "asset_type": "Crypto",        "risk_score": 5, "expected_return": 25.0},
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ── Admin user ───────────────────────────────────────────────────────
        if db.query(User).filter(User.email == ADMIN_EMAIL).first():
            print(f"  [skip] admin user already exists ({ADMIN_EMAIL})")
        else:
            admin = User(
                name=ADMIN_NAME,
                email=ADMIN_EMAIL,
                hashed_password=hash_password(ADMIN_PASSWORD),
                role=UserRoleEnum.ADMIN,
            )
            db.add(admin)
            db.commit()
            print(f"  [ok]   admin user created  →  {ADMIN_EMAIL}  /  {ADMIN_PASSWORD}")

        # ── Asset classes ────────────────────────────────────────────────────
        for a in ASSETS:
            exists = (
                db.query(Asset)
                .filter(Asset.name == a["name"])
                .first()
            )
            if exists:
                print(f"  [skip] asset already exists: {a['name']}")
            else:
                db.add(Asset(**a))
                print(f"  [ok]   asset created: {a['name']} (risk {a['risk_score']})")

        db.commit()
        print("\nSeed complete.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
