import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.session import Base, engine
import app.models # registers models with Base
from app.api.v1.art_forms import router as art_forms_router
from app.api.v1.artifacts import router as artifacts_router
from app.api.v1.practitioners import router as practitioners_router
from app.api.v1.search import router as search_router
from app.api.v1.ai import router as ai_router
from app.api.v1.stats import router as stats_router
from app.api.v1.media import router as media_router

# Ensure storage directory exists
Path(settings.MEDIA_STORAGE_DIR).mkdir(parents=True, exist_ok=True)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Digital Cultural Art Archive & AI Intelligence Platform for Traditional Indian Art Forms."
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded / local static media files
app.mount(settings.MEDIA_URL_PREFIX, StaticFiles(directory=settings.MEDIA_STORAGE_DIR), name="media")

# Include API v1 Routers
app.include_router(art_forms_router, prefix=settings.API_V1_STR)
app.include_router(artifacts_router, prefix=settings.API_V1_STR)
app.include_router(practitioners_router, prefix=settings.API_V1_STR)
app.include_router(search_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(stats_router, prefix=settings.API_V1_STR)
app.include_router(media_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "documentation": "/docs",
        "archival_philosophy": "Digital Archive -> Structured Cultural Knowledge -> Search & Discovery -> AI Intelligence"
    }

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_enabled": bool(settings.GEMINI_API_KEY),
        "ai_model": settings.GEMINI_MODEL
    }
