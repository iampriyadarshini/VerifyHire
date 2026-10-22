from app.services.company_verification import verify_company
from app.services.findings import MLAssessment, RiskAssessment
from app.services.findings import CheckStatus, Finding
from app.services.ml_classifier import predict
from app.services.message_analyzer import analyze_message
from app.services.risk_engine import assess_risk
from app.services.url_analyzer import analyze_urls


def analyze_offer(
    *,
    company_name: str,
    job_title: str,
    message: str,
    sender_email: str,
    submitted_url: str | None,
    company_website: str | None,
    use_ml: bool = True,
) -> RiskAssessment:
    message_findings, message_checks = analyze_message(message)
    url_findings, url_checks, domains = analyze_urls(
        job_url=submitted_url,
        company_website=company_website,
        sender_email=sender_email,
    )
    company_findings, company_checks, _ = verify_company(
        company_name=company_name,
        company_website=company_website,
        job_domain=domains["job_url_domain"],
        sender_domain=domains["sender_email_domain"],
    )
    checks = message_checks + url_checks + company_checks
    ml_assessment = None
    if use_ml:
        prediction = predict(message)
        ml_assessment = MLAssessment.model_validate(prediction.as_dict())
        checks.append(
            CheckStatus(
                check_id="ml-text-classifier",
                label="Experimental ML text signal",
                status="completed" if prediction.status == "available" else "unavailable",
                detail=prediction.explanation,
            )
        )
        if prediction.status == "available" and prediction.label == "suspicious":
            message_findings.append(
                Finding(
                    rule_id="ML_SUSPICIOUS_TEXT",
                    severity="medium",
                    title="Experimental ML signal",
                    explanation=prediction.explanation,
                    evidence=", ".join(prediction.influential_terms) or "No influential terms available.",
                    recommended_action="Use the rule-based findings and independently verify the offer before proceeding.",
                    source="ml",
                )
            )
    return assess_risk(
        findings=message_findings + url_findings + company_findings,
        checks=checks,
        company_domains_available=bool(company_website or domains["job_url_domain"]),
        domain_comparison=domains,
        ml_assessment=ml_assessment,
    )
