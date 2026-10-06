from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.ai_service import AIService
from app.schemas.ai import (
    AskSanskrutiRequest,
    AskSanskrutiResponse,
    MotifInsightRequest,
    MotifInsightResponse
)

router = APIRouter(prefix="/ai", tags=["AI Cultural Intelligence"])

@router.post("/ask", response_model=AskSanskrutiResponse)
async def ask_sanskruti(
    req: AskSanskrutiRequest,
    db: Session = Depends(get_db)
):
    try:
        response = await AIService.ask_sanskruti(
            db=db,
            question=req.question,
            art_form_slug=req.art_form_slug
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Intelligence processing error: {str(e)}")

@router.post("/interpret-motif", response_model=MotifInsightResponse)
async def interpret_motif(
    req: MotifInsightRequest,
    db: Session = Depends(get_db)
):
    try:
        response = await AIService.interpret_motif(
            db=db,
            motif_name=req.motif_name,
            art_form_slug=req.art_form_slug
        )
        return response
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Motif interpretation failed: {str(e)}")

@router.get("/suggested-inquiries")
def get_suggested_inquiries() -> List[Dict[str, str]]:
    return [
        {
            "art_form_slug": "madhubani",
            "question": "What is the symbolic meaning of the Kohbar motif in Madhubani bridal chambers?",
            "topic": "Sacred Iconography"
        },
        {
            "art_form_slug": "kolam",
            "question": "How does the mathematical symmetry of Brahma Mudi Kolam connect to spiritual discipline?",
            "topic": "Sacred Geometry"
        },
        {
            "art_form_slug": "warli",
            "question": "Why is the Tarpa dance depicted in concentric spirals rather than linear rows in Warli?",
            "topic": "Cosmic Symbolism"
        },
        {
            "art_form_slug": "kalamkari",
            "question": "What are the 23 traditional steps and organic mordants required in authentic Srikalahasti Kalamkari?",
            "topic": "Natural Metallurgy & Pigments"
        },
        {
            "art_form_slug": "phad",
            "question": "How do Bhopa-Bhopi priest-singers awaken and consecrate a Phad scroll before nocturnal performance?",
            "topic": "Ritual & Performance Tradition"
        },
        {
            "art_form_slug": "gond",
            "question": "What is the belief behind the signature 'Dharma' patterned strokes created by Pardhan Gond artisans?",
            "topic": "Animism & Nature Spirits"
        }
    ]
