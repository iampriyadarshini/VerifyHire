def test_health_endpoint(client) -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_and_retrieve_offer(client) -> None:
    payload = {
        "company_name": "Example Labs",
        "job_title": "Security Intern",
        "message": "Please review this complete offer message before accepting the position.",
        "sender_email": "recruiter@example.com",
        "submitted_url": "https://example.com/jobs/security-intern",
    }

    create_response = client.post("/api/v1/offers", json=payload)

    assert create_response.status_code == 201
    offer_id = create_response.json()["id"]
    assert create_response.json()["status"] == "received"

    get_response = client.get(f"/api/v1/offers/{offer_id}")

    assert get_response.status_code == 200
    assert get_response.json()["id"] == offer_id
    assert get_response.json()["company_name"] == payload["company_name"]
    assert get_response.json()["assessment"]["category"] in {
        "High Risk",
        "Needs Review",
        "Unverified",
        "Lower Observed Risk",
    }


def test_invalid_offer_is_rejected(client) -> None:
    response = client.post(
        "/api/v1/offers",
        json={
            "company_name": "A",
            "job_title": "I",
            "message": "too short",
            "sender_email": "not-an-email",
        },
    )

    assert response.status_code == 422


def test_missing_offer_returns_not_found(client) -> None:
    response = client.get("/api/v1/offers/not-created")

    assert response.status_code == 404
    assert response.json()["detail"] == "Offer not found."


def test_offer_with_payment_request_returns_high_risk(client) -> None:
    response = client.post(
        "/api/v1/offers",
        json={
            "company_name": "Example Labs",
            "job_title": "Security Intern",
            "message": "Pay a registration fee today to start your guaranteed internship.",
            "sender_email": "recruiter@example.com",
        },
    )

    assert response.status_code == 201
    assessment = response.json()["assessment"]
    assert assessment["category"] == "High Risk"
    assert {finding["rule_id"] for finding in assessment["findings"]} >= {
        "MSG_PAYMENT_REQUEST",
    }
