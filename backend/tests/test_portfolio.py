"""
End-to-end test for the portfolio request API.

Customer flow (single API call after setup):
  POST /portfolios/  { capital, risk_level }
  → creates portfolio + auto-allocates assets in one shot
  → returns portfolio with full allocation breakdown

Test structure:
  [Admin setup]   Admin creates 5 asset classes (risk scores 1-5)
  [Customer]      Customer calls the single endpoint → verifies allocations

Allocation algorithm: weight = 2^(5 - |target_risk - asset_risk|)
For risk_level=4, weights are {1:4, 2:8, 3:16, 4:32, 5:16} (total 76),
giving percentages ≈ 5.26 / 10.53 / 21.05 / 42.11 / 21.05.
"""

CAPITAL    = 10_000.0
RISK_LEVEL = 4

ASSETS = [
    {"name": "Government Bonds", "asset_type": "Bond",   "risk_score": 1, "expected_return": 3.5},
    {"name": "Corporate Bonds",  "asset_type": "Bond",   "risk_score": 2, "expected_return": 5.0},
    {"name": "Blue Chip Stocks", "asset_type": "Stock",  "risk_score": 3, "expected_return": 8.0},
    {"name": "Growth Stocks",    "asset_type": "Stock",  "risk_score": 4, "expected_return": 12.0},
    {"name": "Crypto",           "asset_type": "Crypto", "risk_score": 5, "expected_return": 25.0},
]

# Expected allocation percentages for risk_level=4 with 5 assets at scores 1-5
EXPECTED_PCT = {risk: round(w / 76 * 100, 2) for risk, w in {1: 4, 2: 8, 3: 16, 4: 32, 5: 16}.items()}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _auth_headers(client, email, password):
    resp = client.post("/users/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def _setup_admin_with_assets(client):
    """Seed admin directly in DB (signup is customer-only), then create assets via API."""
    from app.database import get_db
    from app.models.user import User
    from app.models.enum import UserRoleEnum
    from app.auth import hash_password

    session = next(client.app.dependency_overrides[get_db]())
    admin = User(
        name="Admin",
        email="admin@finvisor.com",
        password=hash_password("Admin@1234"),
        role=UserRoleEnum.ADMIN,
    )
    session.add(admin)
    session.commit()

    headers = _auth_headers(client, "admin@finvisor.com", "Admin@1234")
    for asset in ASSETS:
        r = client.post("/assets/", json=asset, headers=headers)
        assert r.status_code == 200, f"asset creation failed: {r.json()}"


def _setup_customer(client):
    """Register customer and return auth headers."""
    client.post("/users/auth/signup", json={
        "name": "Customer", "email": "customer@finvisor.com",
        "password": "Customer@1234", "role": "Customer",
    })
    return _auth_headers(client, "customer@finvisor.com", "Customer@1234")


# ---------------------------------------------------------------------------
# Test
# ---------------------------------------------------------------------------

def test_request_portfolio_single_api_call(client):
    """
    Customer submits { capital, risk_level } to POST /portfolios/.
    The API creates the portfolio AND allocates all assets in one call.
    """

    # ── Setup ──────────────────────────────────────────────────────────────
    _setup_admin_with_assets(client)
    customer_headers = _setup_customer(client)

    # ── Single API call ────────────────────────────────────────────────────
    resp = client.post(
        "/portfolios/",
        json={"capital": CAPITAL, "risk_level": RISK_LEVEL},
        headers=customer_headers,
    )
    assert resp.status_code == 200, f"portfolio request failed: {resp.json()}"
    portfolio = resp.json()

    # ── Portfolio metadata ─────────────────────────────────────────────────
    assert portfolio["capital"]    == CAPITAL
    assert portfolio["risk_level"] == RISK_LEVEL

    # ── Allocations were auto-created ──────────────────────────────────────
    allocations = portfolio["allocations"]
    assert len(allocations) == len(ASSETS), (
        f"expected {len(ASSETS)} allocations, got {len(allocations)}"
    )

    # ── Math: percentages sum to 100 %, amounts sum to capital ─────────────
    total_pct    = sum(a["percentage"] for a in allocations)
    total_amount = sum(a["amount"]     for a in allocations)
    assert abs(total_pct    - 100.0)    < 0.1, f"percentages sum to {total_pct:.2f}% (expected 100%)"
    assert abs(total_amount - CAPITAL)  < 1.0, f"amounts sum to ${total_amount:.2f} (expected ${CAPITAL})"

    # ── Risk weighting: target risk level gets the largest share ───────────
    by_risk = {a["asset"]["risk_score"]: a for a in allocations}
    assert by_risk[4]["percentage"] > by_risk[3]["percentage"]
    assert by_risk[4]["percentage"] > by_risk[5]["percentage"]
    assert by_risk[3]["percentage"] > by_risk[2]["percentage"]
    assert by_risk[5]["percentage"] > by_risk[1]["percentage"]

    # ── Exact allocation percentages match the formula ─────────────────────
    for risk_score, expected_pct in EXPECTED_PCT.items():
        actual_pct = by_risk[risk_score]["percentage"]
        assert abs(actual_pct - expected_pct) < 0.1, (
            f"risk {risk_score}: expected {expected_pct}%, got {actual_pct}%"
        )
