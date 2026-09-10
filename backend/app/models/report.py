import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON
from app.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(64), primary_key=True, default=lambda: f"RPT-{int(datetime.now().timestamp() * 1000)}")
    asset_id = Column(String(64), nullable=False, index=True)
    integrity_status = Column(String(50), nullable=False, default="TRUSTED")
    contributor_name = Column(String(255), nullable=False)
    blockchain_reference = Column(String(100), nullable=False, default=lambda: f"DEMO-RPT-{int(datetime.now().timestamp() * 1000)}")
    generated_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    report_data = Column(JSON, nullable=True)
