from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl


class OfferCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    company_name: str = Field(min_length=2, max_length=200)
    job_title: str = Field(min_length=2, max_length=200)
    message: str = Field(min_length=20, max_length=20_000)
    sender_email: EmailStr
    submitted_url: HttpUrl | None = None


class OfferResponse(BaseModel):
    id: str
    company_name: str
    job_title: str
    sender_email: EmailStr
    submitted_url: HttpUrl | None = None
    status: str
    message: str
