import json
import logging
from typing import Optional, List, Dict, Any
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.art_form import ArtForm
from app.models.artifact import Artifact
from app.models.ai_log import AIQueryLog
from app.models.enums import InformationLayer
from app.schemas.ai import AskSanskrutiResponse, SourceCitation, GroundedArtifactRef, MotifInsightResponse

logger = logging.getLogger("sanskruti.ai")

class AIService:
    @staticmethod
    def _build_context_from_db(
        db: Session,
        question: str,
        art_form_slug: Optional[str] = None
    ) -> Dict[str, Any]:
        """Extract relevant verified archival records and citations to ground AI responses."""
        target_art_forms: List[ArtForm] = []
        target_artifacts: List[Artifact] = []

        if art_form_slug:
            af = db.query(ArtForm).filter(ArtForm.slug == art_form_slug).first()
            if af:
                target_art_forms.append(af)
                target_artifacts = db.query(Artifact).filter(
                    Artifact.art_form_id == af.id,
                    Artifact.information_layer == InformationLayer.VERIFIED.value
                ).limit(5).all()

        if not target_art_forms:
            # Multi-word matching
            all_forms = db.query(ArtForm).all()
            for af in all_forms:
                if (af.name.lower() in question.lower() or 
                    af.slug.lower() in question.lower() or 
                    af.region.lower() in question.lower()):
                    target_art_forms.append(af)
            
            # If still none matched, take top 2 for broad context
            if not target_art_forms:
                target_art_forms = all_forms[:3]

        if not target_artifacts and target_art_forms:
            target_artifacts = db.query(Artifact).filter(
                Artifact.art_form_id.in_([af.id for af in target_art_forms]),
                Artifact.information_layer == InformationLayer.VERIFIED.value
            ).limit(6).all()

        # Build citations list
        citations: List[SourceCitation] = []
        for af in target_art_forms:
            for s in (af.sources or []):
                citations.append(SourceCitation(
                    title=s.get("title", f"Archival Record for {af.name}"),
                    author=s.get("author", "Sanskruti Archival Board"),
                    year=str(s.get("year", "Historical Record")),
                    archive_institution=s.get("archive_institution", "National Crafts Archive"),
                    citation_type=s.get("citation_type", "Archival Monograph"),
                    layer=InformationLayer.VERIFIED.value
                ))

        return {
            "art_forms": target_art_forms,
            "artifacts": target_artifacts,
            "citations": citations
        }

    @classmethod
    async def ask_sanskruti(
        cls,
        db: Session,
        question: str,
        art_form_slug: Optional[str] = None
    ) -> AskSanskrutiResponse:
        context_data = cls._build_context_from_db(db, question, art_form_slug)
        art_forms: List[ArtForm] = context_data["art_forms"]
        artifacts: List[Artifact] = context_data["artifacts"]
        citations: List[SourceCitation] = context_data["citations"]

        # Formulate grounded artifacts references
        grounded_artifacts: List[GroundedArtifactRef] = [
            GroundedArtifactRef(
                id=a.id,
                accession_number=a.accession_number,
                title=a.title,
                art_form_name=a.art_form.name if a.art_form else "Traditional Art",
                information_layer=a.information_layer,
                image_url=a.image_url
            )
            for a in artifacts
        ]

        # Prepare context prompt text
        context_text_blocks = []
        for af in art_forms:
            motifs_desc = ", ".join([f"{m.get('name')} ({m.get('symbolism')})" for m in (af.canonical_motifs or [])[:5]])
            materials_desc = ", ".join([f"{mat.get('name')} ({mat.get('natural_source')})" for mat in (af.traditional_materials or [])[:5]])
            context_text_blocks.append(
                f"### ART FORM: {af.name} ({af.native_name or ''})\n"
                f"- Region & States: {af.region} ({', '.join(af.states or [])})\n"
                f"- Origin Period: {af.period_origin}\n"
                f"- Preservation Status: {af.preservation_status}\n"
                f"- Summary: {af.summary}\n"
                f"- Historical Context: {af.historical_context}\n"
                f"- Ritual/Sacred Context: {af.ritual_context}\n"
                f"- Canonical Motifs: {motifs_desc}\n"
                f"- Traditional Materials: {materials_desc}\n"
                f"- Verified Sources: {json.dumps(af.sources or [])}\n"
            )

        archival_context_str = "\n".join(context_text_blocks)

        system_instruction = (
            "You are the Sanskruti Cultural Intelligence AI, grounded in the Digital Cultural Art Archive of India.\n"
            "STRICT RULES:\n"
            "1. Answer with cultural reverence, scholarly precision, and strict grounding in the provided archival context.\n"
            "2. Distinguish clearly between (A) Verified Archival Knowledge, (B) Community & Practitioner Lineages, and (C) AI Cultural Interpretation.\n"
            "3. State exact traditional materials, motifs, and ritual contexts as documented in the records.\n"
            "4. Do NOT hallucinate dates, unverified legends, or modern commercial reinterpretations as ancient fact.\n"
            "5. Cite the archival monographs or records provided in the context.\n"
            "6. Always maintain the dignity of indigenous artisan communities."
        )

        user_prompt = (
            f"DIGITAL ARCHIVE GROUNDING CONTEXT:\n{archival_context_str}\n\n"
            f"USER INQUIRY:\n{question}\n\n"
            f"Please provide a comprehensive, beautifully structured answer grounded in the archive above. "
            f"Include sections for: Historical Foundation, Iconography & Motifs, Traditional Natural Mediums, and Cultural Significance."
        )

        model_name = settings.GEMINI_MODEL
        answer_text = None

        # Call Gemini API if API key is provided
        if settings.GEMINI_API_KEY:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [
                        {
                            "role": "user",
                            "parts": [{"text": f"{system_instruction}\n\n{user_prompt}"}]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.2,
                        "maxOutputTokens": 1500,
                    }
                }
                async with httpx.AsyncClient(timeout=20.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts:
                                answer_text = parts[0].get("text")
                    else:
                        logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.error(f"Error invoking Gemini API: {e}")

        # Intelligent Archival Grounding Synthesizer (Fallback / Offline Archival Engine)
        if not answer_text:
            primary_af = art_forms[0] if art_forms else None
            if primary_af:
                motifs_list = primary_af.canonical_motifs or []
                materials_list = primary_af.traditional_materials or []
                
                motifs_formatted = "\n".join([f"• **{m.get('name')}**: {m.get('symbolism')} — *Visual Cue:* {m.get('visual_cue')}" for m in motifs_list[:4]])
                materials_formatted = "\n".join([f"• **{mat.get('name')}** ({mat.get('category')}): Sourced from {mat.get('natural_source')}. {mat.get('preparation', '')}" for mat in materials_list[:4]])
                
                answer_text = (
                    f"### Archival Synthesis: {primary_af.name} ({primary_af.native_name or ''})\n\n"
                    f"**Historical & Geographic Foundation:**\n"
                    f"{primary_af.historical_context}\n\n"
                    f"**Sacred & Ritual Significance:**\n"
                    f"{primary_af.ritual_context}\n\n"
                    f"**Canonical Iconography & Motifs:**\n"
                    f"{motifs_formatted if motifs_formatted else 'Structured motifs preserved in the primary dossier.'}\n\n"
                    f"**Traditional Natural Materials & Mediums:**\n"
                    f"{materials_formatted if materials_formatted else 'Organic mineral and plant pigments documented in register.'}\n\n"
                    f"**Preservation Status & Lineage:**\n"
                    f"Currently cataloged as **{primary_af.preservation_status}** across {', '.join(primary_af.states or [primary_af.region])}. "
                    f"Practiced primarily by {', '.join(primary_af.practitioner_communities or ['traditional artisan guilds'])}.\n\n"
                    f"*(Response compiled directly from verified archival records. Set GEMINI_API_KEY in backend environment to activate live Gemini LLM generation.)*"
                )
                model_name = "Sanskruti Archival RAG Engine (Active DB Grounding)"

        # Log query to DB
        try:
            log_entry = AIQueryLog(
                art_form_id=art_forms[0].id if art_forms else None,
                question=question,
                answer=answer_text,
                retrieved_art_form_slugs=[af.slug for af in art_forms],
                retrieved_artifact_ids=[a.id for a in artifacts],
                cited_sources=[c.model_dump() for c in citations[:6]],
                information_layer=InformationLayer.AI_INTERPRETATION.value,
                model_name=model_name
            )
            db.add(log_entry)
            db.commit()
        except Exception as e:
            logger.warning(f"Could not persist AI query log: {e}")
            db.rollback()

        return AskSanskrutiResponse(
            question=question,
            answer=answer_text,
            information_layer=InformationLayer.AI_INTERPRETATION.value,
            model_used=model_name,
            is_grounded=True,
            context_art_form=art_forms[0].name if art_forms else None,
            sources_cited=citations[:6],
            grounded_artifacts=grounded_artifacts,
        )

    @classmethod
    async def interpret_motif(
        cls,
        db: Session,
        motif_name: str,
        art_form_slug: str
    ) -> MotifInsightResponse:
        af = db.query(ArtForm).filter(ArtForm.slug == art_form_slug).first()
        if not af:
            raise ValueError(f"Art form '{art_form_slug}' not found in archive.")

        # Match motif
        matched = None
        for m in (af.canonical_motifs or []):
            if m.get("name", "").lower() == motif_name.lower():
                matched = m
                break

        if not matched:
            symbolism = f"Canonical motif associated with {af.name} expressing cosmic order and ritual auspiciousness."
            ritual_purpose = f"Invoked during traditional community ceremonies in {af.region}."
            visual_cues = ["Linear symmetry", "Geometric rhythm", "Traditional pigment application"]
        else:
            symbolism = matched.get("symbolism", "")
            ritual_purpose = matched.get("cultural_meaning", f"Sacred icon of {af.name} tradition.")
            visual_cues = [matched.get("visual_cue", "")]

        citations = [
            SourceCitation(
                title=s.get("title", f"Archival Dossier: {af.name}"),
                author=s.get("author", "Sanskruti Archival Board"),
                year=str(s.get("year", "Historical")),
                archive_institution=s.get("archive_institution", "National Crafts Archive"),
                layer=InformationLayer.VERIFIED.value
            )
            for s in (af.sources or [])[:3]
        ]

        return MotifInsightResponse(
            motif_name=motif_name,
            art_form_name=af.name,
            traditional_symbolism=symbolism,
            sacred_ritual_purpose=ritual_purpose,
            geometric_and_natural_cues=visual_cues,
            information_layer=InformationLayer.AI_INTERPRETATION.value,
            sources_cited=citations
        )
