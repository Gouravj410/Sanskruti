from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.enums import InformationLayer

class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(Integer, primary_key=True, index=True)
    art_form_id = Column(Integer, ForeignKey("art_forms.id", ondelete="CASCADE"), nullable=False, index=True)
    accession_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    native_title = Column(String(200), nullable=True)
    
    # Layer integrity: VERIFIED, COMMUNITY, AI_INTERPRETATION, AI_GENERATED
    information_layer = Column(String(50), nullable=False, default=InformationLayer.VERIFIED.value, index=True)
    
    period_estimated = Column(String(100), nullable=False)
    artist_attribution = Column(String(150), nullable=False) # e.g. "Jivya Soma Mashe", "Traditional Guild Master"
    region_origin = Column(String(150), nullable=False)
    
    medium = Column(String(150), nullable=False)
    dimensions = Column(String(100), nullable=True)
    materials_used = Column(JSON, nullable=False, default=list) # e.g. ["Rice paste", "Mud wall", "Geru red earth"]
    
    description = Column(Text, nullable=False)
    iconography_analysis = Column(Text, nullable=True)
    provenance = Column(Text, nullable=True)
    verification_source = Column(String(300), nullable=False) # Archive museum or field report
    
    image_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    
    tags = Column(JSON, nullable=False, default=list) # ["Sacred Geometry", "Harvest", "Tarpa Dance"]
    is_featured = Column(Boolean, default=False, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    art_form = relationship("ArtForm", back_populates="artifacts")
