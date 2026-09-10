from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from app.models.inference import Inference
from app.models.model import Model
from app.schemas.inference import InferenceCreate
from app.services.hash_service import hash_service
from app.services.audit_service import audit_service

class InferenceService:
    @staticmethod
    def get_inferences(db: Session, limit: int = 50) -> List[Inference]:
        return db.query(Inference).order_by(desc(Inference.created_at)).limit(limit).all()

    @staticmethod
    def get_inference_by_id(db: Session, inference_id: str) -> Optional[Inference]:
        inf = db.query(Inference).filter(Inference.id == inference_id).first()
        if not inf:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inference not found")
        return inf

    @staticmethod
    def create_inference(
        db: Session,
        inf_in: InferenceCreate,
        user_id: str = "usr-demo-001",
        user_name: str = "Demo Validator"
    ) -> Inference:
        # Retrieve target model
        model = db.query(Model).filter(Model.id == inf_in.model_id).first()
        if not model:
            # Fallback to first model
            model = db.query(Model).first()
            if not model:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No registered models available.")

        timestamp_str = datetime.now(timezone.utc).isoformat()
        input_hash = inf_in.input_hash or hash_service.calculate_sha256_str(f"input-{model.id}-{timestamp_str}")
        output_hash = inf_in.output_hash_override or hash_service.calculate_sha256_str(f"output-{model.id}-{input_hash}-{timestamp_str}")

        # Controlled Demo Computer Vision result with bounding box
        demo_result = {
            "label": "Vehicle",
            "confidence": 94.2,
            "boundingBox": {"x": 20, "y": 30, "w": 55, "h": 35},
            "note": "DEMO INFERENCE - Synthetic CV bounding box simulation"
        }

        # Status inherits model integrity
        status_val = "TRUSTED" if model.status == "TRUSTED" else "COMPROMISED"

        inference = Inference(
            model_id=model.id,
            model_name=model.name,
            model_version=model.version,
            input_hash=input_hash,
            model_hash=model.hash,
            output_hash=output_hash,
            result=demo_result,
            contributor_id=user_id,
            contributor_name=user_name,
            status=status_val,
            is_demo=True,
            created_at=datetime.now(timezone.utc)
        )
        db.add(inference)
        db.commit()
        db.refresh(inference)

        # Audit record
        audit_service.create_log(
            db=db,
            record_type="INFERENCE_CREATED",
            asset_id=inference.id,
            hash_value=inference.output_hash,
            version=model.version,
            contributor_name=user_name,
            status="VERIFIED" if status_val == "TRUSTED" else "FAILED"
        )

        return inference

    @staticmethod
    def create_inference_from_cv(
        db: Session,
        inf_in: InferenceCreate,
        cv_output: any,
        user_id: str = "usr-demo-001",
        user_name: str = "Demo Validator"
    ) -> Inference:
        """Create an inference record populated with real CV engine output (OpenCV + Detector results)."""
        model = db.query(Model).filter(Model.id == inf_in.model_id).first()
        if not model:
            model = db.query(Model).first()
            if not model:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No registered models available.")

        status_val = "TRUSTED" if model.status == "TRUSTED" else "COMPROMISED"

        # Use the primary detection from CV engine as the result
        primary = cv_output.primary_result if cv_output.primary_result else {}
        cv_result = {
            "label": primary.get("label", "Unknown"),
            "confidence": float(primary.get("confidence", 0.0)),
            "boundingBox": primary.get("boundingBox", {"x": 0, "y": 0, "w": 0, "h": 0}),
            "cv_mode": cv_output.cv_mode,
            "total_detections": len(cv_output.detections),
            "note": f"{cv_output.cv_mode} CV pipeline - OpenCV preprocessed"
        }

        inference = Inference(
            model_id=model.id,
            model_name=model.name,
            model_version=model.version,
            input_hash=cv_output.input_hash,
            model_hash=cv_output.model_hash,
            output_hash=cv_output.output_hash,
            result=cv_result,
            contributor_id=user_id,
            contributor_name=user_name,
            status=status_val,
            is_demo=(cv_output.cv_mode == "DEMO"),
            created_at=datetime.now(timezone.utc)
        )
        db.add(inference)
        db.commit()
        db.refresh(inference)

        audit_service.create_log(
            db=db,
            record_type="INFERENCE_CREATED",
            asset_id=inference.id,
            hash_value=inference.output_hash,
            version=model.version,
            contributor_name=user_name,
            status="VERIFIED" if status_val == "TRUSTED" else "FAILED"
        )

        return inference

    @staticmethod
    def verify_inference(db: Session, inference_id: str) -> Inference:
        inf = InferenceService.get_inference_by_id(db, inference_id)
        model = db.query(Model).filter(Model.id == inf.model_id).first()
        
        if model and model.status == "TRUSTED" and model.hash == inf.model_hash:
            inf.status = "TRUSTED"
        else:
            inf.status = "COMPROMISED"

        db.commit()
        db.refresh(inf)
        return inf

inference_service = InferenceService()
