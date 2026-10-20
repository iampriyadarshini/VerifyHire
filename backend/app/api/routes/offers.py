from uuid import uuid4

from fastapi import APIRouter, HTTPException, status

from app.schemas.offer import OfferCreate, OfferResponse

router = APIRouter(prefix="/offers", tags=["offers"])
_offers: dict[str, OfferCreate] = {}


@router.post("", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
async def create_offer(offer: OfferCreate) -> OfferResponse:
    offer_id = str(uuid4())
    _offers[offer_id] = offer
    return OfferResponse(
        id=offer_id,
        company_name=offer.company_name,
        job_title=offer.job_title,
        sender_email=offer.sender_email,
        submitted_url=offer.submitted_url,
        status="received",
        message="Offer received. Verification analysis has not been run yet.",
    )


@router.get("/{offer_id}", response_model=OfferResponse)
async def get_offer(offer_id: str) -> OfferResponse:
    offer = _offers.get(offer_id)
    if offer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found.",
        )

    return OfferResponse(
        id=offer_id,
        company_name=offer.company_name,
        job_title=offer.job_title,
        sender_email=offer.sender_email,
        submitted_url=offer.submitted_url,
        status="received",
        message="Offer received. Verification analysis has not been run yet.",
    )
