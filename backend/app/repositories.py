from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Assessment, Finding, Offer
from app.services.findings import Finding as FindingSchema
from app.services.findings import RiskAssessment


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


def assessment_schema(assessment: Assessment) -> RiskAssessment:
    return RiskAssessment(
        category=assessment.category,
        explanation=assessment.explanation,
        findings=[
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
        ],
        checks=assessment.checks,
        recommended_actions=assessment.recommended_actions,
        limitations=assessment.limitations,
        domain_comparison=assessment.domain_comparison,
    )
