from typing import Literal

from pydantic import BaseModel, Field


class AssistantChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class AssistantChatResponse(BaseModel):
    report_id: str
    answer: str
    verification_status: Literal["VERIFIED", "MISMATCH", "UNABLE TO VERIFY"]
    evidence: list[str]
    limitations: list[str]
    provider: Literal["openai"]
