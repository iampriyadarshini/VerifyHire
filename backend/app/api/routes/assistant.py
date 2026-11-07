from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.repositories import get_offer
from app.schemas.assistant import AssistantChatRequest, AssistantChatResponse
from app.services.assistant_service import AssistantUnavailableError, chat_about_report

router = APIRouter(prefix="/api/reports", tags=["assistant"])


@router.post(
    "/{report_id}/assistant/chat",
    response_model=AssistantChatResponse,
)
def chat(
    report_id: str,
    request: AssistantChatRequest,
    db: Session = Depends(get_db),
) -> AssistantChatResponse:
    offer = get_offer(db, report_id)
    if offer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    try:
        return chat_about_report(offer=offer, question=request.message)
    except AssistantUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
