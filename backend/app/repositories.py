from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Assessment, Finding, Offer
from app.services.findings import Finding as FindingSchema
from app.services.findings import RiskAssessment
from app.services.company_verification import build_company_sender_verification
from app.services.risk_engine import assess_risk


def save_offer(db: Session, *, offer: Offer, assessment: RiskAssessment) -> Offer:
    db.add(offer)
    db.flush()
    db.add(
        Assessment(
            offer_id=offer.id,
            category=assessment.category,
            explanation=assessment.explanation,
            checks=[check.model_dump() for check in assessment.checks],
            recommended_actions=assessment.recommended_actions,
            limitations=assessment.limitations,
            domain_comparison=assessment.domain_comparison,
            ml_assessment=assessment.ml_assessment.model_dump() if assessment.ml_assessment else None,
            risk_score=assessment.risk_score,
            risk_level=assessment.risk_level,
            score_breakdown=assessment.score_breakdown.model_dump(),
            findings=[
                Finding(
                    rule_id=finding.rule_id,
                    severity=finding.severity,
                    title=finding.title,
                    explanation=finding.explanation,
                    evidence=finding.evidence,
                    recommended_action=finding.recommended_action,
                    source=finding.source,
                )
                for finding in assessment.findings
            ],
        )
    )
    db.commit()
    db.refresh(offer)
    return offer


def get_offer(db: Session, offer_id: str) -> Offer | None:
    return db.scalar(
        select(Offer)
        .where(Offer.id == offer_id)
        .options(selectinload(Offer.assessment).selectinload(Assessment.findings))
    )


def assessment_schema(assessment: Assessment, *, offer: Offer | None = None) -> RiskAssessment:
    findings = [
        FindingSchema(
            rule_id=finding.rule_id,
            severity=finding.severity,
            title=finding.title,
            explanation=finding.explanation,
            evidence=finding.evidence,
            recommended_action=finding.recommended_action,
            source=finding.source,
        )
        for finding in assessment.findings
    ]
    checks = assessment.checks
    domain_comparison = assessment.domain_comparison
    score = None
    level = None
    breakdown = None
    if assessment.risk_score is None or assessment.score_breakdown is None:
        calculated = assess_risk(
            findings=findings,
            checks=checks,
            company_domains_available=bool(
                domain_comparison.get("company_website_domain")
                or domain_comparison.get("job_url_domain")
            ),
            domain_comparison=domain_comparison,
            ml_assessment=assessment.ml_assessment,
        )
        score = calculated.risk_score
        level = calculated.risk_level
        breakdown = calculated.score_breakdown
    company_sender_verification = build_company_sender_verification(
        company_name=offer.company_name if offer else "Unknown company",
        sender_email=offer.sender_email if offer else "Not supplied",
        domain_comparison=domain_comparison,
        findings=findings,
    )
    return RiskAssessment(
        category=assessment.category,
        explanation=assessment.explanation,
        findings=findings,
        checks=checks,
        recommended_actions=assessment.recommended_actions,
        limitations=assessment.limitations,
        domain_comparison=domain_comparison,
        ml_assessment=assessment.ml_assessment,
        risk_score=score if score is not None else assessment.risk_score,
        risk_level=level if level is not None else assessment.risk_level,
        score_breakdown=breakdown if breakdown is not None else assessment.score_breakdown,
        company_sender_verification=company_sender_verification,
    )
