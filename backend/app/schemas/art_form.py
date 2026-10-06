from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class CanonicalMotif(BaseModel):
    name: str
    symbolism: str
    visual_cue: str
    cultural_meaning: Optional[str] = None

class TraditionalMaterial(BaseModel):
    name: str
    category: str # e.g. "Pigment", "Binder", "Surface", "Tool"
    natural_source: str
    preparation: Optional[str] = None
    purpose: Optional[str] = None

class TechniqueStep(BaseModel):
    step_order: int
    name: str
    description: str
    tool: Optional[str] = None

class ArchivalSource(BaseModel):
    title: str
    author: Optional[str] = None
    year: Optional[str] = None
    archive_institution: Optional[str] = None
    citation_type: Optional[str] = "Academic Monograph"
    isbn_or_url: Optional[str] = None

class ArtFormBase(BaseModel):
    slug: str
    name: str
    native_name: Optional[str] = None
    category: str = "Traditional Visual Art"
    region: str
    states: List[str] = []
    period_origin: str
    summary: str
    historical_context: str
    ritual_context: str
    preservation_status: str
    canonical_motifs: List[CanonicalMotif] = []
    traditional_materials: List[TraditionalMaterial] = []
    techniques: List[TechniqueStep] = []
    practitioner_communities: List[str] = []
    sources: List[ArchivalSource] = []
    cover_image_url: str
    banner_image_url: Optional[str] = None

class ArtFormCreate(ArtFormBase):
    pass

class ArtFormSummary(BaseModel):
    id: int
    slug: str
    name: str
    native_name: Optional[str] = None
    category: str
    region: str
    states: List[str]
    period_origin: str
    summary: str
    preservation_status: str
    cover_image_url: str
    artifact_count: Optional[int] = 0

    class Config:
        from_attributes = True

class ArtFormDetail(ArtFormBase):
    id: int
    created_at: datetime
    updated_at: datetime
    artifact_count: int = 0
    practitioner_count: int = 0

    class Config:
        from_attributes = True
