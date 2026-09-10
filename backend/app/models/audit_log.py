import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, JSON
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, default=lambda: f"AUDIT-{int(datetime.now().timestamp() * 1000)}")
    record_type = Column(String(100), nullable=False, index=True)
    asset_id = Column(String(64), nullable=False, index=True)
    hash = Column(String(64), nullable=False)
    version = Column(String(50), nullable=False, default="v1.0")
    contributor_name = Column(String(255), nullable=False)
    transaction_reference = Column(String(100), nullable=False, default=lambda: f"DEMO-AUDIT-{int(datetime.now().timestamp() * 1000)}")
    status = Column(String(50), nullable=False, default="VERIFIED")  # VERIFIED, FAILED, PENDING
    is_demo = Column(Boolean, default=True, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    metadata_json = Column(JSON, nullable=True)
