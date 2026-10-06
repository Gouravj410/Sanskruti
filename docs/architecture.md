# Sanskruti System Architecture

## 1. Architectural Philosophy
Sanskriti is designed according to the principle:
```
DIGITAL ARCHIVE
      ↓
STRUCTURED CULTURAL KNOWLEDGE
      ↓
SEARCH / DISCOVERY / EXPLORATION
      ↓
AI INTELLIGENCE LAYER
```

The platform's primary duty is cultural preservation. The archive remains completely functional and informative even if all AI components are disconnected.

## 2. Monorepo Organization
- `backend/`: FastAPI Python application
  - `app/api/v1/`: Endpoints for art forms, artifacts, search, practitioners, AI, stats, and media.
  - `app/core/`: Configuration and settings.
  - `app/database/`: SQLAlchemy engine and session management.
  - `app/models/`: Declarative models for ArtForm, Artifact, PractitionerEntry, AIQueryLog.
  - `app/schemas/`: Pydantic request/response validation schemas.
  - `app/services/`: Media storage abstraction (`LocalStorageService`) and `AIService` (Gemini RAG & Archival Synthesis).
  - `app/repositories/`: Query logic for multi-faceted search, layer filtering, and stats.
- `database/`: Database seeding scripts and migrations.
- `frontend/`: React 18, Vite, TypeScript, Tailwind CSS
  - `src/components/common/`: Reusable components (`LayerBadge`, `PreservationBadge`, `Navbar`, `Footer`, `ArtFormCard`, `ArtifactCard`).
  - `src/pages/`: Page views (`HomePage`, `ExplorePage`, `ArtFormDetailPage`, `ArtifactDetailPage`, `AskSanskrutiPage`, `ContributePage`, `AboutPage`).
  - `src/services/api.ts`: API client connecting to FastAPI backend with proxy configuration.

## 3. Extensibility
The system is data-driven. New art forms, canonical motifs, traditional pigments, and artifacts can be ingested without any code modifications.
