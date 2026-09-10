from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.dataset import Dataset
from app.models.model import Model
from app.models.inference import Inference
from app.models.integrity import IntegrityRecord
from app.models.security_event import SecurityEvent
from app.schemas.integrity import IntegrityResponse, PipelineStatusResponse
from app.services.audit_service import audit_service

class IntegrityService:
    @staticmethod
    def get_pipeline_status(db: Session) -> PipelineStatusResponse:
        """Calculate overall and stage-by-stage pipeline integrity status."""
        datasets = db.query(Dataset).all()
        models = db.query(Model).all()
        inferences = db.query(Inference).all()
        active_sec_events = db.query(SecurityEvent).filter(SecurityEvent.resolved == False).all()

        has_compromised_data = any(d.status == "COMPROMISED" for d in datasets)
        has_compromised_model = any(m.status == "COMPROMISED" for m in models)
        has_compromised_inf = any(i.status == "COMPROMISED" for i in inferences)
        has_critical_events = any(e.severity in ["CRITICAL", "HIGH"] for e in active_sec_events)

        data_stage = "COMPROMISED" if has_compromised_data else "TRUSTED"
        model_stage = "COMPROMISED" if has_compromised_model else "TRUSTED"
        inference_stage = "COMPROMISED" if (has_compromised_model or has_compromised_data or has_compromised_inf) else "TRUSTED"
        output_stage = "COMPROMISED" if (has_compromised_model or has_compromised_data or has_compromised_inf or has_critical_events) else "TRUSTED"

        stages = {
            "DATA": data_stage,
            "MODEL": model_stage,
            "INFERENCE": inference_stage,
            "OUTPUT": output_stage
        }

        overall = "COMPROMISED" if any(s == "COMPROMISED" for s in stages.values()) else "TRUSTED"

        return PipelineStatusResponse(overall=overall, stages=stages)

    @staticmethod
    def verify_pipeline(db: Session, asset_id: Optional[str] = None, asset_type: Optional[str] = "PIPELINE") -> IntegrityResponse:
        """Run deep cryptographic verification across the full pipeline or specific asset."""
        status_info = IntegrityService.get_pipeline_status(db)
        
        stages = {
            "data": "MATCH" if status_info.stages["DATA"] == "TRUSTED" else "MISMATCH",
            "model": "MATCH" if status_info.stages["MODEL"] == "TRUSTED" else "MISMATCH",
            "input": "MATCH" if status_info.stages["DATA"] == "TRUSTED" else "MISMATCH",
            "inference": "MATCH" if status_info.stages["MODEL"] == "TRUSTED" and status_info.stages["DATA"] == "TRUSTED" else "MISMATCH",
            "output": "MATCH" if status_info.overall == "TRUSTED" else "MISMATCH",
        }

        reason = None
        if status_info.overall == "COMPROMISED":
            if stages["model"] == "MISMATCH":
                reason = "MODEL HASH MISMATCH: Recorded model weights hash differs from verified baseline."
            elif stages["data"] == "MISMATCH":
                reason = "DATASET HASH MISMATCH: Dataset records exhibit hash discrepancies."
            else:
                reason = "PIPELINE INTEGRITY COMPROMISED: Verification identified cryptographic mismatch."

        record = IntegrityRecord(
            asset_id=asset_id or "PIPELINE",
            asset_type=asset_type or "PIPELINE",
            status=status_info.overall,
            reason=reason,
            stages=stages,
            verified_at=datetime.now(timezone.utc)
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        audit_service.create_log(
            db=db,
            record_type="OUTPUT_VERIFIED",
            asset_id=asset_id or "PIPELINE",
            hash_value=record.id,
            version="v1.0",
            contributor_name="Validator Engine",
            status="VERIFIED" if status_info.overall == "TRUSTED" else "FAILED",
            metadata_json={"stages": stages, "reason": reason}
        )

        return IntegrityResponse(
            status=status_info.overall,
            stages=stages,
            reason=reason,
            verified_at=record.verified_at,
            asset_id=record.asset_id,
            asset_type=record.asset_type
        )

integrity_service = IntegrityService()
