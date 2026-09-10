from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.audit_log import AuditLog

class AuditService:
    @staticmethod
    def create_log(
        db: Session,
        record_type: str,
        asset_id: str,
        hash_value: str,
        version: str = "v1.0",
        contributor_name: str = "System",
        status: str = "VERIFIED",
        is_demo: bool = True,
        metadata_json: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        """Create an immutable audit trail record."""
        audit = AuditLog(
            record_type=record_type,
            asset_id=asset_id,
            hash=hash_value,
            version=version,
            contributor_name=contributor_name,
            status=status,
            is_demo=is_demo,
            metadata_json=metadata_json,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(audit)
        db.commit()
        db.refresh(audit)
        return audit

    @staticmethod
    def get_logs(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        record_type: Optional[str] = None,
        asset_id: Optional[str] = None
    ) -> List[AuditLog]:
        """Retrieve audit logs with optional filtering and pagination."""
        query = db.query(AuditLog)
        if record_type:
            query = query.filter(AuditLog.record_type == record_type)
        if asset_id:
            query = query.filter(AuditLog.asset_id == asset_id)
        return query.order_by(desc(AuditLog.timestamp)).offset(skip).limit(limit).all()

    @staticmethod
    def get_logs_by_asset(db: Session, asset_id: str) -> List[AuditLog]:
        return db.query(AuditLog).filter(AuditLog.asset_id == asset_id).order_by(desc(AuditLog.timestamp)).all()

audit_service = AuditService()
