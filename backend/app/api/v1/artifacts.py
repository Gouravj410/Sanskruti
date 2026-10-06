from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.repositories.archive_repo import ArchiveRepository
from app.schemas.artifact import ArtifactSummary, ArtifactDetail

router = APIRouter(prefix="/artifacts", tags=["Artifacts"])

@router.get("", response_model=List[ArtifactSummary])
def list_artifacts(
    art_form_id: Optional[int] = Query(None, description="Filter by art form ID"),
    art_form_slug: Optional[str] = Query(None, description="Filter by art form slug"),
    layer: Optional[str] = Query(None, description="Filter by information layer (VERIFIED, COMMUNITY, AI_INTERPRETATION, AI_GENERATED)"),
    is_featured: Optional[bool] = Query(None, description="Filter featured artifacts"),
    search: Optional[str] = Query(None, description="Search in artifact titles, descriptions, materials"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    artifacts = ArchiveRepository.get_artifacts(
        db,
        art_form_id=art_form_id,
        art_form_slug=art_form_slug,
        layer=layer,
        is_featured=is_featured,
        search=search,
        limit=limit,
        offset=offset
    )
    
    results = []
    for art in artifacts:
        summary = ArtifactSummary.model_validate(art)
        if art.art_form:
            summary.art_form_name = art.art_form.name
            summary.art_form_slug = art.art_form.slug
        results.append(summary)
        
    return results

@router.get("/{id}", response_model=ArtifactDetail)
def get_artifact(id: int, db: Session = Depends(get_db)):
    art = ArchiveRepository.get_artifact_by_id(db, id)
    if not art:
        raise HTTPException(status_code=404, detail=f"Artifact record #{id} not found.")
    
    detail = ArtifactDetail.model_validate(art)
    if art.art_form:
        detail.art_form_name = art.art_form.name
        detail.art_form_slug = art.art_form.slug
    return detail
