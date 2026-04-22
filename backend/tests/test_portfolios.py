"""
Tests for GET/POST/PUT/DELETE /portfolios/
The allocation algorithm correctness is covered separately in test_portfolio.py.
"""


# ---------------------------------------------------------------------------
# Create portfolio
# ---------------------------------------------------------------------------

def test_create_portfolio_with_no_assets_returns_empty_allocations(client, customer_headers):
    resp = client.post(
        "/portfolios/",
        json={"capital": 5000.0, "risk_level": 3},
        headers=customer_headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["capital"] == 5000.0
    assert body["risk_level"] == 3
    assert body["allocations"] == []


def test_create_portfolio_unauthenticated_returns_401(client):
    resp = client.post("/portfolios/", json={"capital": 5000.0, "risk_level": 3})
    assert resp.status_code == 401


def test_create_portfolio_invalid_capital_zero(client, customer_headers):
    resp = client.post(
        "/portfolios/",
        json={"capital": 0, "risk_level": 3},
        headers=customer_headers,
    )
    assert resp.status_code == 422


def test_create_portfolio_invalid_capital_negative(client, customer_headers):
    resp = client.post(
        "/portfolios/",
        json={"capital": -1000.0, "risk_level": 3},
        headers=customer_headers,
    )
    assert resp.status_code == 422


def test_create_portfolio_invalid_risk_level_too_low(client, customer_headers):
    resp = client.post(
        "/portfolios/",
        json={"capital": 5000.0, "risk_level": 0},
        headers=customer_headers,
    )
    assert resp.status_code == 422


def test_create_portfolio_invalid_risk_level_too_high(client, customer_headers):
    resp = client.post(
        "/portfolios/",
        json={"capital": 5000.0, "risk_level": 6},
        headers=customer_headers,
    )
    assert resp.status_code == 422


def test_create_portfolio_allocates_all_assets(client, customer_headers, five_assets):
    resp = client.post(
        "/portfolios/",
        json={"capital": 10_000.0, "risk_level": 2},
        headers=customer_headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["allocations"]) == len(five_assets)


# ---------------------------------------------------------------------------
# List portfolios
# ---------------------------------------------------------------------------

def test_list_portfolios_empty(client, customer_headers):
    resp = client.get("/portfolios/", headers=customer_headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_list_portfolios_returns_own_only(client, customer_headers, second_customer_headers, five_assets):
    # customer creates 2 portfolios
    client.post("/portfolios/", json={"capital": 1000.0, "risk_level": 1}, headers=customer_headers)
    client.post("/portfolios/", json={"capital": 2000.0, "risk_level": 2}, headers=customer_headers)
    # second customer creates 1
    client.post("/portfolios/", json={"capital": 3000.0, "risk_level": 3}, headers=second_customer_headers)

    resp = client.get("/portfolios/", headers=customer_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 2

    resp2 = client.get("/portfolios/", headers=second_customer_headers)
    assert len(resp2.json()) == 1


def test_list_portfolios_unauthenticated_returns_401(client):
    resp = client.get("/portfolios/")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Get single portfolio
# ---------------------------------------------------------------------------

def test_get_portfolio_success(client, sample_portfolio, customer_headers):
    pid = sample_portfolio["id"]
    resp = client.get(f"/portfolios/{pid}", headers=customer_headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == pid


def test_get_portfolio_not_found_returns_404(client, customer_headers):
    resp = client.get("/portfolios/9999", headers=customer_headers)
    assert resp.status_code == 404


def test_get_portfolio_other_user_returns_403(client, sample_portfolio, second_customer_headers):
    pid = sample_portfolio["id"]
    resp = client.get(f"/portfolios/{pid}", headers=second_customer_headers)
    assert resp.status_code == 403


def test_get_portfolio_includes_allocations(client, sample_portfolio, customer_headers):
    pid = sample_portfolio["id"]
    resp = client.get(f"/portfolios/{pid}", headers=customer_headers)
    body = resp.json()
    assert len(body["allocations"]) == 5
    for alloc in body["allocations"]:
        assert "percentage" in alloc
        assert "amount" in alloc
        assert "asset" in alloc


# ---------------------------------------------------------------------------
# Update portfolio
# ---------------------------------------------------------------------------

def test_update_portfolio_name_and_description(client, sample_portfolio, customer_headers):
    pid = sample_portfolio["id"]
    resp = client.put(
        f"/portfolios/{pid}",
        json={"name": "My Growth Portfolio", "description": "Long-term focus"},
        headers=customer_headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "My Growth Portfolio"
    assert body["description"] == "Long-term focus"


def test_update_portfolio_other_user_returns_403(client, sample_portfolio, second_customer_headers):
    pid = sample_portfolio["id"]
    resp = client.put(
        f"/portfolios/{pid}",
        json={"name": "Stolen"},
        headers=second_customer_headers,
    )
    assert resp.status_code == 403


def test_update_portfolio_not_found_returns_404(client, customer_headers):
    resp = client.put("/portfolios/9999", json={"name": "X"}, headers=customer_headers)
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Delete portfolio
# ---------------------------------------------------------------------------

def test_delete_portfolio_success(client, sample_portfolio, customer_headers):
    pid = sample_portfolio["id"]
    resp = client.delete(f"/portfolios/{pid}", headers=customer_headers)
    assert resp.status_code == 200
    # confirm gone
    assert client.get(f"/portfolios/{pid}", headers=customer_headers).status_code == 404


def test_delete_portfolio_cascades_allocations(client, sample_portfolio, customer_headers, admin_headers):
    pid = sample_portfolio["id"]
    alloc_id = sample_portfolio["allocations"][0]["id"]

    client.delete(f"/portfolios/{pid}", headers=customer_headers)

    # allocation should also be gone
    resp = client.get(f"/allocations/{alloc_id}", headers=customer_headers)
    assert resp.status_code in (404, 401, 403)


def test_delete_portfolio_other_user_returns_403(client, sample_portfolio, second_customer_headers):
    pid = sample_portfolio["id"]
    resp = client.delete(f"/portfolios/{pid}", headers=second_customer_headers)
    assert resp.status_code == 403


def test_delete_portfolio_not_found_returns_404(client, customer_headers):
    resp = client.delete("/portfolios/9999", headers=customer_headers)
    assert resp.status_code == 404


def test_delete_portfolio_unauthenticated_returns_401(client, sample_portfolio):
    pid = sample_portfolio["id"]
    resp = client.delete(f"/portfolios/{pid}")
    assert resp.status_code == 401
