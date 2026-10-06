from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.enums import InformationLayer, VerificationStatus

class PractitionerEntry(Base):
    __tablename__ = "practitioner_entries"

    id = Column(Integer, primary_key=True, index=True)
    art_form_id = Column(Integer, ForeignKey("art_forms.id", ondelete="CASCADE"), nullable=False, index=True)
    contributor_name = Column(String(150), nullable=False)
    role_or_title = Column(String(100), nullable=False) # e.g. "Master Artisan", "7th Gen Kalamkari Practitioner"
    community_affiliation = Column(String(150), nullable=False)
    location = Column(String(150), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False) # Oral lore, pigment recipes, sacred hymns
    lineage_tradition = Column(String(200), nullable=True) # e.g. "Sri Kalahasti Guru-Shishya tradition"
    media_url = Column(String(500), nullable=True)
    
    information_layer = Column(String(50), nullable=False, default=InformationLayer.COMMUNITY.value)
    verification_status = Column(String(50), nullable=False, default=VerificationStatus.COMMUNITY_VETTED.value)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    art_form = relationship("ArtForm", back_populates="practitioners")
