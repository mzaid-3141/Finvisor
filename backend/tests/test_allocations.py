"""
Tests for GET /allocations/{id} and DELETE /allocations/{id}
"""


# ---------------------------------------------------------------------------
# Get allocation
# ---------------------------------------------------------------------------

def test_get_allocation_owner_success(client, sample_portfolio, customer_headers):
    alloc_id = sample_portfolio["allocations"][0]["id"]
    resp = client.get(f"/allocations/{alloc_id}", headers=customer_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == alloc_id
    assert "percentage" in body
    assert "amount" in body
    assert "asset" in body


def test_get_allocation_not_found_returns_404(client, customer_headers):
    resp = client.get("/allocations/9999", headers=customer_headers)
    assert resp.status_code == 404


def test_get_allocation_other_user_returns_403(client, sample_portfolio, second_customer_headers):
    alloc_id = sample_portfolio["allocations"][0]["id"]
    resp = client.get(f"/allocations/{alloc_id}", headers=second_customer_headers)
    assert resp.status_code == 403


def test_get_allocation_unauthenticated_returns_401(client, sample_portfolio):
    alloc_id = sample_portfolio["allocations"][0]["id"]
    resp = client.get(f"/allocations/{alloc_id}")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Delete allocation  (admin only)
# ---------------------------------------------------------------------------

def test_delete_allocation_as_admin(client, sample_portfolio, admin_headers, customer_headers):
    alloc_id = sample_portfolio["allocations"][0]["id"]
    resp = client.delete(f"/allocations/{alloc_id}", headers=admin_headers)
    assert resp.status_code == 200
    # confirm gone
    assert client.get(f"/allocations/{alloc_id}", headers=customer_headers).status_code == 404


def test_delete_allocation_not_found_returns_404(client, admin_headers):
    resp = client.delete("/allocations/9999", headers=admin_headers)
    assert resp.status_code == 404


def test_delete_allocation_as_customer_returns_403(client, sample_portfolio, customer_headers):
    alloc_id = sample_portfolio["allocations"][0]["id"]
    resp = client.delete(f"/allocations/{alloc_id}", headers=customer_headers)
    assert resp.status_code == 403


def test_delete_allocation_unauthenticated_returns_401(client, sample_portfolio):
    alloc_id = sample_portfolio["allocations"][0]["id"]
    resp = client.delete(f"/allocations/{alloc_id}")
    assert resp.status_code == 401
