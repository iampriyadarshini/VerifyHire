import re

from app.services.findings import CheckStatus, Finding


def _finding(
    rule_id: str,
    severity: str,
    title: str,
    explanation: str,
    evidence: str,
    action: str,
) -> Finding:
    return Finding(
        rule_id=rule_id,
        severity=severity,
        title=title,
        explanation=explanation,
        evidence=evidence,
        recommended_action=action,
        source="message",
    )


def analyze_message(message: str) -> tuple[list[Finding], list[CheckStatus]]:
    findings: list[Finding] = []

    rules = [
        (
            "MSG_PAYMENT_REQUEST",
            "high",
            "Payment requested to apply or start",
            r"\b(?:pay|payment|fee|charge|wire|gift card|registration fee|application fee)\b.{0,80}\b(?:job|role|apply|start|training|placement)\b|\b(?:job|role|apply|start|training|placement)\b.{0,80}\b(?:pay|payment|fee|charge|wire|gift card)\b",
            "Do not send money to obtain employment or an internship.",
        ),
        (
            "MSG_DEPOSIT_EQUIPMENT",
            "high",
            "Deposit or specified equipment purchase requested",
            r"\b(?:security deposit|refundable deposit|buy|purchase|order)\b.{0,100}\b(?:equipment|laptop|software|kit|seller|vendor)\b",
            "Do not pay a specified seller or deposit before independently verifying the employer.",
        ),
        (
            "MSG_CREDENTIAL_REQUEST",
            "high",
            "Sensitive credentials requested",
            r"\b(?:otp|one[- ]time password|password|bank(?:ing)? details?|card number|pin|ssn|social security|passport)\b",
            "Do not share passwords, OTPs, banking credentials, or unnecessary identity documents.",
        ),
        (
            "MSG_URGENCY_PRESSURE",
            "medium",
            "Urgency or pressure language detected",
            r"\b(?:urgent|immediately|today only|act now|limited time|respond within|final notice|immediate start)\b",
            "Take time to verify the employer and role through an independent channel.",
        ),
        (
            "MSG_UNREALISTIC_CLAIM",
            "medium",
            "Unrealistic pay or guaranteed selection claim",
            r"\b(?:guaranteed|100% selected|no interview|earn|salary|pay)\b.{0,60}\b(?:\$\s?\d{3,}|guaranteed|no experience|per day|per week|per month)\b",
            "Compare the role, compensation, and hiring process with the employer's official listing.",
        ),
        (
            "MSG_SUSPICIOUS_CHANNEL",
            "medium",
            "Unverifiable communication channel requested",
            r"\b(?:telegram|whatsapp|signal|crypto|telegram handle|personal gmail|personal yahoo)\b",
            "Verify the recruiter through an official company channel before continuing.",
        ),
    ]
    normalized_message = " ".join(message.split())
    for rule_id, severity, title, pattern, action in rules:
        match = re.search(pattern, normalized_message, flags=re.IGNORECASE)
        if match:
            evidence = match.group(0)[:180]
            explanation = {
                "MSG_PAYMENT_REQUEST": "The message connects payment language with applying for or starting work.",
                "MSG_DEPOSIT_EQUIPMENT": "The message appears to request money for equipment, a deposit, or a specified seller.",
                "MSG_CREDENTIAL_REQUEST": "The message asks for information that is not normally needed to evaluate a job offer.",
                "MSG_URGENCY_PRESSURE": "Pressure can reduce the time available for independent verification.",
                "MSG_UNREALISTIC_CLAIM": "Compensation or selection claims need context and independent confirmation.",
                "MSG_SUSPICIOUS_CHANNEL": "These channels can be legitimate, but they are harder to verify without an official company connection.",
            }[rule_id]
            findings.append(_finding(rule_id, severity, title, explanation, evidence, action))

    return findings, [
        CheckStatus(
            check_id="message-analysis",
            label="Message warning signs",
            status="completed",
            detail="The message was checked locally with context-aware rules; no external content was fetched.",
        )
    ]
