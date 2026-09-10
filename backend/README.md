# VISIGRITY Backend (Phase 2)

**Integrity Behind Every Vision.**

Trustworthy Computer Vision Integrity & Provenance Platform — FastAPI + SQLAlchemy 2.0 + PostgreSQL / SQLite.

---

## 🛠️ Architecture & Features

- **FastAPI**: Modern, high-performance asynchronous web framework with automatic OpenAPI / Swagger documentation (`/docs`, `/redoc`).
- **SQLAlchemy 2.0 ORM**: Fully typed models for Users, Datasets, Dataset Versions, Models, Model Versions, Inferences, Integrity Records, Security Events, Audit Logs, and Compliance Reports.
- **Database Engine**: Supports PostgreSQL (`postgresql+psycopg://...`) with automatic fallback to persistent local SQLite (`sqlite:///./visigrity.db`).
- **JWT & Password Security**: bcrypt password hashing and HS256 JWT access tokens with Role-Based Access Control (RBAC).
- **SHA-256 Integrity Engine**: 5-stage cryptographic pipeline verification (`DATA`, `MODEL`, `INPUT`, `INFERENCE`, `OUTPUT`).
- **Controlled Security Simulation**: Safe sandbox threat testing (`Model Tampering`, `Dataset Poisoning`, `Adversarial Output Tampering`) with live tamper alert triggers and instant demo reset.
- **Immutable Audit Trail**: Structured event logging capturing every system action with cryptographic hash fingerprints.

---

## 🚀 Quickstart & Installation

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Key environment variables:
- `DATABASE_URL`: `postgresql+psycopg://user:password@localhost:5432/visigrity` (or `sqlite:///./visigrity.db`)
- `JWT_SECRET_KEY`: Secret string for token signing
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token validity duration (default: 1440 mins)
- `CORS_ORIGINS`: Allowed client origins (`http://localhost:5173`)

### 3. Run Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Base URL: `http://localhost:8000/api`
- Health Check: `http://localhost:8000/api/health`
- Swagger Documentation: `http://localhost:8000/docs`

---

## 🧪 Running Automated Tests

Run the comprehensive pytest suite:
```bash
pytest backend/tests -v
```

All test cases verify:
- Health and system modes
- User registration, login, and JWT decoding
- Dataset & Model registration, file upload hashing, and verification
- Computer vision inference simulation with bounding box output and hash generation
- Full pipeline integrity validation (TRUSTED vs. COMPROMISED)
- Threat simulation lifecycle and demo reset
- Audit trail recording and compliance report compilation
