from ipaddress import ip_address
from urllib.parse import urlsplit

import tldextract

from app.services.findings import CheckStatus, Finding

_extract = tldextract.TLDExtract(suffix_list_urls=())


def normalize_domain(value: str | None) -> str | None:
    if not value:
        return None
    candidate = value.strip().lower().rstrip(".")
    if "://" in candidate:
        candidate = urlsplit(candidate).hostname or ""
    else:
        candidate = candidate.split("@")[-1].split(":")[0]
    extracted = _extract(candidate)
    if not extracted.domain or not extracted.suffix:
        return None
    return f"{extracted.domain}.{extracted.suffix}".lower()


def _parse_url(value: str | None) -> tuple[str | None, list[Finding], list[CheckStatus]]:
    findings: list[Finding] = []
    checks = [
        CheckStatus(
            check_id="url-parsing",
            label="URL structure",
            status="unavailable" if not value else "completed",
            detail="No URL was supplied." if not value else "URL was parsed locally without opening it.",
        )
    ]
    if not value:
        return None, findings, checks

    parsed = urlsplit(value.strip())
    hostname = parsed.hostname
    if parsed.scheme not in {"http", "https"} or not hostname:
        findings.append(
            Finding(
                rule_id="URL_INVALID",
                severity="medium",
                title="URL could not be validated",
                explanation="The submitted URL does not use a supported HTTP or HTTPS structure.",
                evidence=value,
                recommended_action="Confirm the link by typing the official company address manually.",
                source="url",
            )
        )
        return None, findings, checks

    try:
        ip_address(hostname)
    except ValueError:
        pass
    else:
        findings.append(
            Finding(
                rule_id="URL_IP_HOST",
                severity="medium",
                title="URL uses an IP address",
                explanation="IP-address links make it harder to verify the organization behind a job page.",
                evidence=hostname,
                recommended_action="Look for the role on the company's independently verified website.",
                source="url",
            )
        )

    if parsed.username or parsed.password:
        findings.append(
            Finding(
                rule_id="URL_USERINFO",
                severity="high",
                title="URL contains hidden user information",
                explanation="User-info syntax can conceal the destination hostname before the @ symbol.",
                evidence=value,
                recommended_action="Do not open the link; navigate to the organization manually instead.",
                source="url",
            )
        )

    labels = hostname.rstrip(".").split(".")
    if len(labels) > 4:
        findings.append(
            Finding(
                rule_id="URL_EXCESS_SUBDOMAINS",
                severity="low",
                title="URL has an unusually deep hostname",
                explanation="Many nested subdomains can make the visible address harder to inspect.",
                evidence=hostname,
                recommended_action="Compare the registered domain with the organization's independently verified domain.",
                source="url",
            )
        )

    if hostname.lower().startswith("xn--") or ".xn--" in hostname.lower():
        findings.append(
            Finding(
                rule_id="URL_PUNYCODE_HOST",
                severity="medium",
                title="URL uses a punycode hostname",
                explanation="Punycode can represent lookalike characters in a domain name.",
                evidence=hostname,
                recommended_action="Verify the address through a trusted, independently found source.",
                source="url",
            )
        )

    if parsed.scheme == "https":
        checks.append(
            CheckStatus(
                check_id="url-https",
                label="HTTPS",
                status="completed",
                detail="The URL uses HTTPS. This protects transport but does not prove the site is authentic.",
            )
        )
    else:
        findings.append(
            Finding(
                rule_id="URL_NO_HTTPS",
                severity="info",
                title="URL does not use HTTPS",
                explanation="The link is not encrypted in transit. HTTPS alone would not prove authenticity.",
                evidence=f"Scheme: {parsed.scheme}",
                recommended_action="Avoid entering personal information on this link.",
                source="url",
            )
        )

    return normalize_domain(hostname), findings, checks


def analyze_urls(
    *,
    job_url: str | None,
    company_website: str | None,
    sender_email: str,
) -> tuple[list[Finding], list[CheckStatus], dict[str, str | None]]:
    findings: list[Finding] = []
    checks: list[CheckStatus] = []
    job_domain, job_findings, job_checks = _parse_url(job_url)
    website_domain, website_findings, website_checks = _parse_url(company_website)
    findings.extend(job_findings)
    findings.extend(website_findings)
    checks.extend(job_checks)
    checks.extend(website_checks)
    email_domain = normalize_domain(sender_email.split("@")[-1])
    domains = {
        "job_url_domain": job_domain,
        "company_website_domain": website_domain,
        "sender_email_domain": email_domain,
    }

    comparable = [domain for domain in (job_domain, website_domain, email_domain) if domain]
    if len(comparable) >= 2 and len(set(comparable)) > 1:
        findings.append(
            Finding(
                rule_id="DOMAIN_MISMATCH",
                severity="medium",
                title="Offer domains do not align",
                explanation="The supplied website, job link, and sender email use different registered domains.",
                evidence="; ".join(f"{key}={value or 'not supplied'}" for key, value in domains.items()),
                recommended_action="Confirm the recruiter and role through the company's official contact channels.",
                source="company",
            )
        )

    if not job_url and not company_website:
        checks.append(
            CheckStatus(
                check_id="domain-comparison",
                label="Domain comparison",
                status="unavailable",
                detail="No job URL or company website was supplied.",
            )
        )
    else:
        checks.append(
            CheckStatus(
                check_id="domain-comparison",
                label="Domain comparison",
                status="completed",
                detail="Supplied domains were compared locally; no network lookup was performed.",
            )
        )
    return findings, checks, domains
