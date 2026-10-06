import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.media_storage import get_storage_service

router = APIRouter(prefix="/media", tags=["Media Storage"])

@router.post("/upload")
async def upload_media(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed in archival media storage.")
    
    file_bytes = await file.read()
    ext = Path(file.filename).suffix or ".jpg"
    unique_filename = f"{uuid.uuid4().hex[:12]}{ext}"
    
    storage = get_storage_service()
    url = storage.save_file(file_bytes, unique_filename)
    
    return {
        "filename": unique_filename,
        "url": url,
        "content_type": file.content_type,
        "size_bytes": len(file_bytes)
    }
