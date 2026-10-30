from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database.session import Base

class ArchivalMediaFile(Base):
    __tablename__ = "archival_media_files"

    id = Column(Integer, primary_key=True, index=True)
    artifact_id = Column(Integer, ForeignKey("artifacts.id", ondelete="SET NULL"), nullable=True, index=True)
    art_form_id = Column(Integer, ForeignKey("art_forms.id", ondelete="SET NULL"), nullable=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    sha256_hash = Column(String(64), nullable=False, index=True)
    storage_provider = Column(String(50), nullable=False, default="local")  # local, supabase, s3
    public_url = Column(String(500), nullable=False)
    attribution = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
