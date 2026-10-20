from app.services.company_verification import verify_company
from app.services.findings import RiskAssessment
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
    return assess_risk(
        findings=message_findings + url_findings + company_findings,
        checks=checks,
        company_domains_available=bool(company_website or domains["job_url_domain"]),
        domain_comparison=domains,
    )
