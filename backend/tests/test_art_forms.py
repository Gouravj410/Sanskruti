def test_list_art_forms(client):
    response = client.get("/api/v1/art-forms")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    assert items[0]["slug"] == "warli"
    assert "name" in items[0]
    assert items[0]["preservation_status"] == "LIVING"

def test_filter_art_forms_by_region(client):
    response = client.get("/api/v1/art-forms?region=Western+Ghats")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    assert "Maharashtra" in items[0]["region"]

    # Filter with non-matching region
    empty_res = client.get("/api/v1/art-forms?region=Himalayan")
    assert empty_res.status_code == 200
    assert len(empty_res.json()) == 0

def test_get_art_form_by_slug(client):
    response = client.get("/api/v1/art-forms/warli")
    assert response.status_code == 200
    detail = response.json()
    assert detail["slug"] == "warli"
    assert detail["name"] == "Warli Tribal Wall Art"
    assert len(detail["canonical_motifs"]) == 1
    assert detail["canonical_motifs"][0]["name"] == "Tarpa Dance Circle"
    assert len(detail["sources"]) == 1
    assert detail["sources"][0]["author"] == "Yashodhara Dalmia"

def test_get_missing_art_form_returns_404(client):
    response = client.get("/api/v1/art-forms/non-existent-art-form")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
