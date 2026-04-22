from app.database import Base, engine
from app.models.user import User
from app.models.asset import Asset
from app.models.portfolio import Portfolio
from app.models.allocation import Allocation

Base.metadata.create_all(bind=engine)

print("Tables created successfully!")
