from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.enums import InformationLayer

class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(Integer, primary_key=True, index=True)
    art_form_id = Column(Integer, ForeignKey("art_forms.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(60), nullable=False, index=True)  # PROCEDURAL_STEP, MATERIAL_CHEMISTRY, ICONOGRAPHY, SACRED_RITUAL, HISTORICAL_PROVENANCE
    step_number = Column(Integer, nullable=True, index=True)  # 1, 2, 3 ... 23
    title = Column(String(250), nullable=False)
    content = Column(Text, nullable=False)  # Exact technical instructions, temperatures, ingredients, ratios, methods
    source_citation = Column(String(300), nullable=False)
    archive_institution = Column(String(200), nullable=False)
    keywords = Column(JSON, nullable=False, default=list)
    information_layer = Column(String(50), nullable=False, default=InformationLayer.VERIFIED.value)
    created_at = Column(DateTime, default=datetime.utcnow)

    art_form = relationship("ArtForm", backref="knowledge_chunks")
