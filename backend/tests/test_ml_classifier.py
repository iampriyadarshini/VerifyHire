import csv

from app.services.findings import CheckStatus, Finding
from app.services.ml_classifier import predict
from app.services.risk_engine import assess_risk
from ml.train import train


def test_empty_text_is_unavailable(monkeypatch, tmp_path) -> None:
    monkeypatch.setenv("ML_MODEL_PATH", str(tmp_path / "missing.joblib"))

    result = predict("   ")

    assert result.status == "unavailable"
    assert result.label is None


def test_missing_model_is_unavailable(monkeypatch, tmp_path) -> None:
    monkeypatch.setenv("ML_MODEL_PATH", str(tmp_path / "missing.joblib"))

    result = predict("Please pay a registration fee before the interview.")

    assert result.status == "unavailable"
    assert "not trained" in result.explanation


def test_training_and_prediction_are_reproducible(tmp_path, monkeypatch) -> None:
    dataset = tmp_path / "dataset.csv"
    base_rows = [
        ("Please pay a fee before the interview.", "suspicious"),
        ("Send your bank password to receive the offer.", "suspicious"),
        ("Pay a deposit before your internship starts.", "suspicious"),
        ("Send an OTP to confirm your guaranteed job.", "suspicious"),
        ("Buy equipment from our supplier before onboarding.", "suspicious"),
        ("Please schedule a standard interview next week.", "legitimate"),
        ("The hiring team will review your application.", "legitimate"),
        ("The role includes a normal written contract.", "legitimate"),
        ("Please review the job description before our interview.", "legitimate"),
        ("The recruiter will contact you through the hiring portal.", "legitimate"),
    ]
    rows = base_rows * 3
    with dataset.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["text", "label"])
        writer.writerows(rows)
    artifact = tmp_path / "model.joblib"

    train(dataset, artifact)
    monkeypatch.setenv("ML_MODEL_PATH", str(artifact))
    result = predict("Please pay a fee before the interview.")

    assert result.status == "available"
    assert result.label == "suspicious"
    assert result.influential_terms
    assert result.suspicious_score is not None


def test_rule_based_high_risk_is_not_overridden_by_ml() -> None:
    assessment = assess_risk(
        findings=[
            Finding(
                rule_id="MSG_PAYMENT_REQUEST",
                severity="high",
                title="Payment request",
                explanation="The offer requests upfront payment.",
                evidence="pay a fee",
                source="message",
            )
        ],
        checks=[CheckStatus(check_id="message-analysis", label="Message", status="completed", detail="done")],
        company_domains_available=True,
        domain_comparison={},
        ml_assessment={
            "status": "available",
            "model_version": "test",
            "label": "legitimate",
            "suspicious_score": 0.01,
            "influential_terms": [],
            "explanation": "No strong suspicious pattern.",
            "limitation": "Test model.",
        },
    )

    assert assessment.category == "High Risk"
