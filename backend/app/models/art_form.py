from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.enums import PreservationStatus

class ArtForm(Base):
    __tablename__ = "art_forms"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    native_name = Column(String(150), nullable=True)
    category = Column(String(100), nullable=False, default="Traditional Visual Art")
    region = Column(String(150), nullable=False)
    states = Column(JSON, nullable=False, default=list) # e.g. ["Bihar", "Jharkhand"]
    period_origin = Column(String(150), nullable=False)
    summary = Column(Text, nullable=False)
    historical_context = Column(Text, nullable=False)
    ritual_context = Column(Text, nullable=False)
    preservation_status = Column(String(50), nullable=False, default=PreservationStatus.LIVING.value)
    
    # Structured cultural knowledge
    canonical_motifs = Column(JSON, nullable=False, default=list) 
    # [{name, symbolism, visual_cue, cultural_meaning}]
    
    traditional_materials = Column(JSON, nullable=False, default=list) 
    # [{name, category, natural_source, preparation, purpose}]
    
    techniques = Column(JSON, nullable=False, default=list) 
    # [{step_order, name, description, tool}]
    
    practitioner_communities = Column(JSON, nullable=False, default=list) 
    # ["Traditional Guilds", "Women artisans of Mithila"]
    
    sources = Column(JSON, nullable=False, default=list) 
    # [{title, author, year, archive_institution, citation_type, isbn_or_url}]
    
    cover_image_url = Column(String(500), nullable=False)
    banner_image_url = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    artifacts = relationship("Artifact", back_populates="art_form", cascade="all, delete-orphan")
    practitioners = relationship("PractitionerEntry", back_populates="art_form", cascade="all, delete-orphan")
