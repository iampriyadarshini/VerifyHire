from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import EvidenceRecord
from app.repositories import get_offer
from app.schemas.evidence import AttachmentResponse, EmailCheckResponse
from app.services.evidence import (
    PRIVACY_NOTICE,
    attachment_assessment,
    detect_qr,
    email_assessment,
    extract_text,
    parse_email,
    validate_image,
)

router = APIRouter(tags=["evidence"])


async def _read_upload(upload: UploadFile, max_bytes: int) -> bytes:
    data = await upload.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail="Uploaded file is too large.")
    return data


@router.post("/offers/{offer_id}/attachments", response_model=AttachmentResponse)
async def analyze_attachment(
    offer_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> AttachmentResponse:
    offer = get_offer(db, offer_id)
    if offer is None:
        raise HTTPException(status_code=404, detail="Offer not found.")
    data = await _read_upload(file, 5 * 1024 * 1024)
    try:
        image, image_info = validate_image(data, file.content_type)
        text, readable = extract_text(image)
        qr_codes = detect_qr(image)
        qr_url = next((item["content"] for item in qr_codes if item["kind"] == "url"), None)
        assessment = attachment_assessment(
            text,
            company_name=offer.company_name,
            job_title=offer.job_title,
            sender_email=offer.sender_email,
            company_website=offer.company_website,
            submitted_url=offer.submitted_url or qr_url,
        )
    except ValueError as exc:
        raise HTTPException(status_code=415, detail=str(exc)) from exc
    result = {
        "filename": "processed-image",
        "image": image_info,
        "ocr": {"status": "completed" if readable else "unreadable", "text": text},
        "qr_codes": qr_codes,
        "assessment": assessment.model_dump(),
    }
    try:
        db.add(EvidenceRecord(offer_id=offer_id, evidence_type="image", result=result))
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Evidence could not be stored.") from exc
    return AttachmentResponse(
        status="processed",
        filename="processed-image",
        image=image_info,
        ocr={"status": "completed" if readable else "unreadable", "text": text},
        qr_codes=qr_codes,
        assessment=assessment,
        privacy_notice=PRIVACY_NOTICE,
    )


@router.post("/email-checks", response_model=EmailCheckResponse)
async def analyze_email(
    file: UploadFile = File(...),
    company_name: str = Form("Unknown company"),
    company_website: str | None = Form(None),
    db: Session = Depends(get_db),
) -> EmailCheckResponse:
    if not file.filename or not file.filename.lower().endswith(".eml"):
        raise HTTPException(status_code=415, detail="Unsupported email type. Upload an .eml file.")
    data = await _read_upload(file, 5 * 1024 * 1024)
    try:
        parsed = parse_email(data)
        if not parsed["from"] and not parsed["subject"] and not parsed["body"]:
            raise ValueError("The email file does not contain readable message data.")
        assessment = email_assessment(parsed, company_name, company_website)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    metadata = {key: parsed[key] for key in ("from", "reply_to", "return_path", "subject", "date", "received_count")}
    result = {"metadata": metadata, "authentication": parsed["authentication"], "assessment": assessment.model_dump()}
    try:
        db.add(EvidenceRecord(offer_id=None, evidence_type="email", result=result))
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Email analysis could not be stored.") from exc
    return EmailCheckResponse(
        status="processed",
        metadata=metadata,
        authentication=parsed["authentication"],
        limitations=[
            "Email headers are supplied by the user and can be forged.",
            "Missing authentication evidence is not treated as a failure.",
            "No live SPF, DKIM, DMARC, link, or attachment checks were performed.",
        ],
        assessment=assessment,
        privacy_notice=PRIVACY_NOTICE,
    )
