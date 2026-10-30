def test_suggested_inquiries_endpoint(client):
    res = client.get("/api/v1/ai/suggested-inquiries")
    assert res.status_code == 200
    suggestions = res.json()
    assert isinstance(suggestions, list)
    assert len(suggestions) >= 1
    assert "question" in suggestions[0]
    assert "topic" in suggestions[0]

def test_ask_sanskruti_graceful_archival_synthesis(client):
    # GEMINI_API_KEY is empty in test environment; should gracefully fall back
    # to the high-integrity Archival Grounding Synthesizer using DB context
    payload = {
        "question": "What is the cultural significance of the Tarpa dance in Warli art?",
        "art_form_slug": "warli"
    }
    res = client.post("/api/v1/ai/ask", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["question"] == payload["question"]
    assert "answer" in data
    assert len(data["answer"]) > 50
    assert data["is_grounded"] is True
    assert data["information_layer"] == "AI_INTERPRETATION"
    assert "Warli" in data["context_art_form"]
    assert len(data["sources_cited"]) >= 1
    assert data["sources_cited"][0]["title"] == "The Painted World of the Warlis"
