from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class PractitionerEntryBase(BaseModel):
    art_form_id: int
    contributor_name: str
    role_or_title: str
    community_affiliation: str
    location: str
    title: str
    content: str
    lineage_tradition: Optional[str] = None
    media_url: Optional[str] = None

class PractitionerEntryCreate(PractitionerEntryBase):
    pass

class PractitionerEntryResponse(PractitionerEntryBase):
    id: int
    art_form_name: Optional[str] = None
    art_form_slug: Optional[str] = None
    information_layer: str
    verification_status: str
    curator_notes: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    published_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PractitionerReviewRequest(BaseModel):
    action: Optional[str] = None  # e.g. "APPROVE", "PUBLISH", "REJECT", "ARCHIVE"
    status: Optional[str] = None  # e.g. "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"
    curator_notes: Optional[str] = None
    reviewer_name: Optional[str] = None
    reviewed_by: Optional[str] = None
