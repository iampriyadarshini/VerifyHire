from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Offer
from app.repositories import assessment_schema, get_offer, save_offer
from app.services.analysis import analyze_offer
from app.schemas.offer import OfferCreate, OfferResponse

router = APIRouter(prefix="/offers", tags=["offers"])


def _response(offer: Offer) -> OfferResponse:
    if offer.assessment is None:
        raise HTTPException(status_code=500, detail="Offer assessment is unavailable.")
    return OfferResponse(
        id=offer.id,
        company_name=offer.company_name,
        job_title=offer.job_title,
        sender_email=offer.sender_email,
        submitted_url=offer.submitted_url,
        assessment=assessment_schema(offer.assessment),
        status="received",
        message="Offer received. This is a preliminary, evidence-based assessment.",
    )


@router.post("", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
def create_offer(offer: OfferCreate, db: Session = Depends(get_db)) -> OfferResponse:
    offer_id = str(uuid4())
    assessment = analyze_offer(
        company_name=offer.company_name,
        job_title=offer.job_title,
        message=offer.message,
        sender_email=str(offer.sender_email),
        submitted_url=str(offer.submitted_url) if offer.submitted_url else None,
        company_website=str(offer.company_website) if offer.company_website else None,
    )
    try:
        saved_offer = save_offer(
            db,
            offer=Offer(
                id=offer_id,
                company_name=offer.company_name,
                job_title=offer.job_title,
                message=offer.message,
                sender_email=str(offer.sender_email),
                submitted_url=str(offer.submitted_url) if offer.submitted_url else None,
                company_website=str(offer.company_website) if offer.company_website else None,
            ),
            assessment=assessment,
        )
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Offer could not be stored.") from exc
    return _response(saved_offer)


@router.get("/{offer_id}", response_model=OfferResponse)
def read_offer(offer_id: str, db: Session = Depends(get_db)) -> OfferResponse:
    offer = get_offer(db, offer_id)
    if offer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found.",
        )

    return _response(offer)
