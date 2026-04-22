from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import user, asset, portfolio, allocation

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(asset.router, prefix="/assets", tags=["assets"])
app.include_router(portfolio.router, prefix="/portfolios", tags=["portfolios"])
app.include_router(allocation.router, prefix="/allocations", tags=["allocations"])