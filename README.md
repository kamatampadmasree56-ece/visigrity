# VISIGRITY

> **"Integrity Behind Every Vision."**

Trustworthy Computer Vision Integrity & Provenance Platform.

VISIGRITY provides an integrity, provenance, accountability, and audit layer for computer vision pipelines where multiple contributors participate in datasets, model weights, validation, and real-time inferences.

---

## 🌟 System Architecture (Phase 1 & Phase 2 Complete)

```
┌────────────────────────────────────────────────────────┐
│             React 19 + TypeScript Frontend             │
│   (Cyber-Defense UI, Glassmorphism, Framer Motion)     │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON API + JWT
                            ▼
┌────────────────────────────────────────────────────────┐
│                 FastAPI Python Backend                 │
│  (Auth, Cryptographic Integrity Engine, Audit Trails)  │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│ PostgreSQL / SQLite ORM   │ │  SHA-256 Crypto Engine   │
│ (Users, Datasets, Models, │ │ (5-Stage Pipeline Chain: │
│  Inferences, Audit Logs)  │ │  DATA, MODEL, INPUT,     │
└───────────────────────────┘ │  INFERENCE, OUTPUT)      │
                              └──────────────────────────┘
```

---

## 🚀 Features & Capabilities

### 🛡️ Phase 1 (Frontend):
- **Command Center Dashboard**: Live telemetry, health metrics, tamper alerts, and pipeline state.
- **Pipeline Explorer**: Interactive 4-stage visualizer (**Dataset ➔ Model ➔ Validation ➔ Inference**).
- **Dataset & Model Registries**: Provenance logging, metadata tagging, and SHA-256 calculation.
- **Inference Lab**: Simulated CV inference playground with bounding box rendering and tamper detection.
- **Controlled Attack Lab**: Safe simulation triggers for **Dataset Poisoning**, **Model Weights Tampering**, and **Output Tampering**.
- **Compliance Dossiers & Audit Trail**: Printable certificates, immutable event streams, and JSON export.

### ⚙️ Phase 2 (Backend & Database Integration):
- **FastAPI API**: Full RESTful suite for Auth, Datasets, Models, Inferences, Integrity, Audit, Contributors, Reports, and Security Simulations.
- **SQLAlchemy 2.0 ORM**: Fully typed relational schemas for PostgreSQL and SQLite.
- **JWT & Role-Based Access Control**: `ADMIN`, `DATA CONTRIBUTOR`, `MODEL DEVELOPER`, `VALIDATOR`, `INFERENCE OPERATOR`.
- **Persistent Database Seeding**: Auto-initializes baseline demo datasets, models, and validator accounts on first launch.
- **Deep 5-Stage Verification Engine**: Evaluates cryptographic matches/mismatches across all pipeline assets.
- **Automated Test Suite**: 100% passing pytest test cases for all backend services and lifecycle workflows.

---

## ⚡ Getting Started

### 1. Start the FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000/api` (Swagger UI: `http://localhost:8000/docs`).

### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will be live at `http://localhost:5173/`.

---

## 🔑 Demo Login Presets

| Role | Email | Password |
|---|---|---|
| **Validator (Default)** | `validator@visigrity.demo` | `Validator123!` |
| **Model Developer** | `alex@visigrity.demo` | `Developer123!` |
| **Data Contributor** | `maria@visigrity.demo` | `Contributor123!` |
| **Security Admin** | `admin@visigrity.demo` | `Admin123!` |
| **Inference Operator** | `operator@visigrity.demo` | `Operator123!` |

*(Or click the 1-click role presets on the Login Page!)*

---

## 🧪 Verification & Testing

- **Backend Pytest Suite**: `pytest backend/tests -v`
- **Frontend Typecheck & Build**: `cd frontend && npm run build`
- **Health Check**: `GET http://localhost:8000/api/health`

---

## 🔮 Implementation Status & Roadmap

| Component | Status | Notes |
|---|---|---|
| **React + TypeScript Frontend** | ✅ **IMPLEMENTED** | Full UI with cyber-defense aesthetics & charts |
| **FastAPI REST Backend** | ✅ **IMPLEMENTED** | Complete API suite with OpenAPI docs |
| **Database & SQLAlchemy ORM** | ✅ **IMPLEMENTED** | PostgreSQL / SQLite with auto-seed |
| **JWT & Password Security** | ✅ **IMPLEMENTED** | bcrypt + HS256 JWT with RBAC |
| **SHA-256 Integrity Engine** | ✅ **IMPLEMENTED** | 5-stage cryptographic pipeline validation |
| **Controlled Attack Lab** | ✅ **IMPLEMENTED** | Safe backend threat simulation & reset |
| **Real Computer Vision / YOLO** | ⏳ **PHASE 3** | Controlled demo inference simulated in Phase 2 |
| **Live Blockchain Smart Contracts** | ⏳ **PHASE 3** | Blockchain Mode: DEMO in Phase 2 |
| **PDF Evidence Certificate Export** | ⏳ **PHASE 3** | JSON export & HTML printable view implemented |
