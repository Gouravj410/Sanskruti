from typing import List, Dict
from pydantic import BaseModel

class LayerBreakdown(BaseModel):
    verified_count: int
    community_count: int
    ai_interpretation_count: int
    ai_generated_count: int

class ArchiveStats(BaseModel):
    total_art_forms: int
    total_artifacts: int
    total_motifs: int
    total_practitioners: int
    represented_states: int
    layers: LayerBreakdown
    categories: Dict[str, int]
