from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.repositories.archive_repo import ArchiveRepository
from app.schemas.art_form import ArtFormSummary
from app.schemas.artifact import ArtifactSummary
from app.models.art_form import ArtForm

router = APIRouter(prefix="/search", tags=["Archive Search"])

@router.get("/motifs")
def list_canonical_motifs(
    search: Optional[str] = Query(None, description="Search keyword in motif names, symbolism, or visual cues"),
    art_form_slug: Optional[str] = Query(None, description="Filter by art form slug"),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    query = db.query(ArtForm)
    if art_form_slug:
        query = query.filter(ArtForm.slug == art_form_slug)
    
    results = []
    term = search.lower().strip() if search else ""
    for af in query.all():
        for m in (af.canonical_motifs or []):
            name = m.get("name", "")
            symbolism = m.get("symbolism", "")
            visual_cue = m.get("visual_cue", "")
            cultural_meaning = m.get("cultural_meaning", "")
            if not term or (
                term in name.lower() or 
                term in symbolism.lower() or 
                term in visual_cue.lower() or 
                term in cultural_meaning.lower()
            ):
                results.append({
                    "id": f"{af.slug}-{len(results)}",
                    "name": name,
                    "symbolism": symbolism,
                    "visual_cue": visual_cue,
                    "cultural_meaning": cultural_meaning or symbolism,
                    "motif": m,
                    "art_form_slug": af.slug,
                    "art_form_name": af.name,
                    "region": af.region,
                    "sources": af.sources or []
                })
    return results

@router.get("")
def search_archive(
    q: str = Query("", description="Search query string"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    if len(q.strip()) < 2:
        art_forms = db.query(ArtForm).all()
        return {
            "query": q,
            "counts": {"art_forms": len(art_forms), "artifacts": 0, "motifs": 0},
            "art_forms": [ArtFormSummary.model_validate(af) for af in art_forms],
            "artifacts": [],
            "motifs": []
        }

    raw_results = ArchiveRepository.search_multi_facet(db, q)
    
    art_forms_out = []
    for af in raw_results["art_forms"]:
        item = ArtFormSummary.model_validate(af)
        item.artifact_count = len(af.artifacts)
        art_forms_out.append(item)

    artifacts_out = []
    for art in raw_results["artifacts"]:
        summary = ArtifactSummary.model_validate(art)
        if art.art_form:
            summary.art_form_name = art.art_form.name
            summary.art_form_slug = art.art_form.slug
        artifacts_out.append(summary)

    return {
        "query": q,
        "counts": {
            "art_forms": len(art_forms_out),
            "artifacts": len(artifacts_out),
            "motifs": len(raw_results["motifs"]),
        },
        "art_forms": art_forms_out,
        "artifacts": artifacts_out,
        "motifs": raw_results["motifs"]
    }
