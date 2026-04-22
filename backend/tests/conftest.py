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
