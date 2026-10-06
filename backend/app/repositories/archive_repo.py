from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.art_form import ArtForm
from app.models.artifact import Artifact
from app.models.practitioner import PractitionerEntry
from app.models.ai_log import AIQueryLog
from app.models.enums import InformationLayer, VerificationStatus

class ArchiveRepository:
    @staticmethod
    def get_art_forms(
        db: Session,
        region: Optional[str] = None,
        state: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[ArtForm]:
        query = db.query(ArtForm)
        
        if region:
            query = query.filter(ArtForm.region.ilike(f"%{region}%"))
        if status:
            query = query.filter(ArtForm.preservation_status == status)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    ArtForm.name.ilike(search_term),
                    ArtForm.native_name.ilike(search_term),
                    ArtForm.summary.ilike(search_term),
                    ArtForm.region.ilike(search_term),
                )
            )
        
        art_forms = query.all()
        if state:
            art_forms = [af for af in art_forms if any(state.lower() in s.lower() for s in af.states)]
            
        return art_forms

    @staticmethod
    def get_art_form_by_slug(db: Session, slug: str) -> Optional[ArtForm]:
        return db.query(ArtForm).filter(ArtForm.slug == slug).first()

    @staticmethod
    def get_art_form_by_id(db: Session, art_form_id: int) -> Optional[ArtForm]:
        return db.query(ArtForm).filter(ArtForm.id == art_form_id).first()

    @staticmethod
    def get_artifacts(
        db: Session,
        art_form_id: Optional[int] = None,
        art_form_slug: Optional[str] = None,
        layer: Optional[str] = None,
        is_featured: Optional[bool] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Artifact]:
        query = db.query(Artifact).join(ArtForm)
        
        if art_form_id:
            query = query.filter(Artifact.art_form_id == art_form_id)
        if art_form_slug:
            query = query.filter(ArtForm.slug == art_form_slug)
        if layer:
            query = query.filter(Artifact.information_layer == layer)
        if is_featured is not None:
            query = query.filter(Artifact.is_featured == is_featured)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Artifact.title.ilike(search_term),
                    Artifact.description.ilike(search_term),
                    Artifact.medium.ilike(search_term),
                    Artifact.artist_attribution.ilike(search_term),
                    Artifact.accession_number.ilike(search_term),
                    Artifact.region_origin.ilike(search_term)
                )
            )
            
        return query.order_by(Artifact.id.desc()).offset(offset).limit(limit).all()

    @staticmethod
    def get_artifact_by_id(db: Session, artifact_id: int) -> Optional[Artifact]:
        return db.query(Artifact).filter(Artifact.id == artifact_id).first()

    @staticmethod
    def get_practitioners(
        db: Session,
        art_form_id: Optional[int] = None,
        art_form_slug: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[PractitionerEntry]:
        query = db.query(PractitionerEntry).join(ArtForm)
        
        if art_form_id:
            query = query.filter(PractitionerEntry.art_form_id == art_form_id)
        if art_form_slug:
            query = query.filter(ArtForm.slug == art_form_slug)
        if status:
            query = query.filter(PractitionerEntry.verification_status == status)
            
        return query.order_by(PractitionerEntry.id.desc()).all()

    @staticmethod
    def create_practitioner_entry(db: Session, entry_data: dict) -> PractitionerEntry:
        entry = PractitionerEntry(**entry_data)
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def search_multi_facet(db: Session, q: str) -> Dict[str, Any]:
        term = f"%{q}%"
        matching_art_forms = db.query(ArtForm).filter(
            or_(
                ArtForm.name.ilike(term),
                ArtForm.native_name.ilike(term),
                ArtForm.summary.ilike(term),
                ArtForm.region.ilike(term),
                ArtForm.historical_context.ilike(term),
            )
        ).all()

        matching_artifacts = db.query(Artifact).filter(
            or_(
                Artifact.title.ilike(term),
                Artifact.description.ilike(term),
                Artifact.medium.ilike(term),
                Artifact.artist_attribution.ilike(term),
                Artifact.accession_number.ilike(term),
            )
        ).limit(20).all()

        # Find matching motifs inside JSON
        matching_motifs = []
        for af in db.query(ArtForm).all():
            for m in (af.canonical_motifs or []):
                name = m.get("name", "")
                symbolism = m.get("symbolism", "")
                if q.lower() in name.lower() or q.lower() in symbolism.lower():
                    matching_motifs.append({
                        "motif": m,
                        "art_form_slug": af.slug,
                        "art_form_name": af.name
                    })

        return {
            "query": q,
            "art_forms": matching_art_forms,
            "artifacts": matching_artifacts,
            "motifs": matching_motifs
        }

    @staticmethod
    def get_archive_stats(db: Session) -> Dict[str, Any]:
        total_art_forms = db.query(func.count(ArtForm.id)).scalar() or 0
        total_artifacts = db.query(func.count(Artifact.id)).scalar() or 0
        total_practitioners = db.query(func.count(PractitionerEntry.id)).scalar() or 0
        
        # Layer breakdown
        verified_count = db.query(func.count(Artifact.id)).filter(Artifact.information_layer == InformationLayer.VERIFIED.value).scalar() or 0
        community_count = db.query(func.count(Artifact.id)).filter(Artifact.information_layer == InformationLayer.COMMUNITY.value).scalar() or 0
        ai_interp_count = db.query(func.count(Artifact.id)).filter(Artifact.information_layer == InformationLayer.AI_INTERPRETATION.value).scalar() or 0
        ai_gen_count = db.query(func.count(Artifact.id)).filter(Artifact.information_layer == InformationLayer.AI_GENERATED.value).scalar() or 0

        # Unique states count & total motifs
        all_forms = db.query(ArtForm).all()
        unique_states = set()
        total_motifs = 0
        categories = {}
        
        for af in all_forms:
            for s in (af.states or []):
                unique_states.add(s)
            total_motifs += len(af.canonical_motifs or [])
            cat = af.category or "Traditional Art"
            categories[cat] = categories.get(cat, 0) + 1

        return {
            "total_art_forms": total_art_forms,
            "total_artifacts": total_artifacts,
            "total_motifs": total_motifs,
            "total_practitioners": total_practitioners,
            "represented_states": len(unique_states),
            "layers": {
                "verified_count": verified_count,
                "community_count": community_count + total_practitioners,
                "ai_interpretation_count": ai_interp_count,
                "ai_generated_count": ai_gen_count,
            },
            "categories": categories
        }
