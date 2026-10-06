from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.repositories.archive_repo import ArchiveRepository
from app.schemas.art_form import ArtFormSummary, ArtFormDetail
from app.models.art_form import ArtForm

router = APIRouter(prefix="/art-forms", tags=["Art Forms"])

@router.get("", response_model=List[ArtFormSummary])
def list_art_forms(
    region: Optional[str] = Query(None, description="Filter by geographic region"),
    state: Optional[str] = Query(None, description="Filter by Indian State"),
    status: Optional[str] = Query(None, description="Filter by preservation status"),
    search: Optional[str] = Query(None, description="Keyword search in art forms"),
    db: Session = Depends(get_db)
):
    art_forms = ArchiveRepository.get_art_forms(db, region=region, state=state, status=status, search=search)
    results = []
    for af in art_forms:
        item = ArtFormSummary.model_validate(af)
        item.artifact_count = len(af.artifacts)
        results.append(item)
    return results

@router.get("/{slug}", response_model=ArtFormDetail)
def get_art_form_by_slug(slug: str, db: Session = Depends(get_db)):
    af = ArchiveRepository.get_art_form_by_slug(db, slug)
    if not af:
        raise HTTPException(status_code=404, detail=f"Art form '{slug}' not found in the archive.")
    
    detail = ArtFormDetail.model_validate(af)
    detail.artifact_count = len(af.artifacts)
    detail.practitioner_count = len(af.practitioners)
    return detail
