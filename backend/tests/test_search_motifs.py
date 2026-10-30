def test_search_archive(client):
    response = client.get("/api/v1/search?q=tarpa")
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "tarpa"
    assert data["counts"]["motifs"] >= 1
    assert any(m["motif"]["name"] == "Tarpa Dance Circle" for m in data["motifs"])

def test_search_archive_short_query(client):
    response = client.get("/api/v1/search?q=a")
    assert response.status_code == 200
    data = response.json()
    assert "counts" in data

def test_canonical_motifs_endpoint(client):
    response = client.get("/api/v1/search/motifs")
    assert response.status_code == 200
    motifs = response.json()
    assert isinstance(motifs, list)
    assert len(motifs) >= 1
    assert motifs[0]["name"] == "Tarpa Dance Circle"
    assert motifs[0]["art_form_slug"] == "warli"
    assert "visual_cue" in motifs[0]
    assert "symbolism" in motifs[0]

def test_canonical_motifs_filter_by_slug(client):
    response = client.get("/api/v1/search/motifs?art_form_slug=warli")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    empty_res = client.get("/api/v1/search/motifs?art_form_slug=nonexistent")
    assert empty_res.status_code == 200
    assert len(empty_res.json()) == 0
