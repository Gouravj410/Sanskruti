# Sanskruti System Architecture

## 1. Architectural Philosophy
Sanskriti is designed according to the archive-first principle:
```
DIGITAL ARCHIVE (PostgreSQL / SQLAlchemy)
      ↓
STRUCTURED CULTURAL KNOWLEDGE & CANONICAL MOTIFS
      ↓
SEARCH / DISCOVERY / EXPLORATION
      ↓
CURATOR EDITORIAL DESK & GOVERNANCE
      ↓
AI INTELLIGENCE LAYER (Optional & Non-blocking)
```

The platform's primary duty is cultural preservation. The archive remains completely functional and authoritative even if all AI components are disconnected.

## 2. Monorepo Organization
- `backend/`: FastAPI Python full-stack backend
  - `alembic/`: Reproducible, versioned database migrations (`96f84f064bd8_initial_archival_schema.py`).
  - `app/api/v1/`: REST API routers for `art_forms`, `artifacts`, `search` (with canonical motifs), `practitioners`, `curator` editorial desk, `media` upload, `ai`, and `health`.
  - `app/core/`: Configuration (`config.py`) and security boundary (`security.py`).
  - `app/database/`: SQLAlchemy engine, session management, and `get_db` lifecycle.
  - `app/models/`: Declarative models for `ArtForm`, `Artifact`, `PractitionerEntry`, and `AIQueryLog`.
  - `app/schemas/`: Pydantic v2 schemas for request validation and response serialization.
  - `app/repositories/`: Data-access repository layer for multi-faceted search, curation transitions, and layer filtering.
  - `app/services/`: Media storage service (`LocalStorageService`) and `AIService` (Grounded archival synthesis).
  - `tests/`: Comprehensive 23-test pytest suite using isolated in-memory SQLite database.
- `database/`: Idempotent database seeding scripts (`seed_data.py`).
- `frontend/`: React 19, React Router v7, Vite, TypeScript, Tailwind CSS
  - `src/components/common/`: Reusable components (`LayerBadge`, `PreservationBadge`, `Navbar`, `Footer`, `ArtFormCard`, `ArtifactCard`).
  - `src/pages/`: Page views (`HomePage`, `ExplorePage` with fixed Motifs tab, `ArtFormDetailPage`, `ArtifactDetailPage`, `AskSanskrutiPage`, `ContributePage`, `CuratorPage`, `AboutPage`).
  - `src/services/api.ts`: Authoritative API client connecting to FastAPI backend with explicit demo fallback support.
  - `src/tests/`: Node native test runner test suite covering media formatting, key isolation, dataset integrity, and four-layer validation.
- `docker-compose.yml`: Multi-container production deployment linking PostgreSQL 16, FastAPI, and Nginx-served React frontend.

## 3. Data Governance and Epistemic Integrity
- Public submissions to `/api/v1/practitioners` are persisted under `PENDING_REVIEW` and cannot self-publish.
- Only authenticated curators using the server-configured `CURATOR_API_KEY` can approve, publish, reject, or archive entries via `/api/v1/curator/submissions/{id}/review`.
- Uploads to `/api/v1/media/upload` are restricted to authorized curators, enforce 10MB chunked streaming, and verify image byte validity with Pillow before writing unique filenames to persistent storage.
