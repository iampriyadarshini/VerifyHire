from typing import Literal

from pydantic import BaseModel, Field

Severity = Literal["high", "medium", "low", "info"]


class Finding(BaseModel):
    rule_id: str = Field(min_length=1)
    severity: Severity
    title: str
    explanation: str
    evidence: str
    recommended_action: str | None = None
    source: Literal["message", "company", "url", "availability"]


class CheckStatus(BaseModel):
    check_id: str
    label: str
    status: Literal["completed", "unavailable"]
    detail: str


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
