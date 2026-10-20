import os
import re

from app.services.findings import CheckStatus, Finding
from app.services.url_analyzer import normalize_domain


def _configured_domains(variable: str) -> set[str]:
    return {
        normalized
        for item in os.getenv(variable, "").split(",")
        if (normalized := normalize_domain(item))
    }


def _company_key(name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", name.lower())


def verify_company(
    *,
    company_name: str,
    company_website: str | None,
    job_domain: str | None,
    sender_domain: str | None,
) -> tuple[list[Finding], list[CheckStatus], dict[str, str | None]]:
    findings: list[Finding] = []
    checks = [
        CheckStatus(
            check_id="company-domain-reference",
            label="Official-domain reference",
            status="completed" if _configured_domains("VERIFIED_COMPANY_DOMAINS") else "unavailable",
            detail=(
                "Compared against locally configured domains."
                if _configured_domains("VERIFIED_COMPANY_DOMAINS")
                else "No local official-domain reference is configured."
            ),
        )
    ]
    website_domain = normalize_domain(company_website)
    job_domain = normalize_domain(job_domain)
    sender_domain = normalize_domain(sender_domain)
    official_domains = _configured_domains("VERIFIED_COMPANY_DOMAINS")
    recruiter_domains = _configured_domains("RECRUITMENT_PLATFORM_DOMAINS")
    supplied_domains = [domain for domain in (website_domain, job_domain, sender_domain) if domain]
    identity = _company_key(company_name)

    if website_domain and job_domain and website_domain != job_domain:
        findings.append(
            Finding(
                rule_id="COMPANY_JOB_DOMAIN_MISMATCH",
                severity="medium",
                title="Company website and job URL differ",
                explanation="The claimed company website and job URL have different registered domains.",
                evidence=f"Website: {website_domain}; job URL: {job_domain}",
                recommended_action="Find the role from the company's official website instead of following the supplied link.",
                source="company",
            )
        )

    if website_domain and sender_domain and website_domain != sender_domain and sender_domain not in recruiter_domains:
        findings.append(
            Finding(
                rule_id="COMPANY_EMAIL_DOMAIN_MISMATCH",
                severity="medium",
                title="Sender domain differs from company website",
                explanation="The sender does not use the supplied company website domain and is not in the configured recruitment-platform list.",
                evidence=f"Website: {website_domain}; sender: {sender_domain}",
                recommended_action="Verify the sender through a company directory or official contact channel.",
                source="company",
            )
        )

    if job_domain and sender_domain and sender_domain in recruiter_domains:
        findings.append(
            Finding(
                rule_id="THIRD_PARTY_RECRUITER_DOMAIN",
                severity="info",
                title="Sender uses a recruitment platform domain",
                explanation="A staffing or recruitment platform may legitimately contact candidates, but this does not prove the offer is authentic.",
                evidence=sender_domain,
                recommended_action="Confirm the role with both the recruiter and the claimed employer.",
                source="company",
            )
        )

    reference_match = bool(official_domains.intersection(supplied_domains))
    if official_domains and not reference_match:
        findings.append(
            Finding(
                rule_id="OFFICIAL_DOMAIN_NOT_MATCHED",
                severity="medium",
                title="Supplied domains do not match configured company references",
                explanation=f"No supplied domain matched the locally configured reference for {company_name}.",
                evidence="; ".join(supplied_domains) or "No domain supplied",
                recommended_action="Verify the company website independently before sharing information.",
                source="company",
            )
        )

    checks.append(
        CheckStatus(
            check_id="company-domain-comparison",
            label="Company and sender comparison",
            status="completed" if supplied_domains else "unavailable",
            detail=(
                f"Compared domains for {company_name}; normalized company key: {identity}."
                if supplied_domains
                else "No website, job URL, or sender domain was available for comparison."
            ),
        )
    )
    checks.append(
        CheckStatus(
            check_id="company-authenticity",
            label="Company authenticity",
            status="unavailable",
            detail="A domain match is not proof of authenticity, and no external reputation lookup was performed.",
        )
    )
    return findings, checks, {
        "company_website_domain": website_domain,
        "job_url_domain": job_domain,
        "sender_email_domain": sender_domain,
    }
