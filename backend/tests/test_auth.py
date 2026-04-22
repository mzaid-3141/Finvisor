"""
Tests for POST /users/auth/signup, POST /users/auth/login, GET /users/auth/me
"""

from tests.conftest import CUSTOMER_PAYLOAD, ADMIN_PAYLOAD


# ---------------------------------------------------------------------------
# Signup
# ---------------------------------------------------------------------------

def test_signup_customer_success(client):
    resp = client.post("/users/auth/signup", json=CUSTOMER_PAYLOAD)
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == CUSTOMER_PAYLOAD["email"]
    assert body["role"] == "Customer"
    assert "password" not in body


def test_signup_duplicate_email_returns_400(client):
    client.post("/users/auth/signup", json=CUSTOMER_PAYLOAD)
    resp = client.post("/users/auth/signup", json=CUSTOMER_PAYLOAD)
    assert resp.status_code == 400
    assert "already registered" in resp.json()["detail"].lower()


def test_signup_admin_role_blocked(client):
    resp = client.post("/users/auth/signup", json=ADMIN_PAYLOAD)
    assert resp.status_code == 403


def test_signup_invalid_email_returns_422(client):
    payload = {**CUSTOMER_PAYLOAD, "email": "not-an-email"}
    resp = client.post("/users/auth/signup", json=payload)
    assert resp.status_code == 422


def test_signup_password_too_short_returns_422(client):
    payload = {**CUSTOMER_PAYLOAD, "password": "short"}
    resp = client.post("/users/auth/signup", json=payload)
    assert resp.status_code == 422


def test_signup_missing_name_returns_422(client):
    payload = {k: v for k, v in CUSTOMER_PAYLOAD.items() if k != "name"}
    resp = client.post("/users/auth/signup", json=payload)
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

def test_login_success_returns_token(client):
    client.post("/users/auth/signup", json=CUSTOMER_PAYLOAD)
    resp = client.post("/users/auth/login", json={
        "email": CUSTOMER_PAYLOAD["email"],
        "password": CUSTOMER_PAYLOAD["password"],
    })
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_wrong_password_returns_401(client):
    client.post("/users/auth/signup", json=CUSTOMER_PAYLOAD)
    resp = client.post("/users/auth/login", json={
        "email": CUSTOMER_PAYLOAD["email"],
        "password": "WrongPassword99",
    })
    assert resp.status_code == 401


def test_login_unknown_email_returns_401(client):
    resp = client.post("/users/auth/login", json={
        "email": "ghost@nowhere.com",
        "password": "Anything@123",
    })
    assert resp.status_code == 401


def test_login_missing_fields_returns_422(client):
    resp = client.post("/users/auth/login", json={"email": "only@email.com"})
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# GET /me
# ---------------------------------------------------------------------------

def test_get_me_returns_current_user(client, customer_headers):
    resp = client.get("/users/auth/me", headers=customer_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == CUSTOMER_PAYLOAD["email"]
    assert body["role"] == "Customer"


def test_get_me_without_token_returns_401(client):
    resp = client.get("/users/auth/me")
    assert resp.status_code == 401


def test_get_me_invalid_token_returns_401(client):
    resp = client.get("/users/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
    assert resp.status_code == 401


def test_get_me_admin_role_reflected(client, admin_headers):
    resp = client.get("/users/auth/me", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["role"] == "Admin"
