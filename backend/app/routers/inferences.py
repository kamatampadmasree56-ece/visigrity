from typing import List, Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_optional_user
from app.models.user import User
from app.schemas.inference import InferenceCreate, InferenceResponse
from app.services.inference_service import inference_service
from app.services.hash_service import hash_service

router = APIRouter(prefix="/inferences", tags=["Inferences"])

@router.get("", response_model=List[InferenceResponse])
def get_inferences(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve list of recent computer vision inferences."""
    return inference_service.get_inferences(db, limit=limit)

@router.post("", response_model=InferenceResponse, status_code=status.HTTP_201_CREATED)
def create_inference(
    inf_in: InferenceCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Execute a computer vision inference with input and output SHA-256 integrity fingerprints."""
    user_id = current_user.id if current_user else "usr-demo-001"
    user_name = current_user.full_name if current_user else "Demo Validator"
    return inference_service.create_inference(db, inf_in, user_id=user_id, user_name=user_name)

@router.post("/run-with-file", response_model=InferenceResponse, status_code=status.HTTP_201_CREATED)
async def run_inference_file(
    model_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Run inference against an uploaded image file via the full CV pipeline (OpenCV → Detector → SHA-256)."""
    from app.services.cv.inference import cv_engine
    from app.models.model import Model as ModelORM

    contents = await file.read()

    # Look up model hash for canonical output computation
    db_model = db.query(ModelORM).filter(ModelORM.id == model_id).first()
    if not db_model:
        db_model = db.query(ModelORM).first()

    model_hash = db_model.hash if db_model else "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4"
    model_version = db_model.version if db_model else "v2.1"

    # Run full CV pipeline
    cv_output = cv_engine.run_cv_pipeline(
        image_bytes=contents,
        model_id=model_id,
        model_version=model_version,
        model_hash=model_hash,
        filename=file.filename
    )

    inf_in = InferenceCreate(
        model_id=model_id,
        input_hash=cv_output.input_hash,
        output_hash_override=cv_output.output_hash,
        is_demo=(cv_output.cv_mode == "DEMO")
    )
    user_id = current_user.id if current_user else "usr-demo-001"
    user_name = current_user.full_name if current_user else "Demo Validator"
    return inference_service.create_inference_from_cv(db, inf_in, cv_output, user_id=user_id, user_name=user_name)

@router.get("/{inference_id}", response_model=InferenceResponse)
def get_inference(inference_id: str, db: Session = Depends(get_db)):
    """Retrieve details and bounding boxes for a specific inference."""
    return inference_service.get_inference_by_id(db, inference_id)

@router.post("/{inference_id}/verify", response_model=InferenceResponse)
def verify_inference(inference_id: str, db: Session = Depends(get_db)):
    """Verify inference output against model and input hashes."""
    return inference_service.verify_inference(db, inference_id)
