import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models import (
    User, Contributor, Dataset, DatasetVersion, Model, ModelVersion,
    Inference, SecurityEvent, AuditLog, Report
)
from app.utils.security import hash_password
from app.services.hash_service import hash_service
from app.routers import (
    auth_router,
    datasets_router,
    models_router,
    inferences_router,
    integrity_router,
    audit_router,
    contributors_router,
    reports_router,
    security_router
)
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("visigrity")

BASE_DATASET_HASH = "a8f9e3b12c4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0"
BASE_MODEL_HASH = "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4"
BASE_INFERENCE_INPUT_HASH = "f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1"
BASE_INFERENCE_OUTPUT_HASH = "e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2"

def seed_database(db: Session = None):
    """Seed initial development and demo records if tables are empty."""
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True
    try:
        # Check if users exist
        if db.query(User).count() == 0:
            logger.info("Seeding initial demo users and contributors...")
            demo_users = [
                User(
                    id="usr-demo-001",
                    email="validator@visigrity.demo",
                    full_name="Demo Validator",
                    password_hash=hash_password("Validator123!"),
                    role="VALIDATOR",
                    is_active=True
                ),
                User(
                    id="usr-demo-002",
                    email="alex@visigrity.demo",
                    full_name="Alex Chen",
                    password_hash=hash_password("Developer123!"),
                    role="MODEL DEVELOPER",
                    is_active=True
                ),
                User(
                    id="usr-demo-003",
                    email="maria@visigrity.demo",
                    full_name="Maria Santos",
                    password_hash=hash_password("Contributor123!"),
                    role="DATA CONTRIBUTOR",
                    is_active=True
                ),
                User(
                    id="usr-demo-004",
                    email="admin@visigrity.demo",
                    full_name="Security Admin",
                    password_hash=hash_password("Admin123!"),
                    role="ADMIN",
                    is_active=True
                ),
                User(
                    id="usr-demo-005",
                    email="operator@visigrity.demo",
                    full_name="Inference Operator",
                    password_hash=hash_password("Operator123!"),
                    role="INFERENCE OPERATOR",
                    is_active=True
                ),
            ]
            db.add_all(demo_users)

            demo_contributors = [
                Contributor(id="usr-demo-001", name="Demo Validator", email="validator@visigrity.demo", role="VALIDATOR", assets_contributed=12, trust_status="TRUSTED"),
                Contributor(id="usr-demo-002", name="Alex Chen", email="alex@visigrity.demo", role="MODEL DEVELOPER", assets_contributed=8, trust_status="TRUSTED"),
                Contributor(id="usr-demo-003", name="Maria Santos", email="maria@visigrity.demo", role="DATA CONTRIBUTOR", assets_contributed=15, trust_status="TRUSTED"),
                Contributor(id="usr-demo-004", name="Security Admin", email="admin@visigrity.demo", role="ADMIN", assets_contributed=5, trust_status="TRUSTED"),
                Contributor(id="usr-demo-005", name="Inference Operator", email="operator@visigrity.demo", role="INFERENCE OPERATOR", assets_contributed=24, trust_status="TRUSTED"),
            ]
            db.add_all(demo_contributors)
            db.commit()

        # Check if datasets exist
        if db.query(Dataset).count() == 0:
            logger.info("Seeding initial demo datasets...")
            ds1 = Dataset(
                id="UAV-DEMO-DATA-001",
                name="UAV Aerial Dataset Alpha",
                description="High-resolution aerial imagery for vehicle detection in urban environments.",
                version="v2.1",
                hash=BASE_DATASET_HASH,
                contributor_id="usr-demo-001",
                contributor_name="Demo Validator",
                status="TRUSTED",
                size=4096,
                created_at=datetime.now(timezone.utc)
            )
            ds2 = Dataset(
                id="UAV-DEMO-DATA-002",
                name="Parking Lot Overhead Survey",
                description="Annotated parking lot imagery for vehicle count and occupancy analysis.",
                version="v1.0",
                hash=hash_service.calculate_sha256_str("UAV-DEMO-DATA-002-v1.0"),
                contributor_id="usr-demo-002",
                contributor_name="Alex Chen",
                status="TRUSTED",
                size=2048,
                created_at=datetime.now(timezone.utc)
            )
            ds3 = Dataset(
                id="UAV-DEMO-DATA-003",
                name="Traffic Flow Analysis Set",
                description="Time-series road video dataset for traffic density assessment.",
                version="v1.2",
                hash=hash_service.calculate_sha256_str("UAV-DEMO-DATA-003-v1.2"),
                contributor_id="usr-demo-003",
                contributor_name="Maria Santos",
                status="PENDING",
                size=8192,
                created_at=datetime.now(timezone.utc)
            )
            db.add_all([ds1, ds2, ds3])
            db.commit()

            # Add dataset version history
            db.add(DatasetVersion(dataset_id=ds1.id, version=ds1.version, hash=ds1.hash, description=ds1.description, contributor_id=ds1.contributor_id, contributor_name=ds1.contributor_name, status=ds1.status, size=ds1.size))
            db.add(DatasetVersion(dataset_id=ds2.id, version=ds2.version, hash=ds2.hash, description=ds2.description, contributor_id=ds2.contributor_id, contributor_name=ds2.contributor_name, status=ds2.status, size=ds2.size))
            db.commit()

        # Check if models exist
        if db.query(Model).count() == 0:
            logger.info("Seeding initial demo models...")
            m1 = Model(
                id="VISI-YOLO-DEMO",
                name="VISI-YOLO-DEMO",
                description="Primary vehicle detection model for UAV imagery. Demo instance only.",
                version="v2.1",
                framework="PyTorch / YOLO",
                training_dataset_id="UAV-DEMO-DATA-001",
                hash=BASE_MODEL_HASH,
                contributor_id="usr-demo-002",
                contributor_name="Alex Chen",
                status="TRUSTED",
                created_at=datetime.now(timezone.utc)
            )
            m2 = Model(
                id="VISI-YOLO-LITE",
                name="VISI-YOLO-LITE",
                description="Lightweight model for edge deployment. Reduced parameter count.",
                version="v1.0",
                framework="ONNX",
                training_dataset_id="UAV-DEMO-DATA-002",
                hash=hash_service.calculate_sha256_str("VISI-YOLO-LITE-v1.0"),
                contributor_id="usr-demo-003",
                contributor_name="Maria Santos",
                status="TRUSTED",
                created_at=datetime.now(timezone.utc)
            )
            db.add_all([m1, m2])
            db.commit()

            db.add(ModelVersion(model_id=m1.id, version=m1.version, hash=m1.hash, framework=m1.framework, training_dataset_id=m1.training_dataset_id, description=m1.description, contributor_id=m1.contributor_id, contributor_name=m1.contributor_name, status=m1.status))
            db.add(ModelVersion(model_id=m2.id, version=m2.version, hash=m2.hash, framework=m2.framework, training_dataset_id=m2.training_dataset_id, description=m2.description, contributor_id=m2.contributor_id, contributor_name=m2.contributor_name, status=m2.status))
            db.commit()

        # Check if inferences exist
        if db.query(Inference).count() == 0:
            logger.info("Seeding initial demo inference...")
            inf = Inference(
                id="INF-DEMO-001",
                model_id="VISI-YOLO-DEMO",
                model_name="VISI-YOLO-DEMO",
                model_version="v2.1",
                input_hash=BASE_INFERENCE_INPUT_HASH,
                model_hash=BASE_MODEL_HASH,
                output_hash=BASE_INFERENCE_OUTPUT_HASH,
                result={
                    "label": "Vehicle",
                    "confidence": 94.2,
                    "boundingBox": {"x": 20, "y": 30, "w": 55, "h": 35}
                },
                contributor_id="usr-demo-001",
                contributor_name="Demo Validator",
                status="TRUSTED",
                is_demo=True,
                created_at=datetime.now(timezone.utc)
            )
            db.add(inf)
            db.commit()

        # Check if security events exist
        if db.query(SecurityEvent).count() == 0:
            logger.info("Seeding initial security events...")
            evt = SecurityEvent(
                id="SEC-001",
                type="HASH_VERIFICATION_SUCCESS",
                description="Pipeline integrity verified. All stage hashes match baseline records.",
                affected_asset_id="PIPELINE",
                asset_type="PIPELINE",
                severity="LOW",
                resolved=True,
                timestamp=datetime.now(timezone.utc)
            )
            db.add(evt)
            db.commit()

        # Check if audit logs exist
        if db.query(AuditLog).count() == 0:
            logger.info("Seeding initial audit trail...")
            logs = [
                AuditLog(
                    id="AUDIT-001",
                    record_type="DATA_REGISTERED",
                    asset_id="UAV-DEMO-DATA-001",
                    hash=BASE_DATASET_HASH,
                    version="v2.1",
                    contributor_name="Demo Validator",
                    transaction_reference="DEMO-AUDIT-001",
                    status="VERIFIED",
                    is_demo=True,
                    timestamp=datetime.now(timezone.utc)
                ),
                AuditLog(
                    id="AUDIT-002",
                    record_type="MODEL_REGISTERED",
                    asset_id="VISI-YOLO-DEMO",
                    hash=BASE_MODEL_HASH,
                    version="v2.1",
                    contributor_name="Alex Chen",
                    transaction_reference="DEMO-AUDIT-002",
                    status="VERIFIED",
                    is_demo=True,
                    timestamp=datetime.now(timezone.utc)
                ),
                AuditLog(
                    id="AUDIT-003",
                    record_type="INFERENCE_CREATED",
                    asset_id="INF-DEMO-001",
                    hash=BASE_INFERENCE_OUTPUT_HASH,
                    version="v1.0",
                    contributor_name="Demo Validator",
                    transaction_reference="DEMO-AUDIT-003",
                    status="VERIFIED",
                    is_demo=True,
                    timestamp=datetime.now(timezone.utc)
                ),
            ]
            db.add_all(logs)
            db.commit()

    except Exception as e:
        logger.error(f"Error seeding demo database: {e}")
        db.rollback()
    finally:
        if should_close:
            db.close()

_db_ready = False

def ensure_database_ready():
    """Ensure database tables exist and initial demo records are seeded (serverless safe)."""
    global _db_ready
    if not _db_ready:
        try:
            Base.metadata.create_all(bind=engine)
            seed_database()
            _db_ready = True
        except Exception as e:
            logger.error(f"Database auto-initialization warning: {e}")

# Trigger DB ready check at module load
ensure_database_ready()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seeds if not already done
    ensure_database_ready()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Trustworthy Computer Vision Integrity & Provenance Platform Backend",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serverless database readiness middleware
@app.middleware("http")
async def ensure_db_middleware(request, call_next):
    ensure_database_ready()
    response = await call_next(request)
    return response

# Root endpoints (for Vercel root and browser visits)
@app.get("/", tags=["Root"])
def root():
    return {
        "service": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/api/health",
        "api_prefix": settings.API_PREFIX,
        "environment": settings.ENVIRONMENT,
        "blockchain_mode": settings.BLOCKCHAIN_MODE,
        "cv_engine_mode": settings.CV_ENGINE_MODE,
    }

@app.get("/api", tags=["Root"])
def api_root():
    return root()

# Health Check Endpoint
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "VISIGRITY API",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "blockchain_mode": settings.BLOCKCHAIN_MODE,
        "cv_engine_mode": settings.CV_ENGINE_MODE,
    }

# Include all API Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(datasets_router, prefix=settings.API_PREFIX)
app.include_router(models_router, prefix=settings.API_PREFIX)
app.include_router(inferences_router, prefix=settings.API_PREFIX)
app.include_router(integrity_router, prefix=settings.API_PREFIX)
app.include_router(audit_router, prefix=settings.API_PREFIX)
app.include_router(contributors_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(security_router, prefix=settings.API_PREFIX)

