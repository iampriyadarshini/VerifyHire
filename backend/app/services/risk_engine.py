import os

from app.services.findings import (
    CheckStatus,
    Finding,
    MLAssessment,
    RiskAssessment,
    RiskScoreBreakdown,
    ScoreContribution,
)
from app.services.company_verification import build_company_sender_verification


DEFAULT_SCORE_WEIGHTS = {"high": 30, "medium": 12, "low": 4, "info": 0}
DEFAULT_THRESHOLDS = {"moderate": 25, "high": 50, "critical": 75}


def _configured_int(name: str, default: int, *, minimum: int = 0, maximum: int = 100) -> int:
    value = os.getenv(name)
    if value is None:
        return default
    try:
        parsed = int(value)
    except ValueError:
        return default
    return parsed if minimum <= parsed <= maximum else default


def _score_configuration() -> tuple[dict[str, int], dict[str, int]]:
    weights = {
        severity: _configured_int(
            f"VERIFYHIRE_SCORE_{severity.upper()}_WEIGHT",
            default,
        )
        for severity, default in DEFAULT_SCORE_WEIGHTS.items()
    }
    thresholds = {
        level: _configured_int(
            f"VERIFYHIRE_SCORE_{level.upper()}_THRESHOLD",
            default,
            minimum=1,
            maximum=100,
        )
        for level, default in DEFAULT_THRESHOLDS.items()
    }
    if not thresholds["moderate"] < thresholds["high"] < thresholds["critical"]:
        thresholds = DEFAULT_THRESHOLDS.copy()
    return weights, thresholds


def _risk_level(score: int, thresholds: dict[str, int]) -> str:
    if score >= thresholds["critical"]:
        return "Critical Risk"
    if score >= thresholds["high"]:
        return "High Risk"
    if score >= thresholds["moderate"]:
        return "Moderate Risk"
    return "Low Risk"


def _score_findings(findings: list[Finding]) -> tuple[int, list[ScoreContribution], dict[str, int]]:
    weights, _ = _score_configuration()
    unique_findings = list({finding.rule_id: finding for finding in findings}.values())
    counts = {severity: sum(finding.severity == severity for finding in unique_findings) for severity in weights}
    contributions = [
        ScoreContribution(
            rule_id=finding.rule_id,
            title=finding.title,
            severity=finding.severity,
            weight=weights[finding.severity],
            evidence=finding.evidence,
        )
        for finding in unique_findings
        if weights[finding.severity] > 0
    ]
    return min(100, sum(contribution.weight for contribution in contributions)), contributions, counts


def _check_counts(checks: list[CheckStatus]) -> tuple[int, int, int]:
    confidence_checks = [check for check in checks if not check.check_id.startswith("ml-")]
    passed = sum(check.status in {"completed", "passing"} for check in confidence_checks)
    failed = sum(check.status in {"failed", "failing"} for check in confidence_checks)
    unverified = sum(check.status in {"unavailable", "missing", "inconclusive"} for check in confidence_checks)
    return passed, failed, unverified


def assess_risk(
    *,
    findings: list[Finding],
    checks: list[CheckStatus],
    company_domains_available: bool,
    domain_comparison: dict[str, str | None],
    ml_assessment: MLAssessment | None = None,
    company_name: str | None = None,
    sender_email: str | None = None,
) -> RiskAssessment:
    unique_findings = list({finding.rule_id: finding for finding in findings}.values())
    high_count = sum(finding.severity == "high" for finding in unique_findings)
    medium_count = sum(finding.severity == "medium" for finding in unique_findings)
    confidence_checks = [check for check in checks if not check.check_id.startswith("ml-")]
    completed_count = sum(check.status == "completed" for check in confidence_checks)
    unavailable_count = sum(check.status == "unavailable" for check in confidence_checks)

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

    risk_score, contributions, severity_counts = _score_findings(unique_findings)
    _, thresholds = _score_configuration()
    risk_level = _risk_level(risk_score, thresholds)
    passed_checks, failed_checks, unverified_checks = _check_counts(checks)
    if contributions:
        score_explanation = (
            "The score is the sum of one contribution per unique finding rule, "
            f"capped at 100: {', '.join(f'{item.rule_id} (+{item.weight})' for item in contributions)}."
        )
    else:
        score_explanation = "No scored warning findings were detected. Unverified checks do not add risk points."

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
        ml_assessment=ml_assessment,
        risk_score=risk_score,
        risk_level=risk_level,
        score_breakdown=RiskScoreBreakdown(
            high_findings=severity_counts["high"],
            medium_findings=severity_counts["medium"],
            low_findings=severity_counts["low"],
            info_findings=severity_counts["info"],
            passed_checks=passed_checks,
            failed_checks=failed_checks,
            unverified_checks=unverified_checks,
            contributions=contributions,
            explanation=score_explanation,
        ),
        company_sender_verification=(
            build_company_sender_verification(
                company_name=company_name or "Unknown company",
                sender_email=sender_email or "Not supplied",
                domain_comparison=domain_comparison,
                findings=unique_findings,
            )
            if company_name is not None and sender_email is not None
            else None
        ),
    )
