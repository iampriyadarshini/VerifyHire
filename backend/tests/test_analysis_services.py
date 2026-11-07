from app.services.company_verification import build_company_sender_verification, verify_company
from app.services.findings import Finding
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


def test_risk_score_is_explainable_and_deduplicated() -> None:
    findings, checks = analyze_message(
        "Pay a registration fee today and send your password to confirm your guaranteed job."
    )
    assessment = assess_risk(
        findings=findings + findings,
        checks=checks,
        company_domains_available=True,
        domain_comparison={},
    )

    assert assessment.risk_score == sum(
        contribution.weight for contribution in assessment.score_breakdown.contributions
    )
    assert assessment.risk_level in {"High Risk", "Critical Risk"}
    assert assessment.score_breakdown.high_findings >= 2
    assert len(assessment.score_breakdown.contributions) == len(
        {finding.rule_id for finding in findings}
    )
    assert "one contribution per unique finding rule" in assessment.score_breakdown.explanation


def test_unavailable_checks_do_not_add_risk_points() -> None:
    from app.services.findings import CheckStatus

    checks = [
        CheckStatus(
            check_id="company-authenticity",
            label="Company authenticity",
            status="unavailable",
            detail="No independently verified domain was supplied.",
        )
    ]
    assessment = assess_risk(
        findings=[],
        checks=checks,
        company_domains_available=False,
        domain_comparison={},
    )

    assert assessment.risk_score == 0
    assert assessment.risk_level == "Low Risk"
    assert assessment.score_breakdown.unverified_checks == 1
    assert assessment.score_breakdown.failed_checks == 0


def test_score_weights_and_thresholds_are_configurable(monkeypatch) -> None:
    monkeypatch.setenv("VERIFYHIRE_SCORE_MEDIUM_WEIGHT", "20")
    monkeypatch.setenv("VERIFYHIRE_SCORE_MODERATE_THRESHOLD", "10")
    monkeypatch.setenv("VERIFYHIRE_SCORE_HIGH_THRESHOLD", "30")
    monkeypatch.setenv("VERIFYHIRE_SCORE_CRITICAL_THRESHOLD", "60")
    finding = Finding(
        rule_id="TEST_MEDIUM",
        severity="medium",
        title="Test warning",
        explanation="Test explanation.",
        evidence="Test evidence.",
        source="message",
    )

    assessment = assess_risk(
        findings=[finding],
        checks=[],
        company_domains_available=True,
        domain_comparison={},
    )

    assert assessment.risk_score == 20
    assert assessment.risk_level == "Moderate Risk"
    assert assessment.score_breakdown.contributions[0].weight == 20


def test_company_sender_verification_requires_more_than_a_matching_name(monkeypatch) -> None:
    monkeypatch.setenv("VERIFIED_COMPANY_DOMAINS", "")
    result = build_company_sender_verification(
        company_name="Example Labs",
        sender_email="recruiter@gmail.com",
        domain_comparison={
            "company_website_domain": "example.com",
            "job_url_domain": None,
            "sender_email_domain": "gmail.com",
        },
        findings=[],
    )

    assert result.status == "UNABLE TO VERIFY"
    assert "not proof" in result.explanation


def test_company_sender_verification_distinguishes_mismatch_and_verified(monkeypatch) -> None:
    monkeypatch.setenv("VERIFIED_COMPANY_DOMAINS", "example.com")
    mismatch = build_company_sender_verification(
        company_name="Example Labs",
        sender_email="recruiter@other.com",
        domain_comparison={
            "company_website_domain": "example.com",
            "job_url_domain": None,
            "sender_email_domain": "other.com",
        },
        findings=[
            Finding(
                rule_id="COMPANY_EMAIL_DOMAIN_MISMATCH",
                severity="medium",
                title="Sender mismatch",
                explanation="Mismatch",
                evidence="example.com vs other.com",
                source="company",
            )
        ],
    )
    verified = build_company_sender_verification(
        company_name="Example Labs",
        sender_email="recruiter@example.com",
        domain_comparison={
            "company_website_domain": "example.com",
            "job_url_domain": None,
            "sender_email_domain": "example.com",
        },
        findings=[],
    )

    assert mismatch.status == "MISMATCH"
    assert verified.status == "VERIFIED"
    assert "does not guarantee" in verified.explanation
