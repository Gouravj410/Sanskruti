import os
import json
from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent

def parse_cors_origins() -> List[str]:
    raw = os.getenv("CORS_ORIGINS", "")
    if not raw.strip():
        return [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost",
            "http://localhost:80",
        ]
    # Check if raw is JSON or comma-separated list
    raw = raw.strip()
    if raw.startswith("[") and raw.endswith("]"):
        try:
            return json.loads(raw)
        except Exception:
            pass
    return [origin.strip() for origin in raw.split(",") if origin.strip()]

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sanskruti Digital Cultural Art Archive"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database: Supports SQLite (default for local dev) and PostgreSQL for production
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'sanskruti.db'}")
    
    # Curator & Admin Security Key (used to authorize review, curation, and administrative write actions)
    CURATOR_API_KEY: str = os.getenv("CURATOR_API_KEY", "sanskruti_curator_secret_2026")
    
    # Gemini AI Configuration (Optional: Archive operates completely without AI)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    
    # Media Storage Configuration
    MEDIA_STORAGE_DIR: str = os.getenv("MEDIA_STORAGE_DIR", str(BASE_DIR / "media_storage"))
    MEDIA_URL_PREFIX: str = "/media"
    MAX_UPLOAD_SIZE_BYTES: int = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(10 * 1024 * 1024))) # 10 MB limit
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp"]
    
    # CORS
    CORS_ORIGINS: List[str] = parse_cors_origins()

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
