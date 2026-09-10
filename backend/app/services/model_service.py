from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from app.models.model import Model, ModelVersion
from app.models.contributor import Contributor
from app.schemas.model import ModelCreate, ModelUpdate
from app.services.hash_service import hash_service
from app.services.audit_service import audit_service

class ModelService:
    @staticmethod
    def get_models(db: Session, search: Optional[str] = None, framework_filter: Optional[str] = None) -> List[Model]:
        query = db.query(Model)
        if search:
            query = query.filter(Model.name.ilike(f"%{search}%") | Model.description.ilike(f"%{search}%"))
        if framework_filter:
            query = query.filter(Model.framework.ilike(f"%{framework_filter}%"))
        return query.order_by(desc(Model.created_at)).all()

    @staticmethod
    def get_model_by_id(db: Session, model_id: str) -> Optional[Model]:
        model = db.query(Model).filter(Model.id == model_id).first()
        if not model:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")
        return model

    @staticmethod
    def create_model(db: Session, model_in: ModelCreate, user_id: str = "usr-demo-002", user_name: str = "Alex Chen") -> Model:
        hash_val = model_in.hash or hash_service.calculate_sha256_str(f"{model_in.name}-{model_in.version}-{model_in.framework}-{datetime.now().timestamp()}")
        
        model = Model(
            name=model_in.name,
            description=model_in.description,
            version=model_in.version,
            framework=model_in.framework,
            training_dataset_id=model_in.training_dataset_id,
            hash=hash_val,
            contributor_id=user_id,
            contributor_name=model_in.contributor_name or user_name,
            status="TRUSTED",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(model)
        db.commit()
        db.refresh(model)

        # Record version
        version_rec = ModelVersion(
            model_id=model.id,
            version=model.version,
            hash=model.hash,
            framework=model.framework,
            training_dataset_id=model.training_dataset_id,
            description=model.description,
            contributor_id=model.contributor_id,
            contributor_name=model.contributor_name,
            status="TRUSTED",
            created_at=model.created_at
        )
        db.add(version_rec)

        contributor = db.query(Contributor).filter(Contributor.name == model.contributor_name).first()
        if contributor:
            contributor.assets_contributed += 1
            contributor.last_activity = datetime.now(timezone.utc)

        db.commit()

        # Audit log
        audit_service.create_log(
            db=db,
            record_type="MODEL_REGISTERED",
            asset_id=model.id,
            hash_value=model.hash,
            version=model.version,
            contributor_name=model.contributor_name,
            status="VERIFIED"
        )

        return model

    @staticmethod
    def verify_model(db: Session, model_id: str) -> Model:
        model = ModelService.get_model_by_id(db, model_id)
        latest_version = db.query(ModelVersion).filter(ModelVersion.model_id == model_id).order_by(desc(ModelVersion.created_at)).first()
        
        if latest_version and latest_version.hash == model.hash:
            model.status = "TRUSTED"
        else:
            model.status = "COMPROMISED"
        
        model.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(model)

        audit_service.create_log(
            db=db,
            record_type="OUTPUT_VERIFIED",
            asset_id=model.id,
            hash_value=model.hash,
            version=model.version,
            contributor_name="Validator",
            status="VERIFIED" if model.status == "TRUSTED" else "FAILED"
        )

        return model

    @staticmethod
    def get_history(db: Session, model_id: str) -> List[ModelVersion]:
        ModelService.get_model_by_id(db, model_id)
        return db.query(ModelVersion).filter(ModelVersion.model_id == model_id).order_by(desc(ModelVersion.created_at)).all()

model_service = ModelService()
