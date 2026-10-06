# SANSKRUTI: Digital Cultural Art Archive & AI Intelligence Platform

[![Deploy Sanskruti to GitHub Pages](https://github.com/Gouravj410/Sanskruti/actions/workflows/deploy.yml/badge.svg)](https://github.com/Gouravj410/Sanskruti/actions/workflows/deploy.yml)

🌐 **Live Deployed Archive**: [https://gouravj410.github.io/Sanskruti/](https://gouravj410.github.io/Sanskruti/)

Sanskriti is a digital archival platform built to preserve traditional Indian visual art forms and make their cultural knowledge accessible, discoverable, and understandable.

---

## 🏛️ Core Architectural Principle

```
DIGITAL ARCHIVE
      ↓
STRUCTURED CULTURAL KNOWLEDGE
      ↓
SEARCH / DISCOVERY / EXPLORATION
      ↓
AI INTELLIGENCE LAYER
```

The platform's primary duty is cultural preservation. The archive remains completely functional even if all AI components are disconnected.

---

## 🏷️ The Four Information Layers

Sanskriti maintains strict epistemic separation between four categories of knowledge:

1. **Layer A — Verified Archival Knowledge**: Academic monographs, peer-reviewed surveys, and national museum accessions (IGNCA, National Crafts Museum, Calico Museum of Textiles).
2. **Layer B — Practitioner Knowledge**: Oral lore, hereditary recipes, and ritual rules contributed by living master artisans.
3. **Layer C — AI Interpretation**: AI intelligence grounded in the archive with mandatory academic citations.
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
  - React 18
  - Vite
  - TypeScript
  - Tailwind CSS (Rich cultural terracotta, temple indigo, and ochre gold theme)
  - React Router v6
  - Lucide React
- **Backend**:
  - Python 3.12
  - FastAPI
  - Pydantic v2
  - SQLAlchemy 2.0
  - PostgreSQL / SQLite compatibility
- **AI Intelligence**:
  - Google Gemini API (with Archival RAG Grounding Engine)
- **Media Storage**:
  - Clean abstraction (`LocalStorageService` for development, extensible to S3/Cloud)

---

## 🚀 Running Locally

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

pip install -r requirements.txt
```

### 3. Seed Database with Archival Records
```bash
# From workspace root:
python database/seed/seed_data.py
```

### 4. Start Backend Server
```bash
cd backend
uvicorn app.main:app --port 8000 --reload
```
API Documentation will be accessible at: `http://localhost:8000/docs`

### 5. Frontend Setup & Launch
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Verified User Flow

1. **Home (`/`)**: Regal cultural entrance with 4-layer explainer, live metrics, and featured art forms.
2. **Explore (`/explore`)**: Search across art forms, canonical motifs, and artifacts with multi-layer filtering.
3. **Dossier (`/art-forms/:slug`)**: Complete digital archival dossier with historical foundation, sacred ritual context, canonical motifs, natural materials, and verified artifacts.
4. **Artifact Sheet (`/artifacts/:id`)**: High-resolution viewer, accession number, verified provenance, and iconography analysis.
5. **Ask Sanskruti (`/ask`)**: Grounded AI cultural intelligence consultation with primary source citations.
6. **Community Desk (`/contribute`)**: Oral history and practitioner knowledge contribution portal.
7. **Manifesto (`/about`)**: Detailed breakdown of the 4 knowledge layers and architectural principles.

---

## 🌐 Deployment

### GitHub Pages (Frontend Live Deployment)
- **Live URL**: [https://gouravj410.github.io/Sanskruti/](https://gouravj410.github.io/Sanskruti/)
- **Workflow**: Automated CI/CD pipeline via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
- Built with high-performance Vite + React + Tailwind CSS with offline-resilient archival knowledge caching and GitHub Pages SPA routing fallback.

### Containerized Full-Stack Deployment (Docker)
To launch both frontend and backend using Docker Compose:
```bash
docker-compose up --build
```
