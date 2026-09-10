from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.security_event import SecurityEvent
from app.models.model import Model
from app.models.dataset import Dataset
from app.models.inference import Inference
from app.schemas.security_event import SecurityEventResponse, TamperSimulationResponse
from app.services.hash_service import hash_service
from app.services.audit_service import audit_service

BASE_DATASET_HASH = "a8f9e3b12c4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0"
BASE_MODEL_HASH = "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4"
TAMPERED_MODEL_HASH = "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5"
BASE_INFERENCE_OUTPUT_HASH = "e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2"

class SecurityService:
    @staticmethod
    def get_events(db: Session, limit: int = 50) -> List[SecurityEvent]:
        return db.query(SecurityEvent).order_by(desc(SecurityEvent.timestamp)).limit(limit).all()

    @staticmethod
    def simulate_model_tampering(db: Session) -> TamperSimulationResponse:
        """Simulate model tampering by altering demo model hash and recording alert."""
        model = db.query(Model).filter(Model.id == "VISI-YOLO-DEMO").first()
        if not model:
            model = db.query(Model).first()

        if model:
            model.hash = TAMPERED_MODEL_HASH
            model.status = "COMPROMISED"
            model.updated_at = datetime.now(timezone.utc)

        event = SecurityEvent(
            type="MODEL_HASH_MISMATCH",
            description="Model weights hash mismatch detected. Recorded hash differs from verified baseline.",
            affected_asset_id=model.id if model else "VISI-YOLO-DEMO",
            asset_type="MODEL",
            severity="CRITICAL",
            expected_hash=BASE_MODEL_HASH,
            current_hash=TAMPERED_MODEL_HASH,
            resolved=False,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(event)
        db.commit()
        db.refresh(event)

        audit_service.create_log(
            db=db,
            record_type="TAMPERING_DETECTED",
            asset_id=event.affected_asset_id,
            hash_value=TAMPERED_MODEL_HASH,
            version="v2.1",
            contributor_name="SYSTEM MONITOR",
            status="FAILED",
            metadata_json={"attack_type": "MODEL_TAMPERING_SIMULATION", "severity": "CRITICAL"}
        )

        return TamperSimulationResponse(
            success=True,
            message="Model tampering simulation activated. Model marked as COMPROMISED.",
            event=SecurityEventResponse.model_validate(event),
            pipeline_status="COMPROMISED"
        )

    @staticmethod
    def simulate_dataset_tampering(db: Session) -> TamperSimulationResponse:
        """Simulate dataset tampering by altering dataset hash and recording alert."""
        dataset = db.query(Dataset).filter(Dataset.id == "UAV-DEMO-DATA-001").first()
        if not dataset:
            dataset = db.query(Dataset).first()

        tampered_hash = hash_service.calculate_sha256_str("tampered-dataset-" + str(datetime.now().timestamp()))
        if dataset:
            dataset.hash = tampered_hash
            dataset.status = "COMPROMISED"
            dataset.updated_at = datetime.now(timezone.utc)

        event = SecurityEvent(
            type="DATASET_HASH_MISMATCH",
            description="Dataset hash mismatch detected. Expected hash differs from current recorded value.",
            affected_asset_id=dataset.id if dataset else "UAV-DEMO-DATA-001",
            asset_type="DATASET",
            severity="CRITICAL",
            expected_hash=BASE_DATASET_HASH,
            current_hash=tampered_hash,
            resolved=False,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(event)
        db.commit()
        db.refresh(event)

        audit_service.create_log(
            db=db,
            record_type="TAMPERING_DETECTED",
            asset_id=event.affected_asset_id,
            hash_value=tampered_hash,
            version="v2.1",
            contributor_name="SYSTEM MONITOR",
            status="FAILED",
            metadata_json={"attack_type": "DATASET_TAMPERING_SIMULATION", "severity": "CRITICAL"}
        )

        return TamperSimulationResponse(
            success=True,
            message="Dataset tampering simulation activated. Dataset marked as COMPROMISED.",
            event=SecurityEventResponse.model_validate(event),
            pipeline_status="COMPROMISED"
        )

    @staticmethod
    def simulate_output_tampering(db: Session) -> TamperSimulationResponse:
        """Simulate inference output tampering."""
        inf = db.query(Inference).filter(Inference.id == "INF-DEMO-001").first()
        if not inf:
            inf = db.query(Inference).first()

        tampered_hash = hash_service.calculate_sha256_str("tampered-output-" + str(datetime.now().timestamp()))
        if inf:
            inf.output_hash = tampered_hash
            inf.status = "COMPROMISED"

        event = SecurityEvent(
            type="OUTPUT_HASH_MISMATCH",
            description="Inference output hash mismatch detected. Recorded output may have been modified.",
            affected_asset_id=inf.id if inf else "INF-DEMO-001",
            asset_type="INFERENCE",
            severity="HIGH",
            expected_hash=BASE_INFERENCE_OUTPUT_HASH,
            current_hash=tampered_hash,
            resolved=False,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(event)
        db.commit()
        db.refresh(event)

        audit_service.create_log(
            db=db,
            record_type="TAMPERING_DETECTED",
            asset_id=event.affected_asset_id,
            hash_value=tampered_hash,
            version="v1.0",
            contributor_name="SYSTEM MONITOR",
            status="FAILED"
        )

        return TamperSimulationResponse(
            success=True,
            message="Inference output tampering simulation activated.",
            event=SecurityEventResponse.model_validate(event),
            pipeline_status="COMPROMISED"
        )

    @staticmethod
    def reset_demo(db: Session) -> bool:
        """Reset all demo assets, hashes, and resolve security events back to trusted state."""
        # Restore datasets
        db.query(Dataset).filter(Dataset.id == "UAV-DEMO-DATA-001").update({
            "hash": BASE_DATASET_HASH,
            "status": "TRUSTED",
            "updated_at": datetime.now(timezone.utc)
        })
        # Restore models
        db.query(Model).filter(Model.id == "VISI-YOLO-DEMO").update({
            "hash": BASE_MODEL_HASH,
            "status": "TRUSTED",
            "updated_at": datetime.now(timezone.utc)
        })
        # Restore inferences
        db.query(Inference).filter(Inference.id == "INF-DEMO-001").update({
            "output_hash": BASE_INFERENCE_OUTPUT_HASH,
            "status": "TRUSTED"
        })
        # Resolve all security events
        db.query(SecurityEvent).update({"resolved": True})
        db.commit()

        audit_service.create_log(
            db=db,
            record_type="DATA_REGISTERED",
            asset_id="PIPELINE",
            hash_value=hash_service.calculate_sha256_str("pipeline-reset-" + str(datetime.now().timestamp())),
            version="v1.0",
            contributor_name="SYSTEM RESET",
            status="VERIFIED",
            metadata_json={"action": "DEMO_STATE_RESTORED_TO_TRUSTED"}
        )

        return True

security_service = SecurityService()
