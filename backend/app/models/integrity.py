import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON
from app.database import Base

class IntegrityRecord(Base):
    __tablename__ = "integrity_records"

    id = Column(String(64), primary_key=True, default=lambda: f"INT-{uuid.uuid4().hex[:8]}")
    asset_id = Column(String(64), nullable=False, index=True)
    asset_type = Column(String(50), nullable=False)  # DATASET, MODEL, INFERENCE, PIPELINE
    expected_hash = Column(String(64), nullable=True)
    current_hash = Column(String(64), nullable=True)
    status = Column(String(50), nullable=False, default="TRUSTED")  # TRUSTED, COMPROMISED
    reason = Column(String(512), nullable=True)
    stages = Column(JSON, nullable=True)  # {"data": "MATCH", "model": "MATCH", ...}
    verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
