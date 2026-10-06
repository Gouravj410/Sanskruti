from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey
from app.database.session import Base
from app.models.enums import InformationLayer

class AIQueryLog(Base):
    __tablename__ = "ai_query_logs"

    id = Column(Integer, primary_key=True, index=True)
    art_form_id = Column(Integer, ForeignKey("art_forms.id", ondelete="SET NULL"), nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    
    # Grounding context
    retrieved_art_form_slugs = Column(JSON, nullable=False, default=list)
    retrieved_artifact_ids = Column(JSON, nullable=False, default=list)
    cited_sources = Column(JSON, nullable=False, default=list)
    
    information_layer = Column(String(50), nullable=False, default=InformationLayer.AI_INTERPRETATION.value)
    model_name = Column(String(100), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
