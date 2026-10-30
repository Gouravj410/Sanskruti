import json
import logging
import re
from typing import Optional, List, Dict, Any
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.art_form import ArtForm
from app.models.artifact import Artifact
from app.models.practitioner import PractitionerEntry
from app.models.ai_log import AIQueryLog
from app.models.enums import InformationLayer
from app.schemas.ai import (
    AskSanskrutiResponse,
    SourceCitation,
    GroundedArtifactRef,
    MotifInsightResponse,
)

logger = logging.getLogger("sanskruti.ai")


class AIService:
    @staticmethod
    def _tokenize(text: str) -> List[str]:
        """Simple alphanumeric tokenizer for lexical relevance ranking."""
        return [w.lower() for w in re.findall(r"\w{3,}", text)]

    @classmethod
    def _build_context_from_db(
        cls,
        db: Session,
        question: str,
        art_form_slug: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Multi-Source Hybrid RAG Retrieval Engine:
        Retrieves matching Art Forms, Canonical Motifs, Traditional Materials,
        Cataloged Artifacts (Layer A), and Practitioner Oral Lore (Layer B).
        """
        tokens = set(cls._tokenize(question))
        all_art_forms = db.query(ArtForm).all()

        target_art_forms: List[ArtForm] = []
        matched_motifs: List[Dict[str, Any]] = []
        matched_materials: List[Dict[str, Any]] = []

        # 1. Scope by slug or compute relevance scores across art forms
        if art_form_slug:
            primary = db.query(ArtForm).filter(ArtForm.slug == art_form_slug).first()
            if primary:
                target_art_forms.append(primary)

        # Lexical score ranking across all art forms
        af_scores = []
        for af in all_art_forms:
            score = 0
            name_lower = af.name.lower()
            slug_lower = af.slug.lower()
            region_lower = af.region.lower()
            
            # Direct name/slug match in query
            if slug_lower in question.lower() or name_lower in question.lower():
                score += 25
            if region_lower in question.lower():
                score += 10
            
            # Motif matches
            for m in (af.canonical_motifs or []):
                m_name = m.get("name", "").lower()
                m_sym = m.get("symbolism", "").lower()
                m_cue = m.get("visual_cue", "").lower()
                
                # Check for direct phrase or token match
                if m_name and m_name in question.lower():
                    score += 20
                    matched_motifs.append({**m, "art_form_name": af.name, "art_form_slug": af.slug})
                elif any(t in m_name or t in m_sym for t in tokens):
                    score += 5
                    if m not in matched_motifs:
                        matched_motifs.append({**m, "art_form_name": af.name, "art_form_slug": af.slug})

            # Material matches
            for mat in (af.traditional_materials or []):
                mat_name = mat.get("name", "").lower()
                mat_source = mat.get("natural_source", "").lower()
                if mat_name and (mat_name in question.lower() or any(t in mat_name for t in tokens)):
                    score += 15
                    matched_materials.append({**mat, "art_form_name": af.name, "art_form_slug": af.slug})
                elif any(t in mat_source for t in tokens):
                    score += 5

            af_scores.append((score, af))

        af_scores.sort(key=lambda x: x[0], reverse=True)

        # Merge top scored art forms
        for sc, af in af_scores:
            if sc > 0 and af not in target_art_forms:
                target_art_forms.append(af)
            if len(target_art_forms) >= 3:
                break

        # Fallback to top 2 general art forms if zero match
        if not target_art_forms:
            target_art_forms = all_art_forms[:2]

        # 2. Retrieve Layer A Artifacts
        target_af_ids = [af.id for af in target_art_forms]
        target_artifacts = (
            db.query(Artifact)
            .filter(
                Artifact.art_form_id.in_(target_af_ids),
                Artifact.information_layer == InformationLayer.VERIFIED.value
            )
            .limit(6)
            .all()
        )

        # Also search artifacts by query tokens if results are few
        if len(target_artifacts) < 4:
            extra_artifacts = (
                db.query(Artifact)
                .filter(Artifact.information_layer == InformationLayer.VERIFIED.value)
                .limit(20)
                .all()
            )
            for art in extra_artifacts:
                art_text = f"{art.title} {art.medium} {art.description or ''}".lower()
                if any(t in art_text for t in tokens) and art not in target_artifacts:
                    target_artifacts.append(art)
                if len(target_artifacts) >= 6:
                    break

        # 3. Retrieve Layer B Practitioner Wisdom & Oral Traditions
        practitioner_entries = (
            db.query(PractitionerEntry)
            .filter(PractitionerEntry.art_form_id.in_(target_af_ids))
            .limit(4)
            .all()
        )
        # Search specifically for oral lore keywords (e.g. jaggery, ferment, ritual, steps)
        oral_entries = []
        for p in practitioner_entries:
            p_text = f"{p.title} {p.content}".lower()
            if any(t in p_text for t in tokens) or len(oral_entries) < 2:
                oral_entries.append(p)

        # 4. Extract verified source citations
        citations: List[SourceCitation] = []
        seen_titles = set()
        for af in target_art_forms:
            for s in (af.sources or []):
                t = s.get("title", f"Archival Record for {af.name}")
                if t not in seen_titles:
                    seen_titles.add(t)
                    citations.append(SourceCitation(
                        title=t,
                        author=s.get("author", "Sanskruti Archival Board"),
                        year=str(s.get("year", "Historical Record")),
                        archive_institution=s.get("archive_institution", "National Crafts Museum"),
                        citation_type=s.get("citation_type", "Archival Monograph"),
                        layer=InformationLayer.VERIFIED.value
                    ))

        return {
            "art_forms": target_art_forms,
            "artifacts": target_artifacts,
            "motifs": matched_motifs[:6],
            "materials": matched_materials[:6],
            "practitioners": oral_entries,
            "citations": citations[:8]
        }

    @classmethod
    async def ask_sanskruti(
        cls,
        db: Session,
        question: str,
        art_form_slug: Optional[str] = None,
        gemini_api_key: Optional[str] = None
    ) -> AskSanskrutiResponse:
        """
        Executes real Retrieval-Augmented Generation (RAG):
        1. Retrieves multi-layer archival context from database.
        2. Prompts Google Gemini API if a key is provided (request key or backend env).
        3. Falls back gracefully to intelligent deterministic archival grounding synthesis.
        4. Logs the query and persists epistemic audit metadata.
        """
        context_data = cls._build_context_from_db(db, question, art_form_slug)
        art_forms: List[ArtForm] = context_data["art_forms"]
        artifacts: List[Artifact] = context_data["artifacts"]
        matched_motifs = context_data["motifs"]
        matched_materials = context_data["materials"]
        practitioners: List[PractitionerEntry] = context_data["practitioners"]
        citations: List[SourceCitation] = context_data["citations"]

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

        # Prepare rich grounding context string for LLM prompt
        context_blocks = []
        for af in art_forms:
            motifs_desc = ", ".join([f"{m.get('name')} (Symbolism: {m.get('symbolism')}, Visual Cue: {m.get('visual_cue')})" for m in (af.canonical_motifs or [])[:5]])
            materials_desc = ", ".join([f"{mat.get('name')} (Source: {mat.get('natural_source')}, Prep: {mat.get('preparation', 'Traditional')})" for mat in (af.traditional_materials or [])[:5]])
            
            block = (
                f"### [LAYER A] TRADITION: {af.name} ({af.native_name or ''})\n"
                f"- Region & Geographic Hub: {af.region} ({', '.join(af.states or [])})\n"
                f"- Origin Period: {af.period_origin}\n"
                f"- Preservation Status: {af.preservation_status}\n"
                f"- Historical Foundation: {af.historical_context}\n"
                f"- Sacred & Ritual Context: {af.ritual_context}\n"
                f"- Canonical Motifs: {motifs_desc}\n"
                f"- Traditional Materials: {materials_desc}\n"
            )
            context_blocks.append(block)

        # Add Practitioner Lore (Layer B)
        for p in practitioners:
            context_blocks.append(
                f"### [LAYER B: COMMUNITY PRACTITIONER ORAL TRADITION]\n"
                f"- Contributor: {p.contributor_name} ({p.role_or_title}, {p.community_affiliation}, {p.location})\n"
                f"- Lineage: {p.lineage_tradition or 'Hereditary Guru-Shishya'}\n"
                f"- Oral Lore Title: {p.title}\n"
                f"- Verified Content: {p.content}\n"
            )

        # Add Accessioned Artifacts (Layer A)
        for art in artifacts[:4]:
            context_blocks.append(
                f"### [LAYER A: VERIFIED CATALOGED ARTIFACT #{art.accession_number}]\n"
                f"- Title: {art.title} ({art.period_estimated})\n"
                f"- Artist Attribution: {art.artist_attribution}\n"
                f"- Medium & Surface: {art.medium}\n"
                f"- Materials: {', '.join(art.materials_used or [])}\n"
                f"- Iconography: {art.iconography_analysis or art.description}\n"
                f"- Verification Source: {art.verification_source}\n"
            )

        archival_context_str = "\n".join(context_blocks)

        system_instruction = (
            "You are the Sanskriti Cultural Intelligence AI, an authoritative, reverent archival research system.\n"
            "STRICT EPISTEMIC RULES:\n"
            "1. Ground every claim directly in the provided Digital Archive Context.\n"
            "2. Distinguish clearly between [Layer A: Verified Archival Records] and [Layer B: Practitioner Oral Knowledge].\n"
            "3. Quote specific traditional materials (e.g. fermented iron in jaggery water, alum mordants, rice paste), motifs, and accession numbers.\n"
            "4. Structure your response into elegant, readable sections with clear markdown headings.\n"
            "5. Cite the archival monographs or museum records at the conclusion.\n"
            "6. Never fabricate dates or commercial reinterpretations."
        )

        user_prompt = (
            f"DIGITAL ARCHIVE GROUNDING CONTEXT:\n{archival_context_str}\n\n"
            f"SCHOLARLY INQUIRY:\n{question}\n\n"
            f"Please synthesize a comprehensive, culturally dignified, and strictly grounded answer."
        )

        active_key = gemini_api_key or settings.GEMINI_API_KEY
        answer_text = None
        model_used = "Sanskruti Archival RAG Grounding Engine (Active DB)"

        # 1. Attempt Live Gemini API if key is present
        if active_key:
            candidate_models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"]
            for test_model in candidate_models:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{test_model}:generateContent?key={active_key}"
                    payload = {
                        "contents": [
                            {
                                "role": "user",
                                "parts": [{"text": f"{system_instruction}\n\n{user_prompt}"}]
                            }
                        ],
                        "generationConfig": {
                            "temperature": 0.2,
                            "maxOutputTokens": 2048,
                        }
                    }
                    async with httpx.AsyncClient(timeout=25.0) as client:
                        resp = await client.post(url, json=payload)
                        if resp.status_code == 200:
                            data = resp.json()
                            candidates = data.get("candidates", [])
                            if candidates:
                                parts = candidates[0].get("content", {}).get("parts", [])
                                if parts:
                                    answer_text = parts[0].get("text")
                                    model_used = f"Google {test_model.replace('-', ' ').title()} (Grounded RAG)"
                                    break
                        else:
                            logger.warning(f"Gemini model {test_model} returned {resp.status_code}: {resp.text[:120]}")
                except Exception as ex:
                    logger.warning(f"Error calling Gemini model {test_model}: {ex}")

        # 2. Intelligent Deterministic Archival Grounding Synthesizer (Fallback / Offline Engine)
        if not answer_text:
            primary_af = art_forms[0] if art_forms else None
            
            # Format motifs
            motifs_list = matched_motifs if matched_motifs else (primary_af.canonical_motifs if primary_af else [])
            motifs_formatted = "\n".join([
                f"• **{m.get('name')}**: {m.get('symbolism')} — *Visual Archetype:* {m.get('visual_cue')}"
                for m in motifs_list[:4]
            ])

            # Format materials
            materials_list = matched_materials if matched_materials else (primary_af.traditional_materials if primary_af else [])
            materials_formatted = "\n".join([
                f"• **{mat.get('name')}** ({mat.get('category', 'Organic')}): Sourced from {mat.get('natural_source')}. *Preparation Method:* {mat.get('preparation', 'Hereditary guild technique')}"
                for mat in materials_list[:4]
            ])

            # Format practitioner oral lore
            practitioner_section = ""
            if practitioners:
                p_items = []
                for p in practitioners[:2]:
                    p_items.append(
                        f"• **{p.title}** (Contributed by {p.contributor_name}, *{p.role_or_title}*, {p.location}):\n"
                        f"  \"{p.content}\""
                    )
                practitioner_section = (
                    f"### 🪔 Practitioner Lineage & Oral Knowledge (Layer B)\n"
                    + "\n\n".join(p_items)
                    + "\n\n"
                )

            # Format referenced artifacts
            artifact_refs = ""
            if artifacts:
                art_lines = [
                    f"• **{a.title}** (Accession ID: `{a.accession_number}`) — *Attribution:* {a.artist_attribution}, *Surface:* {a.medium}. Source: {a.verification_source}"
                    for a in artifacts[:3]
                ]
                artifact_refs = (
                    f"### 🏛️ Verified Archival Records & Accessions (Layer A)\n"
                    + "\n".join(art_lines)
                    + "\n\n"
                )

            af_name = primary_af.name if primary_af else "Traditional Indian Cultural Heritage"
            af_native = f" ({primary_af.native_name})" if primary_af and primary_af.native_name else ""
            af_region = primary_af.region if primary_af else "Pan-Indian Heritage"
            af_history = primary_af.historical_context if primary_af else "Ancient cultural tradition preserved in regional archives."
            af_ritual = primary_af.ritual_context if primary_af else "Integral to communal ceremonies and spiritual cosmology."

            answer_text = (
                f"## Archival Research Synthesis: {af_name}{af_native}\n\n"
                f"### 📜 Historical Foundation & Provenance\n"
                f"{af_history}\n\n"
                f"Geographic provenance centers on **{af_region}**, documented across regional surveys and national museum collections.\n\n"
                f"### ✨ Sacred Iconography & Symbolic Deconstruction\n"
                f"{motifs_formatted if motifs_formatted else 'Canonical motifs are preserved in the structured archival database registry.'}\n\n"
                f"### 🌿 Natural Pigment Chemistry & Traditional Mediums\n"
                f"{materials_formatted if materials_formatted else 'Natural mineral ores, plant resins, and organic mordants cataloged in registry.'}\n\n"
                f"{practitioner_section}"
                f"### 📿 Ritual Significance & Sacred Performance\n"
                f"{af_ritual}\n\n"
                f"{artifact_refs}"
                f"---\n"
                f"*(Synthesized in real-time by the Sanskriti Archival RAG Grounding Engine utilizing active database records. "
                f"To enable live neural cloud generation, provide your Gemini API key in the AI console settings.)*"
            )

        # 3. Persist AI Query Log for auditability
        try:
            log_entry = AIQueryLog(
                art_form_id=art_forms[0].id if art_forms else None,
                question=question,
                answer=answer_text,
                retrieved_art_form_slugs=[af.slug for af in art_forms],
                retrieved_artifact_ids=[a.id for a in artifacts],
                cited_sources=[c.model_dump() for c in citations[:6]],
                information_layer=InformationLayer.AI_INTERPRETATION.value,
                model_name=model_used
            )
            db.add(log_entry)
            db.commit()
        except Exception as log_ex:
            logger.warning(f"Could not persist AI query log: {log_ex}")
            db.rollback()

        grounding_stats = {
            "art_forms_matched": len(art_forms),
            "artifacts_retrieved": len(artifacts),
            "motifs_retrieved": len(matched_motifs),
            "materials_retrieved": len(matched_materials),
            "practitioner_records": len(practitioners),
            "sources_cited_count": len(citations),
            "retrieval_method": "Multi-Source Hybrid Archival RAG"
        }

        return AskSanskrutiResponse(
            question=question,
            answer=answer_text,
            information_layer=InformationLayer.AI_INTERPRETATION.value,
            model_used=model_used,
            is_grounded=True,
            context_art_form=art_forms[0].name if art_forms else None,
            sources_cited=citations[:6],
            grounded_artifacts=grounded_artifacts,
            retrieved_motifs=matched_motifs[:6],
            retrieved_materials=matched_materials[:6],
            grounding_stats=grounding_stats,
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
