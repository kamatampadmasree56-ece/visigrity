from app.routers.auth import router as auth_router
from app.routers.datasets import router as datasets_router
from app.routers.models import router as models_router
from app.routers.inferences import router as inferences_router
from app.routers.integrity import router as integrity_router
from app.routers.audit import router as audit_router
from app.routers.contributors import router as contributors_router
from app.routers.reports import router as reports_router
from app.routers.security import router as security_router

__all__ = [
    "auth_router",
    "datasets_router",
    "models_router",
    "inferences_router",
    "integrity_router",
    "audit_router",
    "contributors_router",
    "reports_router",
    "security_router",
]
