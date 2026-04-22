import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=True, bind=engine)

# ---------------------------------------------------------------------------
# Core client fixture
# ---------------------------------------------------------------------------

@pytest.fixture(scope="function")
def client():
    from app.database import Base, get_db
    from app.main import app

    Base.metadata.create_all(bind=engine)

    # Share one session across all requests in a test so that data committed by
    # one endpoint is immediately visible to the next (avoids SQLite isolation
    # issues with multiple independent connections).
    session = TestingSessionLocal()

    def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    session.close()
    Base.metadata.drop_all(bind=engine)


# ---------------------------------------------------------------------------
# Reusable helpers
# ---------------------------------------------------------------------------

ADMIN_PAYLOAD = {
    "name": "Admin",
    "email": "admin@finvisor.com",
    "password": "Admin@1234",
    "role": "Admin",
}

CUSTOMER_PAYLOAD = {
    "name": "Customer",
    "email": "customer@finvisor.com",
    "password": "Customer@1234",
    "role": "Customer",
}

ASSET_PAYLOAD = {
    "name": "Growth Stocks",
    "asset_type": "Stock",
    "risk_score": 4,
    "expected_return": 12.0,
}


def auth_headers(client, email: str, password: str) -> dict:
    resp = client.post("/users/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, f"login failed: {resp.json()}"
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def register_and_login(client, payload: dict) -> dict:
    client.post("/users/auth/signup", json=payload)
    return auth_headers(client, payload["email"], payload["password"])


# ---------------------------------------------------------------------------
# Convenience fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def admin_headers(client):
    """Seed an admin directly via the DB (bypasses signup role restriction)."""
    from app.database import get_db
    from app.models.user import User
    from app.models.enum import UserRoleEnum
    from app.auth import hash_password

    session = next(client.app.dependency_overrides[get_db]())
    admin = User(
        name=ADMIN_PAYLOAD["name"],
        email=ADMIN_PAYLOAD["email"],
        password=hash_password(ADMIN_PAYLOAD["password"]),
        role=UserRoleEnum.ADMIN,
    )
    session.add(admin)
    session.commit()
    return auth_headers(client, ADMIN_PAYLOAD["email"], ADMIN_PAYLOAD["password"])


@pytest.fixture
def customer_headers(client):
    return register_and_login(client, CUSTOMER_PAYLOAD)


@pytest.fixture
def second_customer_headers(client):
    payload = {
        "name": "Other",
        "email": "other@finvisor.com",
        "password": "Other@1234",
        "role": "Customer",
    }
    return register_and_login(client, payload)


@pytest.fixture
def sample_asset(client, admin_headers):
    resp = client.post("/assets/", json=ASSET_PAYLOAD, headers=admin_headers)
    assert resp.status_code == 200
    return resp.json()


@pytest.fixture
def five_assets(client, admin_headers):
    assets = [
        {"name": "Government Bonds", "asset_type": "Bond",   "risk_score": 1, "expected_return": 3.5},
        {"name": "Corporate Bonds",  "asset_type": "Bond",   "risk_score": 2, "expected_return": 5.0},
        {"name": "Blue Chip Stocks", "asset_type": "Stock",  "risk_score": 3, "expected_return": 8.0},
        {"name": "Growth Stocks",    "asset_type": "Stock",  "risk_score": 4, "expected_return": 12.0},
        {"name": "Crypto",           "asset_type": "Crypto", "risk_score": 5, "expected_return": 25.0},
    ]
    created = []
    for a in assets:
        r = client.post("/assets/", json=a, headers=admin_headers)
        assert r.status_code == 200
        created.append(r.json())
    return created


@pytest.fixture
def sample_portfolio(client, customer_headers, five_assets):
    resp = client.post(
        "/portfolios/",
        json={"capital": 10_000.0, "risk_level": 3},
        headers=customer_headers,
    )
    assert resp.status_code == 200
    return resp.json()
