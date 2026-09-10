import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime
from app.database import Base

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(String(64), primary_key=True, default=lambda: f"SEC-{int(datetime.now().timestamp())}")
    type = Column(String(100), nullable=False)
    description = Column(String(512), nullable=False)
    affected_asset_id = Column(String(64), nullable=False, index=True)
    asset_type = Column(String(50), nullable=False)  # DATASET, MODEL, INFERENCE, PIPELINE
    severity = Column(String(50), nullable=False, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    expected_hash = Column(String(64), nullable=True)
    current_hash = Column(String(64), nullable=True)
    resolved = Column(Boolean, default=False, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
