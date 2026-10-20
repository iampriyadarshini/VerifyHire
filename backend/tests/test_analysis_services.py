from app.services.company_verification import verify_company
from app.services.message_analyzer import analyze_message
from app.services.risk_engine import assess_risk
from app.services.url_analyzer import analyze_urls, normalize_domain


def test_registered_domain_normalization_handles_subdomains() -> None:
    assert normalize_domain("https://careers.example.co.uk/jobs/1") == "example.co.uk"
    assert normalize_domain("not a url") is None


def test_url_analyzer_detects_ip_and_userinfo_without_fetching() -> None:
    findings, _, domains = analyze_urls(
        job_url="http://user:password@192.0.2.10/jobs",
        company_website=None,
        sender_email="recruiter@example.com",
    )

    rule_ids = {finding.rule_id for finding in findings}
    assert {"URL_IP_HOST", "URL_USERINFO"} <= rule_ids
    assert domains["job_url_domain"] is None


def test_company_domain_mismatch_is_explained() -> None:
    findings, _, domains = verify_company(
        company_name="Example Labs",
        company_website="https://example.com",
        job_domain="example-jobs.com",
        sender_domain="example.com",
    )

    assert domains["company_website_domain"] == "example.com"
    assert "COMPANY_JOB_DOMAIN_MISMATCH" in {finding.rule_id for finding in findings}


def test_recruitment_platform_is_distinguished(monkeypatch) -> None:
    monkeypatch.setenv("RECRUITMENT_PLATFORM_DOMAINS", "recruiter.example.net")

    findings, _, _ = verify_company(
        company_name="Example Labs",
        company_website="https://example.com",
        job_domain="example.com",
        sender_domain="recruiter.example.net",
    )

    finding = next(finding for finding in findings if finding.rule_id == "THIRD_PARTY_RECRUITER_DOMAIN")
    assert "does not prove" in finding.explanation


def test_matching_domains_do_not_prove_authenticity(monkeypatch) -> None:
    monkeypatch.setenv("VERIFIED_COMPANY_DOMAINS", "")

    findings, checks, _ = verify_company(
        company_name="Example Labs",
        company_website="https://example.com",
        job_domain="example.com",
        sender_domain="example.com",
    )

    assert not any(finding.severity == "high" for finding in findings)
    assert any(check.check_id == "company-authenticity" and check.status == "unavailable" for check in checks)


def test_missing_domains_result_in_unverified() -> None:
    message_findings, message_checks = analyze_message(
        "Please review this offer and reply when you have time."
    )
    assessment = assess_risk(
        findings=message_findings,
        checks=message_checks,
        company_domains_available=False,
        domain_comparison={
            "company_website_domain": None,
            "job_url_domain": None,
            "sender_email_domain": "example.com",
        },
    )

    assert assessment.category == "Unverified"


def test_credentials_and_otp_are_one_deduplicated_finding() -> None:
    findings, _ = analyze_message(
        "Send your OTP and password, plus your banking details, by email."
    )

    assert [finding.rule_id for finding in findings] == ["MSG_CREDENTIAL_REQUEST"]
