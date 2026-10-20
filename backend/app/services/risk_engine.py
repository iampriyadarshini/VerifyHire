from app.services.findings import CheckStatus, Finding, RiskAssessment


def assess_risk(
    *,
    findings: list[Finding],
    checks: list[CheckStatus],
    company_domains_available: bool,
    domain_comparison: dict[str, str | None],
) -> RiskAssessment:
    unique_findings = list({finding.rule_id: finding for finding in findings}.values())
    high_count = sum(finding.severity == "high" for finding in unique_findings)
    medium_count = sum(finding.severity == "medium" for finding in unique_findings)
    completed_count = sum(check.status == "completed" for check in checks)
    unavailable_count = sum(check.status == "unavailable" for check in checks)

    if high_count:
        category = "High Risk"
        explanation = "The submitted content contains one or more strong warning signs that should be treated cautiously."
    elif medium_count >= 2:
        category = "Needs Review"
        explanation = "Several contextual warning signs were found; verify the employer and offer independently before proceeding."
    elif not company_domains_available or unavailable_count > completed_count:
        category = "Unverified"
        explanation = "There is not enough independent evidence to assess the offer confidently."
    else:
        category = "Lower Observed Risk"
        explanation = "No strong warning signs were found in the available inputs, but this is not proof of authenticity."

    actions = []
    for finding in unique_findings:
        if finding.recommended_action and finding.recommended_action not in actions:
            actions.append(finding.recommended_action)
    if not actions:
        actions.append("Confirm the offer through the company's independently verified website or contact channel.")

    limitations = [
        "This is a preliminary assessment, not a guarantee of authenticity.",
        "A legitimate company may be impersonated, and a legitimate recruiter may use a third-party recruitment domain.",
        "No submitted URL was opened, fetched, redirected, or checked against an external reputation service.",
    ]
    return RiskAssessment(
        category=category,
        explanation=explanation,
        findings=unique_findings,
        checks=checks,
        recommended_actions=actions,
        limitations=limitations,
        domain_comparison=domain_comparison,
    )
