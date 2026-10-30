from typing import Optional
from fastapi import Header, HTTPException, status
from app.core.config import settings

def verify_curator_access(
    x_curator_key: Optional[str] = Header(None, alias="X-Curator-Key"),
    authorization: Optional[str] = Header(None)
) -> bool:
    """Validate curator credential via header X-Curator-Key or Authorization Bearer token."""
    expected_key = settings.CURATOR_API_KEY.strip()
    
    if not expected_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Curator operations are disabled. Server environment variable CURATOR_API_KEY must be configured."
        )

    provided_key = None
    if x_curator_key:
        provided_key = x_curator_key.strip()
    elif authorization and authorization.startswith("Bearer "):
        provided_key = authorization.split("Bearer ", 1)[1].strip()

    if not provided_key or provided_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid or missing curator credentials. Provide valid X-Curator-Key or Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return True
