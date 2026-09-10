from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from app.models.report import Report
from app.models.dataset import Dataset
from app.models.model import Model
from app.models.inference import Inference
from app.models.security_event import SecurityEvent
from app.schemas.report import ReportCreate
from app.services.integrity_service import integrity_service
from app.services.audit_service import audit_service
from app.services.hash_service import hash_service

class ReportService:
    @staticmethod
    def get_reports(db: Session) -> List[Report]:
        return db.query(Report).order_by(desc(Report.generated_date)).all()

    @staticmethod
    def get_report_by_id(db: Session, report_id: str) -> Optional[Report]:
        rpt = db.query(Report).filter(Report.id == report_id).first()
        if not rpt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
        return rpt

    @staticmethod
    def create_report(
        db: Session,
        report_in: ReportCreate,
        contributor_name: str = "Demo Validator"
    ) -> Report:
        status_info = integrity_service.get_pipeline_status(db)
        
        datasets = db.query(Dataset).all()
        models = db.query(Model).all()
        inferences = db.query(Inference).all()
        sec_events = db.query(SecurityEvent).all()

        report_payload = {
            "title": "Cryptographic Pipeline Integrity Dossier",
            "asset_id": report_in.asset_id or "PIPELINE",
            "integrity_status": status_info.overall,
            "stages": status_info.stages,
            "datasets_summary": [{"id": d.id, "name": d.name, "hash": d.hash, "status": d.status} for d in datasets],
            "models_summary": [{"id": m.id, "name": m.name, "hash": m.hash, "status": m.status} for m in models],
            "inferences_count": len(inferences),
            "security_incidents_count": len(sec_events),
            "blockchain_mode": "DEMO",
            "disclaimer": "Cryptographic provenance report verified via VISIGRITY Phase 2 Integrity Engine. Blockchain integration is in DEMO mode."
        }

        report = Report(
            asset_id=report_in.asset_id or "PIPELINE",
            integrity_status=status_info.overall,
            contributor_name=contributor_name,
            generated_date=datetime.now(timezone.utc),
            report_data=report_payload
        )
        db.add(report)
        db.commit()
        db.refresh(report)

        audit_service.create_log(
            db=db,
            record_type="REPORT_GENERATED",
            asset_id=report.id,
            hash_value=hash_service.calculate_sha256_dict(report_payload),
            version="v1.0",
            contributor_name=contributor_name,
            status="VERIFIED"
        )

        return report

report_service = ReportService()
