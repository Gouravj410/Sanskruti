def test_public_contribution_defaults_to_pending_review(client):
    payload = {
        "art_form_id": 1,
        "contributor_name": "Ramesh Chitrakar",
        "role_or_title": "Folk Artist",
        "community_affiliation": "Chitrakar Guild",
        "location": "Thane, Maharashtra",
        "title": "Natural Gum Preparation Lore",
        "content": "We extract the gum from Babool tree bark at dawn.",
        "lineage_tradition": "4th generation artisan",
        # Malicious attempt to self-publish:
        "verification_status": "PUBLISHED"
    }
    response = client.post("/api/v1/practitioners", json=payload)
    assert response.status_code == 201
    entry = response.json()
    assert entry["id"] is not None
    assert entry["title"] == payload["title"]
    # Verify status is forced to PENDING_REVIEW regardless of request payload
    assert entry["verification_status"] == "PENDING_REVIEW"
    new_entry_id = entry["id"]

    # Verify that this new pending entry is NOT visible in public list
    public_res = client.get("/api/v1/practitioners")
    assert public_res.status_code == 200
    public_ids = [p["id"] for p in public_res.json()]
    assert new_entry_id not in public_ids

def test_unauthorized_curator_endpoints_rejected(client):
    # Missing key
    res = client.get("/api/v1/curator/submissions")
    assert res.status_code == 401

    # Invalid key
    res_bad = client.get("/api/v1/curator/submissions", headers={"X-Curator-Key": "wrong_key"})
    assert res_bad.status_code == 401

    # Unauthorized review attempt
    res_rev = client.post(
        "/api/v1/curator/submissions/1/review",
        json={"status": "APPROVED"}
    )
    assert res_rev.status_code == 401

def test_authorized_curator_review_workflow(client, curator_headers):
    # 1. Create a public submission
    payload = {
        "art_form_id": 1,
        "contributor_name": "Ananya Devi",
        "role_or_title": "Master Weaver",
        "community_affiliation": "Weavers Collective",
        "location": "Maharashtra",
        "title": "Sacred Border Knot Technique",
        "content": "Detailed technique steps passed down by elders."
    }
    create_res = client.post("/api/v1/practitioners", json=payload)
    assert create_res.status_code == 201
    entry_id = create_res.json()["id"]

    # 2. Curator lists pending submissions
    pending_list = client.get("/api/v1/curator/submissions?status=PENDING_REVIEW", headers=curator_headers)
    assert pending_list.status_code == 200
    pending_ids = [p["id"] for p in pending_list.json()]
    assert entry_id in pending_ids

    # 3. Curator approves the submission
    review_res = client.post(
        f"/api/v1/curator/submissions/{entry_id}/review",
        headers=curator_headers,
        json={
            "status": "APPROVED",
            "curator_notes": "Oral history cross-referenced with tribal monograph.",
            "reviewed_by": "Senior Curator Dr. Sharma"
        }
    )
    assert review_res.status_code == 200
    reviewed_entry = review_res.json()
    assert reviewed_entry["verification_status"] == "APPROVED"
    assert reviewed_entry["curator_notes"] == "Oral history cross-referenced with tribal monograph."
    assert reviewed_entry["reviewed_by"] == "Senior Curator Dr. Sharma"

    # 4. Curator publishes the submission
    publish_res = client.post(
        f"/api/v1/curator/submissions/{entry_id}/review",
        headers=curator_headers,
        json={
            "status": "PUBLISHED",
            "curator_notes": "Final editorial vetting approved for public repository.",
            "reviewed_by": "Chief Archivist"
        }
    )
    assert publish_res.status_code == 200
    assert publish_res.json()["verification_status"] == "PUBLISHED"
    assert publish_res.json()["published_at"] is not None

    # 5. Verify that it is now visible in the public practitioner list
    public_res = client.get("/api/v1/practitioners")
    assert public_res.status_code == 200
    published_ids = [p["id"] for p in public_res.json()]
    assert entry_id in published_ids

def test_invalid_state_transition_rejected(client, curator_headers):
    # Reject a non-existent entry
    res = client.post(
        "/api/v1/curator/submissions/99999/review",
        headers=curator_headers,
        json={"status": "PUBLISHED"}
    )
    assert res.status_code == 404
