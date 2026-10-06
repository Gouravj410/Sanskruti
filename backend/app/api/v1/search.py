from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.repositories.archive_repo import ArchiveRepository
from app.schemas.art_form import ArtFormSummary
from app.schemas.artifact import ArtifactSummary

router = APIRouter(prefix="/search", tags=["Archive Search"])

@router.get("")
def search_archive(
    q: str = Query(..., min_length=2, description="Search query string"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    raw_results = ArchiveRepository.search_multi_facet(db, q)
    
    art_forms_out = []
    for af in raw_results["art_forms"]:
        item = ArtFormSummary.model_validate(af)
        item.artifact_count = len(af.artifacts)
        art_forms_out.append(item)

    artifacts_out = []
    for art in raw_results["artifacts"]:
        summary = ArtifactSummary.model_validate(art)
        if art.art_form:
            summary.art_form_name = art.art_form.name
            summary.art_form_slug = art.art_form.slug
        artifacts_out.append(summary)

    return {
        "query": q,
        "counts": {
            "art_forms": len(art_forms_out),
            "artifacts": len(artifacts_out),
            "motifs": len(raw_results["motifs"]),
        },
        "art_forms": art_forms_out,
        "artifacts": artifacts_out,
        "motifs": raw_results["motifs"]
    }
