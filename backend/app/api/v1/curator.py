from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import verify_curator_access
from app.repositories.archive_repo import ArchiveRepository
from app.schemas.practitioner import PractitionerEntryResponse, PractitionerReviewRequest

router = APIRouter(
    prefix="/curator",
    tags=["Curator Review & Moderation"],
    dependencies=[Depends(verify_curator_access)]
)

@router.get("/submissions", response_model=List[PractitionerEntryResponse])
def list_curator_submissions(
    status_filter: Optional[str] = Query(None, description="Filter by status: PENDING_REVIEW, APPROVED, PUBLISHED, REJECTED, ARCHIVED"),
    art_form_slug: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List all community submissions across any status for curator review."""
    entries = ArchiveRepository.get_practitioners(
        db,
        art_form_slug=art_form_slug,
        status=status_filter,
        include_unreviewed=True
    )
    
    results = []
    for pe in entries:
        res = PractitionerEntryResponse.model_validate(pe)
        if pe.art_form:
            res.art_form_name = pe.art_form.name
            res.art_form_slug = pe.art_form.slug
        results.append(res)
    return results

@router.post("/submissions/{entry_id}/review", response_model=PractitionerEntryResponse)
@router.patch("/submissions/{entry_id}/review", response_model=PractitionerEntryResponse)
def review_submission(
    entry_id: int,
    req: PractitionerReviewRequest,
    db: Session = Depends(get_db)
):
    """Curator action to approve, publish, reject, or archive a practitioner submission."""
    action = req.action or req.status
    if not action:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing review action or status."
        )

    reviewer_name = req.reviewer_name or req.reviewed_by or "Archival Curator"

    try:
        updated = ArchiveRepository.review_practitioner_entry(
            db=db,
            entry_id=entry_id,
            action=action,
            curator_notes=req.curator_notes,
            reviewer_name=reviewer_name
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Practitioner submission #{entry_id} not found."
        )

    res = PractitionerEntryResponse.model_validate(updated)
    if updated.art_form:
        res.art_form_name = updated.art_form.name
        res.art_form_slug = updated.art_form.slug
    return res

@router.get("/verify-key")
@router.post("/verify-key")
def verify_curator_key():
    """Lightweight endpoint for frontend curator desk to test provided access key."""
    return {"status": "authorized", "role": "curator", "valid": True}
