from typing import Literal

from pydantic import BaseModel, Field

Severity = Literal["high", "medium", "low", "info"]
RiskLevel = Literal["Low Risk", "Moderate Risk", "High Risk", "Critical Risk"]
CompanySenderStatus = Literal["VERIFIED", "MISMATCH", "UNABLE TO VERIFY"]


class Finding(BaseModel):
    rule_id: str = Field(min_length=1)
    severity: Severity
    title: str
    explanation: str
    evidence: str
    recommended_action: str | None = None
    source: Literal["message", "company", "url", "availability", "ml"]


class CheckStatus(BaseModel):
    check_id: str
    label: str
    status: Literal[
        "completed",
        "passing",
        "failed",
        "failing",
        "unavailable",
        "missing",
        "inconclusive",
    ]
    detail: str


class MLAssessment(BaseModel):
    status: Literal["available", "unavailable"]
    model_version: str | None = None
    label: Literal["suspicious", "legitimate"] | None = None
    suspicious_score: float | None = None
    influential_terms: list[str] = Field(default_factory=list)
    explanation: str
    limitation: str


class ScoreContribution(BaseModel):
    rule_id: str
    title: str
    severity: Severity
    weight: int = Field(ge=0)
    evidence: str


class RiskScoreBreakdown(BaseModel):
    high_findings: int = Field(ge=0)
    medium_findings: int = Field(ge=0)
    low_findings: int = Field(ge=0)
    info_findings: int = Field(ge=0)
    passed_checks: int = Field(ge=0)
    failed_checks: int = Field(ge=0)
    unverified_checks: int = Field(ge=0)
    contributions: list[ScoreContribution] = Field(default_factory=list)
    explanation: str


class CompanySenderVerification(BaseModel):
    status: CompanySenderStatus
    company_name: str
    sender_email: str
    explanation: str
    evidence: list[str] = Field(default_factory=list)
    recommended_action: str


class RiskAssessment(BaseModel):
    category: Literal[
        "High Risk",
        "Needs Review",
        "Unverified",
        "Lower Observed Risk",
    ]
    explanation: str
    findings: list[Finding]
    checks: list[CheckStatus]
    recommended_actions: list[str]
    limitations: list[str]
    domain_comparison: dict[str, str | None] = Field(default_factory=dict)
    ml_assessment: MLAssessment | None = None
    risk_score: int = Field(default=0, ge=0, le=100)
    risk_level: RiskLevel = "Low Risk"
    score_breakdown: RiskScoreBreakdown = Field(
        default_factory=lambda: RiskScoreBreakdown(
            high_findings=0,
            medium_findings=0,
            low_findings=0,
            info_findings=0,
            passed_checks=0,
            failed_checks=0,
            unverified_checks=0,
            explanation="No score breakdown was stored for this legacy assessment.",
        )
    )
    company_sender_verification: CompanySenderVerification | None = None
