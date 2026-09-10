import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Model(Base):
    __tablename__ = "models"

    id = Column(String(64), primary_key=True, default=lambda: f"MODEL-{int(datetime.now().timestamp())}")
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    version = Column(String(50), nullable=False, default="v1.0")
    framework = Column(String(100), nullable=False, default="PyTorch / YOLO")
    training_dataset_id = Column(String(64), nullable=False)
    hash = Column(String(64), nullable=False, index=True)
    contributor_id = Column(String(64), nullable=False)
    contributor_name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="TRUSTED")  # TRUSTED, COMPROMISED, PENDING
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    versions = relationship("ModelVersion", back_populates="model", cascade="all, delete-orphan", order_by="desc(ModelVersion.created_at)")

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(String(64), primary_key=True, default=lambda: f"md-ver-{uuid.uuid4().hex[:8]}")
    model_id = Column(String(64), ForeignKey("models.id"), nullable=False, index=True)
    version = Column(String(50), nullable=False)
    hash = Column(String(64), nullable=False)
    framework = Column(String(100), nullable=False)
    training_dataset_id = Column(String(64), nullable=False)
    description = Column(Text, nullable=True)
    contributor_id = Column(String(64), nullable=False)
    contributor_name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="TRUSTED")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    model = relationship("Model", back_populates="versions")
