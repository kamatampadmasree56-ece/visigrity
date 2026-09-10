# 🚀 VISIGRITY — Vercel Production Deployment Guide

**Platform:** VISIGRITY — Trustworthy Computer Vision Integrity & Provenance Platform  
**Architecture:** React/Vite Frontend (SPA) + FastAPI Python Backend (Serverless)  
**Deployment Target:** Vercel (2 Projects from 1 Monorepo)

---

## 📋 Overview

VISIGRITY is deployed on Vercel as **two separate projects** pointing to the same Git repository:

```
┌────────────────────────────────────────────────────────┐
│               GitHub: visigrity repository             │
└──────────────┬─────────────────────────┬───────────────┘
               │                         │
               ▼                         ▼
┌────────────────────────────┐ ┌────────────────────────────┐
│   1. Backend Vercel App    │ │   2. Frontend Vercel App   │
│   Root Directory: backend/ │ │   Root Directory: frontend/│
│   FastAPI Python Serverless│ │   React + Vite SPA         │
│   Domain:                  │ │   Domain:                  │
│   https://visigrity-api... │ │   https://visigrity...     │
└──────────────┬─────────────┘ └─────────────┬──────────────┘
               │                             │
               └─────────── API Calls ───────┘
                     (CORS Authenticated)
```

---

## ⚙️ Step 1: Deploy Backend to Vercel (FastAPI Serverless)

### 1. Create New Project in Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New…** → **Project**.
3. Import your GitHub repository: `kamatampadmasree56-ece/visigrity`.

### 2. Configure Backend Project Settings
* **Project Name**: `visigrity-backend` (or your preferred name)
* **Framework Preset**: `Other`
* **Root Directory**: Click *Edit* and select **`backend`** (Don't leave as root `.`)
* **Build and Output Settings**: Default (Vercel automatically detects Python requirements)

### 3. Add Backend Environment Variables
In the **Environment Variables** section, add:

| Variable Name | Example Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:password@ep-host.neon.tech/visigrity?sslmode=require` | PostgreSQL connection string (Neon, Supabase, Vercel Postgres). If omitted, falls back to `/tmp/visigrity.db`. |
| `JWT_SECRET_KEY` | *(Generate via `python -c "import secrets; print(secrets.token_hex(32))"`)* | Strong cryptographic secret for auth tokens (min 32 chars). |
| `JWT_ALGORITHM` | `HS256` | JWT signature algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token expiration (24 hours). |
| `CORS_ORIGINS` | `http://localhost:5173,https://visigrity-frontend.vercel.app` | Allowed origins (comma-separated). Set your frontend domain here. |
| `ENVIRONMENT` | `production` | Environment mode. |
| `BLOCKCHAIN_MODE` | `DEMO` | Blockchain audit provider mode. |
| `CV_ENGINE_MODE` | `DEMO` | Computer vision engine mode. |
| `API_PREFIX` | `/api` | Base API prefix. |

### 4. Deploy Backend
* Click **Deploy**.
* Note the deployed domain, e.g.: `https://visigrity-backend.vercel.app`.
* Test health endpoint: `https://visigrity-backend.vercel.app/api/health` → returns `{"status":"ok", ...}`.

---

## 🎨 Step 2: Deploy Frontend to Vercel (React / Vite SPA)

### 1. Create Second Project in Vercel
1. In Vercel dashboard, click **Add New…** → **Project**.
2. Import the same repository: `kamatampadmasree56-ece/visigrity`.

### 2. Configure Frontend Project Settings
* **Project Name**: `visigrity-frontend` (or `visigrity`)
* **Framework Preset**: `Vite`
* **Root Directory**: Click *Edit* and select **`frontend`**
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Install Command**: `npm install`

### 3. Add Frontend Environment Variable
In the **Environment Variables** section, add:

| Variable Name | Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://visigrity-backend.vercel.app/api` | Your backend Vercel domain with `/api` path. |

> **Note**: `apiClient` automatically normalizes trailing slashes and ensures the `/api` prefix is preserved without duplicate `/api/api`.

### 4. Deploy Frontend
* Click **Deploy**.
* Once finished, note your frontend URL, e.g.: `https://visigrity-frontend.vercel.app`.

---

## 🔗 Step 3: Link CORS Origins

1. Go back to your **Backend Project** on Vercel: **Settings** → **Environment Variables**.
2. Update `CORS_ORIGINS` to include your exact production frontend domain:
   ```env
   CORS_ORIGINS=http://localhost:5173,https://visigrity-frontend.vercel.app
   ```
3. Go to **Deployments** → click **Redeploy** on the latest deployment for the backend.

---

## 🔒 Security & Architecture Notes

### 1. Database in Serverless
* **Production**: Connect a hosted PostgreSQL instance (e.g., Neon Postgres, Supabase, Vercel Postgres, AWS RDS). Set `DATABASE_URL=postgresql://...`.
* **Serverless SQLite Fallback**: If `DATABASE_URL` is omitted or set to SQLite, the database automatically writes to `/tmp/visigrity.db` (ephemeral instance storage for testing).

### 2. Computer Vision & OpenCV
* The backend uses `opencv-python-headless>=4.10.0` which runs natively in Vercel's serverless Linux Lambda execution environment without X11/GUI library dependencies.
* The deterministic `DemoDetector` provides reliable vehicle and object detection when large YOLO weights are not bundled in serverless packages.

### 3. PDF Compliance Dossiers
* The `/api/reports/{report_id}/pdf` endpoint utilizes in-memory stream buffers (`io.BytesIO`) with ReportLab.
* No local persistent disk files are created or required, ensuring 100% serverless compliance.

### 4. Blockchain Integrity
* `DemoBlockchainService` generates deterministic, cryptographically signed ledger transactions stored in the database.
* The smart contract specification is available at `backend/blockchain/contracts/VisigrityAudit.sol` for EVM / Ethereum mainnet or testnet deployment.

---

## 🧪 Local Development Setup

To run locally with live reload:

### Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
