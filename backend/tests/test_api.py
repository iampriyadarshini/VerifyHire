def test_health_endpoint(client) -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_documentation_and_api_routes_are_registered(client) -> None:
    docs_response = client.get("/docs")
    openapi_response = client.get("/openapi.json")

    assert docs_response.status_code == 200
    assert openapi_response.status_code == 200
    paths = openapi_response.json()["paths"]
    assert "/api/v1/health" in paths
    assert "/api/v1/offers" in paths
    assert "/api/v1/offers/{offer_id}/attachments" in paths
    assert "/api/v1/email-checks" in paths


def test_offer_submission_accepts_frontend_payload(client, monkeypatch) -> None:
    monkeypatch.setenv("VERIFIED_COMPANY_DOMAINS", "")
    response = client.post(
        "/api/v1/offers",
        json={
            "company_name": "Example Labs",
            "job_title": "Security Intern",
            "message": "Please review this complete offer message before accepting the position.",
            "sender_email": "recruiter@example.com",
            "submitted_url": None,
            "company_website": None,
        },
    )

    assert response.status_code == 201
    assessment = response.json()["assessment"]
    assert response.json()["status"] == "received"
    assert 0 <= assessment["risk_score"] <= 100
    assert assessment["risk_level"] in {"Low Risk", "Moderate Risk", "High Risk", "Critical Risk"}
    assert "explanation" in assessment["score_breakdown"]
    assert assessment["company_sender_verification"]["status"] == "UNABLE TO VERIFY"


def test_offer_response_includes_optional_ml_assessment(client, monkeypatch) -> None:
    monkeypatch.setattr(
        "app.services.analysis.predict",
        lambda text: type(
            "PredictionStub",
            (),
            {
                "status": "unavailable",
                "explanation": "The ML model is unavailable.",
                "as_dict": lambda self: {
                    "status": "unavailable",
                    "model_version": None,
                    "label": None,
                    "suspicious_score": None,
                    "influential_terms": [],
                    "explanation": "The ML model is unavailable.",
                    "limitation": "Test limitation.",
                },
            },
        )(),
    )
    response = client.post(
        "/api/v1/offers",
        json={
            "company_name": "Example Labs",
            "job_title": "Security Intern",
            "message": "Please review this complete offer message before accepting the position.",
            "sender_email": "recruiter@example.com",
        },
    )

    assert response.status_code == 201
    assert response.json()["assessment"]["ml_assessment"]["status"] == "unavailable"


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


def test_assistant_requires_provider_configuration(client, monkeypatch) -> None:
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    create_response = client.post(
        "/api/v1/offers",
        json={
            "company_name": "Example Labs",
            "job_title": "Security Intern",
            "message": "Please review this complete offer message before accepting the position.",
            "sender_email": "recruiter@example.com",
        },
    )

    response = client.post(
        f"/api/reports/{create_response.json()['id']}/assistant/chat",
        json={"message": "Why is this sender not verified?"},
    )

    assert response.status_code == 503
    assert response.json()["detail"] == "The AI Assistant is not configured."


def test_assistant_uses_requested_report_and_preserves_assessment(client, monkeypatch) -> None:
    create_response = client.post(
        "/api/v1/offers",
        json={
            "company_name": "Example Labs",
            "job_title": "Security Intern",
            "message": "Please review this complete offer message before accepting the position.",
            "sender_email": "recruiter@example.com",
        },
    )
    report = create_response.json()

    monkeypatch.setattr(
        "app.api.routes.assistant.chat_about_report",
        lambda *, offer, question: {
            "report_id": offer.id,
            "answer": f"Based only on {offer.company_name}: {question}",
            "verification_status": "UNABLE TO VERIFY",
            "evidence": ["Sender domain: example.com"],
            "limitations": ["This is preliminary."],
            "provider": "openai",
        },
    )

    response = client.post(
        f"/api/reports/{report['id']}/assistant/chat",
        json={"message": "Why is this sender not verified?"},
    )

    assert response.status_code == 200
    assert response.json()["report_id"] == report["id"]
    assert response.json()["answer"].startswith("Based only on Example Labs")
    saved_report = client.get(f"/api/v1/offers/{report['id']}").json()
    assert saved_report["assessment"]["risk_score"] == report["assessment"]["risk_score"]
    assert saved_report["assessment"]["category"] == report["assessment"]["category"]


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
    assert assessment["risk_score"] >= 30
    assert assessment["risk_level"] in {
        "Low Risk",
        "Moderate Risk",
        "High Risk",
        "Critical Risk",
    }
    assert {finding["rule_id"] for finding in assessment["findings"]} >= {
        "MSG_PAYMENT_REQUEST",
    }
