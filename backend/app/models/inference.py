import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, JSON
from app.database import Base

class Inference(Base):
    __tablename__ = "inferences"

    id = Column(String(64), primary_key=True, default=lambda: f"INF-{int(datetime.now().timestamp()*1000)}-{uuid.uuid4().hex[:6]}")
    model_id = Column(String(64), nullable=False, index=True)
    model_name = Column(String(255), nullable=False)
    model_version = Column(String(50), nullable=False, default="v1.0")
    input_hash = Column(String(64), nullable=False, index=True)
    model_hash = Column(String(64), nullable=False)
    output_hash = Column(String(64), nullable=False, index=True)
    result = Column(JSON, nullable=False)  # {"label": "Vehicle", "confidence": 94.2, "boundingBox": {...}}
    contributor_id = Column(String(64), nullable=False)
    contributor_name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="TRUSTED")  # TRUSTED, COMPROMISED
    is_demo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
