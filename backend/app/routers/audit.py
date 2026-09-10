from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.schemas.audit import AuditLogCreate, AuditLogResponse
from app.services.audit_service import audit_service

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    record_type: Optional[str] = Query(None, description="Filter by event type"),
    asset_id: Optional[str] = Query(None, description="Filter by asset ID"),
    db: Session = Depends(get_db)
):
    """Retrieve immutable audit trail records."""
    return audit_service.get_logs(db, skip=skip, limit=limit, record_type=record_type, asset_id=asset_id)

@router.post("", response_model=AuditLogResponse, status_code=status.HTTP_201_CREATED)
def create_audit_log(log_in: AuditLogCreate, db: Session = Depends(get_db)):
    """Create a new audit trail record."""
    return audit_service.create_log(
        db=db,
        record_type=log_in.record_type,
        asset_id=log_in.asset_id,
        hash_value=log_in.hash,
        version=log_in.version,
        contributor_name=log_in.contributor_name,
        status=log_in.status,
        is_demo=log_in.is_demo,
        metadata_json=log_in.metadata_json
    )

@router.get("/{asset_id}", response_model=List[AuditLogResponse])
def get_audit_logs_by_asset(asset_id: str, db: Session = Depends(get_db)):
    """Retrieve audit history for a specific asset."""
    return audit_service.get_logs_by_asset(db, asset_id)
