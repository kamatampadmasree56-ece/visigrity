from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.schemas.integrity import IntegrityVerifyRequest, IntegrityResponse, PipelineStatusResponse
from app.services.integrity_service import integrity_service

router = APIRouter(prefix="/integrity", tags=["Integrity Engine"])

@router.get("/status", response_model=PipelineStatusResponse)
def get_pipeline_status(db: Session = Depends(get_db)):
    """Retrieve current 4-stage pipeline integrity status."""
    return integrity_service.get_pipeline_status(db)

@router.post("/verify", response_model=IntegrityResponse)
def verify_pipeline(
    req: IntegrityVerifyRequest = IntegrityVerifyRequest(),
    db: Session = Depends(get_db)
):
    """Execute cryptographic verification across the full pipeline."""
    return integrity_service.verify_pipeline(db, asset_id=req.asset_id, asset_type=req.asset_type)
