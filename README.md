# SANSKRUTI: Digital Cultural Art Archive & Full-Stack Heritage Platform

[![CI Quality Gate](https://github.com/Gouravj410/Sanskruti/actions/workflows/ci.yml/badge.svg)](https://github.com/Gouravj410/Sanskruti/actions/workflows/ci.yml)

Sanskriti is an archive-first digital cultural heritage platform built to preserve, organize, document, and present traditional Indian visual art forms and indigenous cultural knowledge systems through an authoritative, database-backed digital archive.

---

## 🏛️ Core Architectural Principle

```
DIGITAL ARCHIVE (PostgreSQL / SQLAlchemy)
      ↓
STRUCTURED CULTURAL KNOWLEDGE & PROVENANCE
      ↓
SEARCH / DISCOVERY / CANONICAL MOTIFS
      ↓
CURATOR EDITORIAL DESK & GOVERNANCE
      ↓
AI INTELLIGENCE LAYER (Optional & Non-blocking)
```

The platform's primary duty is cultural preservation. The archive remains completely functional without any AI service connected.

---

## 🏷️ The Four Information Layers

Sanskriti maintains strict epistemic separation between four categories of knowledge:

1. **Layer A — Verified Archival Knowledge**: Academic monographs, peer-reviewed surveys, and national museum accessions (IGNCA, National Crafts Museum, Calico Museum of Textiles).
2. **Layer B — Practitioner Knowledge**: Oral lore, hereditary recipes, and ritual rules contributed by living master artisans, vetted by authorized curators.
3. **Layer C — AI Interpretation**: AI intelligence grounded in the archive with mandatory academic citations, routed exclusively server-side.
4. **Layer D — AI Creative Content**: Generative algorithmic experiments, explicitly demarcated from authentic artifacts.

---

## 🎨 Initial Traditional Art Forms Cataloged

1. **Kolam** (Tamil Nadu, Karnataka, Andhra Pradesh, Kerala) — Sacred geometric floor drawings and infinite knot theory.
2. **Warli** (Maharashtra, Gujarat) — Indigenous animistic wall murals of the Sahyadri range.
3. **Madhubani / Mithila** (Bihar, Jharkhand) — Folk narrative paintings, bridal Kohbar mandalas, and natural pigments.
4. **Mandana** (Rajasthan, Madhya Pradesh) — Architectural hearth and threshold floor art of the Meena community.
5. **Gond** (Madhya Pradesh, Chhattisgarh) — Bardic narrative art with signature dot and line textures (*Jangarh Kalam*).
6. **Pattachitra** (Odisha) — Classical cloth scroll painting from the temple of Lord Jagannath in Puri.
7. **Kalamkari** (Andhra Pradesh, Telangana) — Hand-drawn bamboo reed pen narrative textiles with 23-stage organic resist dyeing.
8. **Phad** (Rajasthan) — 30-foot portable mobile cloth temple scrolls recited nocturnally by Bhopa-Bhopi priest-bards.

---

## 💻 Technology Stack

- **Frontend**:
  - React 19 (`^19.2.8`)
  - React Router v7 (`^7.18.4`)
  - Vite (`^8.3.0`)
  - TypeScript (`~6.0.2`)
  - Tailwind CSS (`^3.4.17`)
  - Lucide React
  - Node.js native test runner
- **Backend**:
  - Python 3.10+ / 3.12
  - FastAPI (`^0.111.0`)
  - SQLAlchemy 2.0 (`^2.0.30`)
  - Alembic (`^1.13.3`) for schema migrations
  - PostgreSQL (Production) / SQLite (Local development)
  - Pillow (`^10.4.0`) for cryptographic and image format validation
  - Pytest (`^8.3.3`) test suite
- **Media & Storage**:
  - Authenticated curator media upload with 10MB chunked streaming and PIL decoding verification
  - Extensible storage abstraction (`LocalStorageService` for local dev/Docker, extensible to S3/GCS)
- **AI Intelligence**:
  - Google Gemini API (Server-side routed; completely non-blocking)
  - Sanskriti Archival Grounding Synthesizer (graceful offline fallback)

---

## 🚀 Running the Project

### ⭐ Quick Start (Single Command — Works on Any Computer)

You only need to run **one command** from the project root:

```bash
python run.py
```

This single command will automatically:
1. Verify Python & Node.js/npm are available.
2. Auto-install missing backend packages from `backend/requirements.txt`.
3. Apply database migrations & seed initial archive data if running for the first time.
4. Auto-install frontend npm dependencies if `node_modules` is missing.
5. Start the FastAPI backend on port 8000.
6. Start the Vite React frontend on port 5173.
7. Open `http://localhost:5173` automatically in your browser.
8. Cleanly stop both servers when you press `Ctrl+C`.

---

### 🛠️ Manual Step-by-Step Setup (Alternative)

#### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Environment Configuration
Copy `.env.example` to create your local environment:
```bash
cp .env.example backend/.env
```

Key environment variables:
- `DATABASE_URL`: `sqlite:///./sanskruti.db` (local) or `postgresql://user:pass@localhost:5432/sanskruti` (production)
- `CURATOR_API_KEY`: Secret passphrase for authorized curator operations
- `CORS_ORIGINS`: JSON array of allowed origins (e.g. `["http://localhost:5173", "http://localhost:8000"]`)
- `GEMINI_API_KEY`: (Optional) Server-side Gemini API key for dynamic generation

### 3. Backend Setup & Database Migration
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

pip install -r requirements.txt

# Run Alembic migrations:
alembic upgrade head
```

### 4. Seed Archival Data (Idempotent)
```bash
# From repository root:
python database/seed/seed_data.py
```
This idempotently populates all 8 Art Forms, 14 Cataloged Artifacts, and 3 Practitioner entries mapped to authentic local image assets.

### 5. Launch Backend
```bash
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger API Documentation: `http://localhost:8000/docs`  
Health check endpoint: `http://localhost:8000/api/v1/health`

### 6. Frontend Setup & Launch
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Automated Testing

### Backend Pytest Suite (23 tests)
```bash
pytest backend/tests/ -v
```
Covers: health checks, art forms, artifacts, multi-facet search, canonical motifs discovery, public submission defaults, unauthorized write protection, curator review workflows, and Pillow media security.

### Frontend Quality Gate & Build
```bash
cd frontend
npm test
npm run lint
npm run build
```

---

## 🛡️ Curation & Security Model

1. **Content Governance**: Public submissions via `/contribute` are automatically assigned `PENDING_REVIEW` and cannot self-publish.
2. **Curator Editorial Desk (`/curator`)**: Requires the server-configured `CURATOR_API_KEY` to review, approve, publish, reject, or archive community submissions.
3. **Protected Writes**: Art form, artifact, curation, and media upload endpoints enforce server-side authentication.
4. **Media Validation**: Uploaded media must pass 10MB chunked size limits, MIME checks, and Pillow image decode verification.
5. **No Client-Side AI Keys**: Google Gemini API keys are never stored in browser `localStorage`. Inquiries route strictly through the backend.

---

## 🐳 Containerized Full-Stack Deployment (Docker)

To launch the complete PostgreSQL database, FastAPI backend, and Nginx-served React frontend:
```bash
docker-compose up --build
```
Services initialized:
- `db`: PostgreSQL 16 on port 5432 with health check
- `backend`: FastAPI on port 8000 with volume-mounted media storage
- `frontend`: React SPA on port 5173 via Nginx with `/api/` and `/media/` reverse proxy
