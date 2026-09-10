from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from app.models.dataset import Dataset, DatasetVersion
from app.models.contributor import Contributor
from app.schemas.dataset import DatasetCreate, DatasetUpdate
from app.services.hash_service import hash_service
from app.services.audit_service import audit_service

class DatasetService:
    @staticmethod
    def get_datasets(db: Session, search: Optional[str] = None, status_filter: Optional[str] = None) -> List[Dataset]:
        query = db.query(Dataset)
        if search:
            query = query.filter(Dataset.name.ilike(f"%{search}%") | Dataset.description.ilike(f"%{search}%"))
        if status_filter:
            query = query.filter(Dataset.status == status_filter.upper())
        return query.order_by(desc(Dataset.created_at)).all()

    @staticmethod
    def get_dataset_by_id(db: Session, dataset_id: str) -> Optional[Dataset]:
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if not dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
        return dataset

    @staticmethod
    def create_dataset(db: Session, dataset_in: DatasetCreate, user_id: str = "usr-demo-001", user_name: str = "Demo Validator") -> Dataset:
        # Compute SHA-256 hash if not provided
        hash_val = dataset_in.hash or hash_service.calculate_sha256_str(f"{dataset_in.name}-{dataset_in.version}-{datetime.now().timestamp()}")
        
        dataset = Dataset(
            name=dataset_in.name,
            description=dataset_in.description,
            version=dataset_in.version,
            hash=hash_val,
            contributor_id=user_id,
            contributor_name=dataset_in.contributor_name or user_name,
            status="TRUSTED",
            size=dataset_in.size or 4096,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)

        # Create version history record
        version_rec = DatasetVersion(
            dataset_id=dataset.id,
            version=dataset.version,
            hash=dataset.hash,
            description=dataset.description,
            contributor_id=dataset.contributor_id,
            contributor_name=dataset.contributor_name,
            status="TRUSTED",
            size=dataset.size,
            created_at=dataset.created_at
        )
        db.add(version_rec)

        # Update contributor stats
        contributor = db.query(Contributor).filter(Contributor.name == dataset.contributor_name).first()
        if contributor:
            contributor.assets_contributed += 1
            contributor.last_activity = datetime.now(timezone.utc)

        db.commit()

        # Audit log
        audit_service.create_log(
            db=db,
            record_type="DATA_REGISTERED",
            asset_id=dataset.id,
            hash_value=dataset.hash,
            version=dataset.version,
            contributor_name=dataset.contributor_name,
            status="VERIFIED"
        )

        return dataset

    @staticmethod
    def verify_dataset(db: Session, dataset_id: str) -> Dataset:
        dataset = DatasetService.get_dataset_by_id(db, dataset_id)
        # Check integrity against recorded versions
        latest_version = db.query(DatasetVersion).filter(DatasetVersion.dataset_id == dataset_id).order_by(desc(DatasetVersion.created_at)).first()
        
        if latest_version and latest_version.hash == dataset.hash:
            dataset.status = "TRUSTED"
        else:
            dataset.status = "COMPROMISED"
        
        dataset.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(dataset)

        audit_service.create_log(
            db=db,
            record_type="OUTPUT_VERIFIED",
            asset_id=dataset.id,
            hash_value=dataset.hash,
            version=dataset.version,
            contributor_name="Validator",
            status="VERIFIED" if dataset.status == "TRUSTED" else "FAILED"
        )

        return dataset

    @staticmethod
    def get_history(db: Session, dataset_id: str) -> List[DatasetVersion]:
        DatasetService.get_dataset_by_id(db, dataset_id)
        return db.query(DatasetVersion).filter(DatasetVersion.dataset_id == dataset_id).order_by(desc(DatasetVersion.created_at)).all()

dataset_service = DatasetService()
