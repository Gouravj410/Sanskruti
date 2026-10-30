def test_list_artifacts(client):
    response = client.get("/api/v1/artifacts")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    assert items[0]["accession_number"] == "SVR-WAR-001"
    assert items[0]["information_layer"] == "VERIFIED"

def test_filter_artifacts_by_layer(client):
    response = client.get("/api/v1/artifacts?layer=VERIFIED")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    assert all(a["information_layer"] == "VERIFIED" for a in items)

    empty_res = client.get("/api/v1/artifacts?layer=AI_GENERATED")
    assert empty_res.status_code == 200
    assert len(empty_res.json()) == 0

def test_get_artifact_by_id(client):
    response = client.get("/api/v1/artifacts/1")
    assert response.status_code == 200
    detail = response.json()
    assert detail["id"] == 1
    assert detail["title"] == "Ceremonial Tarpa Dance at Harvest Consecration"
    assert detail["provenance"] is not None
    assert detail["artist_attribution"] == "Jivya Soma Mashe Lineage"

def test_get_missing_artifact_returns_404(client):
    response = client.get("/api/v1/artifacts/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
