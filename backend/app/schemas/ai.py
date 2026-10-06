from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class SourceCitation(BaseModel):
    title: str
    author: Optional[str] = None
    year: Optional[str] = None
    archive_institution: Optional[str] = None
    citation_type: Optional[str] = "Archival Record"
    layer: str = "VERIFIED"

class AskSanskrutiRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000)
    art_form_slug: Optional[str] = None

class GroundedArtifactRef(BaseModel):
    id: int
    accession_number: str
    title: str
    art_form_name: str
    information_layer: str
    image_url: str

class AskSanskrutiResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    question: str
    answer: str
    information_layer: str = "AI_INTERPRETATION"
    model_used: str
    is_grounded: bool
    context_art_form: Optional[str] = None
    sources_cited: List[SourceCitation] = []
    grounded_artifacts: List[GroundedArtifactRef] = []
    disclaimer: str = (
        "AI Cultural Interpretation Layer: This response is synthesized by AI using verified records "
        "from the Sanskruti Digital Cultural Archive. It does not replace indigenous practitioner lineage "
        "or academic peer-reviewed primary documents."
    )

class MotifInsightRequest(BaseModel):
    motif_name: str
    art_form_slug: str

class MotifInsightResponse(BaseModel):
    motif_name: str
    art_form_name: str
    traditional_symbolism: str
    sacred_ritual_purpose: str
    geometric_and_natural_cues: List[str] = []
    information_layer: str = "AI_INTERPRETATION"
    sources_cited: List[SourceCitation] = []
