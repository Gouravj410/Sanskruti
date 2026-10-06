from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.repositories.archive_repo import ArchiveRepository
from app.schemas.practitioner import PractitionerEntryResponse, PractitionerEntryCreate
from app.models.enums import InformationLayer, VerificationStatus

router = APIRouter(prefix="/practitioners", tags=["Practitioner & Community Knowledge"])

@router.get("", response_model=List[PractitionerEntryResponse])
def list_practitioner_entries(
    art_form_id: Optional[int] = Query(None),
    art_form_slug: Optional[str] = Query(None),
    verification_status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    entries = ArchiveRepository.get_practitioners(
        db,
        art_form_id=art_form_id,
        art_form_slug=art_form_slug,
        status=verification_status
    )
    
    results = []
    for pe in entries:
        res = PractitionerEntryResponse.model_validate(pe)
        if pe.art_form:
            res.art_form_name = pe.art_form.name
            res.art_form_slug = pe.art_form.slug
        results.append(res)
    return results

@router.post("", response_model=PractitionerEntryResponse, status_code=status.HTTP_201_CREATED)
def submit_practitioner_entry(
    entry_in: PractitionerEntryCreate,
    db: Session = Depends(get_db)
):
    af = ArchiveRepository.get_art_form_by_id(db, entry_in.art_form_id)
    if not af:
        raise HTTPException(status_code=400, detail="Associated art form does not exist in archive.")
    
    data = entry_in.model_dump()
    data["information_layer"] = InformationLayer.COMMUNITY.value
    data["verification_status"] = VerificationStatus.PENDING_REVIEW.value
    
    created = ArchiveRepository.create_practitioner_entry(db, data)
    res = PractitionerEntryResponse.model_validate(created)
    res.art_form_name = af.name
    res.art_form_slug = af.slug
    return res
