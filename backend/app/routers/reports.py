from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_optional_user
from app.models.user import User
from app.schemas.report import ReportCreate, ReportResponse
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Evidence Reports"])

@router.get("", response_model=List[ReportResponse])
def get_reports(db: Session = Depends(get_db)):
    """List all generated cryptographic evidence reports."""
    return report_service.get_reports(db)

@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report_in: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """Compile and generate a new cryptographic pipeline integrity report."""
    name = current_user.full_name if current_user else (report_in.contributor_name or "Demo Validator")
    return report_service.create_report(db, report_in, contributor_name=name)

@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: str, db: Session = Depends(get_db)):
    """Retrieve full dossier for a specific report."""
    return report_service.get_report_by_id(db, report_id)

from fastapi.responses import Response
from app.services.pdf_service import pdf_service

@router.get("/{report_id}/pdf")
def download_report_pdf(report_id: str, db: Session = Depends(get_db)):
    """Download the compliance dossier as a PDF."""
    report = report_service.get_report_by_id(db, report_id)
    
    # Mock pipeline and verification data for the PDF
    pipeline_data = {
        "inference_id": report.asset_id,
        "dataset_id": "UAV-DEMO-DATA-001",
        "model_id": "VISI-YOLO-DEMO",
        "status": report.integrity_status,
        "input_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "model_hash": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
        "output_hash": "1f8b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }
    verification_results = {
        "dataset_integrity": True,
        "model_integrity": True,
        "inference_integrity": report.integrity_status == "TRUSTED",
        "blockchain_audit": True
    }
    
    pdf_bytes = pdf_service.generate_compliance_dossier(pipeline_data, verification_results)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=visigrity-dossier-{report_id}.pdf"
        }
    )
