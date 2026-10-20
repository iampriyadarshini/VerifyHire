from sqlalchemy import select

from app.models import Assessment, Finding, Offer


def test_offer_assessment_and_findings_are_persisted(client) -> None:
    payload = {
        "company_name": "Example Labs",
        "job_title": "Security Intern",
        "message": "Pay a registration fee today to start your guaranteed internship.",
        "sender_email": "recruiter@example.com",
    }

    response = client.post("/api/v1/offers", json=payload)
    assert response.status_code == 201

    offer_id = response.json()["id"]
    get_response = client.get(f"/api/v1/offers/{offer_id}")
    assessment = get_response.json()["assessment"]
    assert assessment["category"] == "High Risk"
    assert any(finding["rule_id"] == "MSG_PAYMENT_REQUEST" for finding in assessment["findings"])


def test_tables_have_database_models() -> None:
    assert Offer.__tablename__ == "offers"
    assert Assessment.__tablename__ == "assessments"
    assert Finding.__tablename__ == "findings"
