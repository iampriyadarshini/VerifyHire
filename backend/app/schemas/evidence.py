from pydantic import BaseModel, Field

from app.services.findings import RiskAssessment


class QRFinding(BaseModel):
    content: str
    kind: str
    warning: str


class AttachmentResponse(BaseModel):
    status: str
    filename: str
    image: dict[str, int | str]
    ocr: dict[str, str | bool]
    qr_codes: list[QRFinding]
    assessment: RiskAssessment
    privacy_notice: str


class EmailCheckResponse(BaseModel):
    status: str
    metadata: dict[str, str | int | None]
    authentication: dict[str, dict[str, str]]
    limitations: list[str]
    assessment: RiskAssessment
    privacy_notice: str


class EmailCheckRequest(BaseModel):
    company_name: str = Field(default="Unknown company", min_length=2, max_length=200)
    company_website: str | None = None
