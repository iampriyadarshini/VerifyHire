import io
import re
from email import policy
from email.parser import BytesParser
from typing import Any
from urllib.parse import urlsplit

from PIL import Image, UnidentifiedImageError

from app.services.analysis import analyze_offer
from app.services.findings import RiskAssessment
from app.services.url_analyzer import analyze_urls
from app.services.company_verification import verify_company
from app.services.risk_engine import assess_risk
from app.services.message_analyzer import analyze_message

MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_EMAIL_BYTES = 5 * 1024 * 1024
MAX_IMAGE_PIXELS = 20_000_000
MIN_IMAGE_DIMENSION = 20
PRIVACY_NOTICE = (
    "Files are processed temporarily for local analysis. Uploaded files are not retained; "
    "only the minimum structured result is stored with the report. OCR and headers do not prove authenticity."
)


def validate_image(data: bytes, content_type: str | None) -> tuple[Image.Image, dict[str, int | str]]:
    if len(data) > MAX_IMAGE_BYTES:
        raise ValueError("Image file is too large. The maximum size is 5 MB.")
    if content_type not in {"image/png", "image/jpeg", "image/jpg"}:
        raise ValueError("Unsupported image type. Upload a PNG, JPG, or JPEG file.")
    try:
        image = Image.open(io.BytesIO(data))
        image.verify()
        image = Image.open(io.BytesIO(data))
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError("The uploaded file is not a readable PNG or JPEG image.") from exc
    width, height = image.size
    if width < MIN_IMAGE_DIMENSION or height < MIN_IMAGE_DIMENSION:
        raise ValueError("Image dimensions are too small to analyze.")
    if width * height > MAX_IMAGE_PIXELS:
        raise ValueError("Image dimensions are too large to process safely.")
    if image.format not in {"PNG", "JPEG"}:
        raise ValueError("The file content is not a supported PNG or JPEG image.")
    return image, {"width": width, "height": height, "format": image.format}


def extract_text(image: Image.Image) -> tuple[str, bool]:
    try:
        import pytesseract
        text = pytesseract.image_to_string(image).strip()
    except (ImportError, RuntimeError, OSError):
        return "", False
    return text[:20_000], bool(text)


def detect_qr(image: Image.Image) -> list[dict[str, str]]:
    try:
        import cv2
        import numpy as np
    except ImportError:
        return []
    try:
        detector = cv2.QRCodeDetector()
        data, _, _ = detector.detectAndDecode(np.array(image.convert("RGB")))
    except cv2.error:
        return []
    if not data:
        return []
    parsed = urlsplit(data)
    kind = "url" if parsed.scheme in {"http", "https"} and parsed.netloc else "text"
    return [{
        "content": data[:2048],
        "kind": kind,
        "warning": "Do not open this destination until you independently verify it; VerifyHire never fetches QR URLs.",
    }]


def attachment_assessment(text: str, *, company_name: str, job_title: str, sender_email: str, company_website: str | None, submitted_url: str | None) -> RiskAssessment:
    return analyze_offer(
        company_name=company_name,
        job_title=job_title,
        message=text or "No readable text was extracted from the image.",
        sender_email=sender_email,
        submitted_url=submitted_url,
        company_website=company_website,
    )


def parse_email(data: bytes) -> dict[str, Any]:
    if len(data) > MAX_EMAIL_BYTES:
        raise ValueError("Email file is too large. The maximum size is 5 MB.")
    if b"\x00" in data:
        raise ValueError("The email file contains invalid header data.")
    try:
        message = BytesParser(policy=policy.default).parsebytes(data)
    except (ValueError, TypeError) as exc:
        raise ValueError("The email file could not be parsed safely.") from exc
    body_parts: list[str] = []
    if message.is_multipart():
        for part in message.walk():
            if part.get_content_type() == "text/plain" and not part.get_filename():
                body_parts.append(part.get_content())
    elif message.get_content_type() == "text/plain":
        body_parts.append(message.get_content())
    body = "\n".join(body_parts)[:20_000]
    authentication: dict[str, dict[str, str]] = {}
    auth_headers = message.get_all("Authentication-Results", [])
    for header in auth_headers:
        for name, result in re.findall(r"\b(spf|dkim|dmarc)\s*=\s*(pass|fail|softfail|neutral|none|temperror|permerror)\b", header, re.I):
            normalized = result.lower()
            status = "passing" if normalized == "pass" else "failing" if normalized in {"fail", "softfail", "permerror"} else "inconclusive"
            authentication[name.lower()] = {"status": status, "evidence": normalized}
    for name in ("spf", "dkim", "dmarc"):
        authentication.setdefault(name, {"status": "missing", "evidence": "No relevant supplied Authentication-Results evidence."})
    return {
        "from": message.get("From"),
        "reply_to": message.get("Reply-To"),
        "return_path": message.get("Return-Path"),
        "subject": message.get("Subject"),
        "date": message.get("Date"),
        "received_count": len(message.get_all("Received", [])),
        "body": body,
        "sender_email": message.get("From", ""),
        "authentication": authentication,
    }


def email_assessment(parsed: dict[str, Any], company_name: str, company_website: str | None) -> RiskAssessment:
    sender = parsed["sender_email"]
    match = re.search(r"<([^>]+)>", sender or "")
    sender_email = match.group(1) if match else sender
    message_findings, message_checks = analyze_message(f"{parsed.get('subject') or ''}\n{parsed.get('body') or ''}")
    url_findings, url_checks, domains = analyze_urls(job_url=None, company_website=company_website, sender_email=sender_email)
    company_findings, company_checks, _ = verify_company(
        company_name=company_name, company_website=company_website,
        job_domain=None, sender_domain=domains["sender_email_domain"],
    )
    return assess_risk(
        findings=message_findings + url_findings + company_findings,
        checks=message_checks + url_checks + company_checks,
        company_domains_available=bool(company_website or domains["sender_email_domain"]),
        domain_comparison=domains,
    )
