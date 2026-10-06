from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class ArtifactBase(BaseModel):
    art_form_id: int
    accession_number: str
    title: str
    native_title: Optional[str] = None
    information_layer: str = "VERIFIED"
    period_estimated: str
    artist_attribution: str
    region_origin: str
    medium: str
    dimensions: Optional[str] = None
    materials_used: List[str] = []
    description: str
    iconography_analysis: Optional[str] = None
    provenance: Optional[str] = None
    verification_source: str
    image_url: str
    thumbnail_url: Optional[str] = None
    tags: List[str] = []
    is_featured: bool = False

class ArtifactCreate(ArtifactBase):
    pass

class ArtifactSummary(BaseModel):
    id: int
    art_form_id: int
    art_form_name: Optional[str] = None
    art_form_slug: Optional[str] = None
    accession_number: str
    title: str
    native_title: Optional[str] = None
    information_layer: str
    period_estimated: str
    artist_attribution: str
    region_origin: str
    medium: str
    image_url: str
    is_featured: bool
    tags: List[str]

    class Config:
        from_attributes = True

class ArtifactDetail(ArtifactBase):
    id: int
    art_form_name: Optional[str] = None
    art_form_slug: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
