import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(64), primary_key=True, default=lambda: f"DATASET-{int(datetime.now().timestamp())}")
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    version = Column(String(50), nullable=False, default="v1.0")
    hash = Column(String(64), nullable=False, index=True)
    contributor_id = Column(String(64), nullable=False)
    contributor_name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="TRUSTED")  # TRUSTED, COMPROMISED, PENDING
    size = Column(Integer, nullable=True, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    versions = relationship("DatasetVersion", back_populates="dataset", cascade="all, delete-orphan", order_by="desc(DatasetVersion.created_at)")

class DatasetVersion(Base):
    __tablename__ = "dataset_versions"

    id = Column(String(64), primary_key=True, default=lambda: f"ds-ver-{uuid.uuid4().hex[:8]}")
    dataset_id = Column(String(64), ForeignKey("datasets.id"), nullable=False, index=True)
    version = Column(String(50), nullable=False)
    hash = Column(String(64), nullable=False)
    description = Column(Text, nullable=True)
    contributor_id = Column(String(64), nullable=False)
    contributor_name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="TRUSTED")
    size = Column(Integer, nullable=True, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    dataset = relationship("Dataset", back_populates="versions")
