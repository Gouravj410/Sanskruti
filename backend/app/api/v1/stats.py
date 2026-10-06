from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.repositories.archive_repo import ArchiveRepository
from app.schemas.stats import ArchiveStats

router = APIRouter(prefix="/stats", tags=["Archive Statistics"])

@router.get("", response_model=ArchiveStats)
def get_stats(db: Session = Depends(get_db)):
    data = ArchiveRepository.get_archive_stats(db)
    return data
