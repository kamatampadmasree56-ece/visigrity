from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.contributor import Contributor
from app.models.audit_log import AuditLog
from app.models.dataset import Dataset
from app.models.model import Model
from app.models.inference import Inference
from app.schemas.contributor import ContributorResponse, ContributorActivityResponse

class ContributorService:
    @staticmethod
    def get_contributors(db: Session) -> List[Contributor]:
        return db.query(Contributor).all()

    @staticmethod
    def get_contributor_by_id(db: Session, contributor_id: str) -> Optional[Contributor]:
        c = db.query(Contributor).filter(Contributor.id == contributor_id).first()
        if not c:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contributor not found")
        return c

    @staticmethod
    def get_contributor_activity(db: Session, contributor_id: str) -> ContributorActivityResponse:
        c = ContributorService.get_contributor_by_id(db, contributor_id)
        
        audit_logs = db.query(AuditLog).filter(AuditLog.contributor_name == c.name).limit(10).all()
        datasets_count = db.query(Dataset).filter(Dataset.contributor_name == c.name).count()
        models_count = db.query(Model).filter(Model.contributor_name == c.name).count()
        inferences_count = db.query(Inference).filter(Inference.contributor_name == c.name).count()

        return ContributorActivityResponse(
            contributor=ContributorResponse.model_validate(c),
            recent_audit_logs=[
                {
                    "id": a.id,
                    "recordType": a.record_type,
                    "assetId": a.asset_id,
                    "hash": a.hash,
                    "timestamp": a.timestamp.isoformat(),
                    "status": a.status
                }
                for a in audit_logs
            ],
            datasets_count=datasets_count,
            models_count=models_count,
            inferences_count=inferences_count
        )

contributor_service = ContributorService()
