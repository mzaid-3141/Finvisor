"""
Tests for GET/POST/PUT/DELETE /assets/
"""

from tests.conftest import ASSET_PAYLOAD


# ---------------------------------------------------------------------------
# List assets  (public)
# ---------------------------------------------------------------------------

def test_list_assets_empty(client):
    resp = client.get("/assets/")
    assert resp.status_code == 200
    assert resp.json() == []


def test_list_assets_returns_all(client, admin_headers):
    client.post("/assets/", json=ASSET_PAYLOAD, headers=admin_headers)
    client.post("/assets/", json={**ASSET_PAYLOAD, "name": "Bonds", "asset_type": "Bond"}, headers=admin_headers)
    resp = client.get("/assets/")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


# ---------------------------------------------------------------------------
# Get single asset  (public)
# ---------------------------------------------------------------------------

def test_get_asset_by_id(client, sample_asset):
    resp = client.get(f"/assets/{sample_asset['id']}")
    assert resp.status_code == 200
    assert resp.json()["name"] == ASSET_PAYLOAD["name"]


def test_get_asset_not_found_returns_404(client):
    resp = client.get("/assets/9999")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Create asset  (admin only)
# ---------------------------------------------------------------------------

def test_create_asset_as_admin(client, admin_headers):
    resp = client.post("/assets/", json=ASSET_PAYLOAD, headers=admin_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == ASSET_PAYLOAD["name"]
    assert body["risk_score"] == ASSET_PAYLOAD["risk_score"]
    assert body["expected_return"] == ASSET_PAYLOAD["expected_return"]
    assert "id" in body


def test_create_asset_as_customer_returns_403(client, customer_headers):
    resp = client.post("/assets/", json=ASSET_PAYLOAD, headers=customer_headers)
    assert resp.status_code == 403


def test_create_asset_unauthenticated_returns_401(client):
    resp = client.post("/assets/", json=ASSET_PAYLOAD)
    assert resp.status_code == 401


def test_create_asset_invalid_risk_score_too_low(client, admin_headers):
    resp = client.post("/assets/", json={**ASSET_PAYLOAD, "risk_score": 0}, headers=admin_headers)
    assert resp.status_code == 422


def test_create_asset_invalid_risk_score_too_high(client, admin_headers):
    resp = client.post("/assets/", json={**ASSET_PAYLOAD, "risk_score": 6}, headers=admin_headers)
    assert resp.status_code == 422


def test_create_asset_missing_name_returns_422(client, admin_headers):
    payload = {k: v for k, v in ASSET_PAYLOAD.items() if k != "name"}
    resp = client.post("/assets/", json=payload, headers=admin_headers)
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Update asset  (admin only)
# ---------------------------------------------------------------------------

def test_update_asset_name(client, sample_asset, admin_headers):
    resp = client.put(
        f"/assets/{sample_asset['id']}",
        json={"name": "Updated Name"},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Name"
    # other fields unchanged
    assert resp.json()["risk_score"] == sample_asset["risk_score"]


def test_update_asset_all_fields(client, sample_asset, admin_headers):
    updates = {"name": "New", "asset_type": "Bond", "risk_score": 2, "expected_return": 6.0}
    resp = client.put(f"/assets/{sample_asset['id']}", json=updates, headers=admin_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "New"
    assert body["risk_score"] == 2
    assert body["expected_return"] == 6.0


def test_update_asset_not_found_returns_404(client, admin_headers):
    resp = client.put("/assets/9999", json={"name": "X"}, headers=admin_headers)
    assert resp.status_code == 404


def test_update_asset_as_customer_returns_403(client, sample_asset, customer_headers):
    resp = client.put(f"/assets/{sample_asset['id']}", json={"name": "X"}, headers=customer_headers)
    assert resp.status_code == 403


def test_update_asset_unauthenticated_returns_401(client, sample_asset):
    resp = client.put(f"/assets/{sample_asset['id']}", json={"name": "X"})
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Delete asset  (admin only)
# ---------------------------------------------------------------------------

def test_delete_asset_as_admin(client, sample_asset, admin_headers):
    resp = client.delete(f"/assets/{sample_asset['id']}", headers=admin_headers)
    assert resp.status_code == 200
    # confirm gone
    assert client.get(f"/assets/{sample_asset['id']}").status_code == 404


def test_delete_asset_not_found_returns_404(client, admin_headers):
    resp = client.delete("/assets/9999", headers=admin_headers)
    assert resp.status_code == 404


def test_delete_asset_as_customer_returns_403(client, sample_asset, customer_headers):
    resp = client.delete(f"/assets/{sample_asset['id']}", headers=customer_headers)
    assert resp.status_code == 403


def test_delete_asset_unauthenticated_returns_401(client, sample_asset):
    resp = client.delete(f"/assets/{sample_asset['id']}")
    assert resp.status_code == 401
