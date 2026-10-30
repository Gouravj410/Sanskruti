import io
import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from PIL import Image
from app.core.config import settings
from app.core.security import verify_curator_access
from app.services.media_storage import get_storage_service

router = APIRouter(prefix="/media", tags=["Media Storage"])

@router.post("/upload")
async def upload_media(
    file: UploadFile = File(...),
    _: bool = Depends(verify_curator_access)
):
    # 1. Content-Type check
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
        )
    
    # 2. Read in chunks to prevent memory exhaustion
    file_bytes = bytearray()
    chunk_size = 1024 * 1024 # 1MB chunks
    
    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        file_bytes.extend(chunk)
        if len(file_bytes) > settings.MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed upload size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)} MB."
            )

    # 3. Cryptographic/Format verification using Pillow
    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.verify()
        raw_format = (image.format or "JPEG").upper()
        ext_map = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}
        if raw_format not in ext_map:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported image format '{raw_format}'. Allowed: JPEG, PNG, WEBP."
            )
        safe_ext = ext_map[raw_format]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content could not be verified as a valid, decodeable image."
        )

    # 4. Save with randomized unique identifier
    unique_filename = f"{uuid.uuid4().hex[:16]}{safe_ext}"
    storage = get_storage_service()
    url = storage.save_file(bytes(file_bytes), unique_filename)
    
    return {
        "filename": unique_filename,
        "url": url,
        "content_type": file.content_type,
        "size_bytes": len(file_bytes)
    }
