import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime
from app.database import Base

class Contributor(Base):
    __tablename__ = "contributors"

    id = Column(String(64), primary_key=True, default=lambda: f"usr-demo-{uuid.uuid4().hex[:6]}")
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default="DATA CONTRIBUTOR")
    assets_contributed = Column(Integer, default=0, nullable=False)
    last_activity = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    trust_status = Column(String(50), default="TRUSTED", nullable=False)  # TRUSTED, WARNING, REVOKED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
