from typing import List, Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_optional_user
from app.models.user import User
from app.schemas.model import ModelCreate, ModelResponse, ModelVersionResponse
from app.services.model_service import model_service
from app.services.hash_service import hash_service

router = APIRouter(prefix="/models", tags=["Models"])

@router.get("", response_model=List[ModelResponse])
def get_models(
    search: Optional[str] = Query(None, description="Search term for model name/description"),
    framework: Optional[str] = Query(None, description="Filter by framework"),
    db: Session = Depends(get_db)
):
    """List all registered models in the registry."""
    return model_service.get_models(db, search=search, framework_filter=framework)

@router.post("", response_model=ModelResponse, status_code=status.HTTP_201_CREATED)
def create_model(
    model_in: ModelCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Register a new computer vision model in the registry."""
    user_id = current_user.id if current_user else "usr-demo-002"
    user_name = current_user.full_name if current_user else (model_in.contributor_name or "Alex Chen")
    return model_service.create_model(db, model_in, user_id=user_id, user_name=user_name)

@router.post("/upload", response_model=ModelResponse, status_code=status.HTTP_201_CREATED)
async def upload_model(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    version: str = Form("v1.0"),
    framework: str = Form("PyTorch / YOLO"),
    training_dataset_id: str = Form("UAV-DEMO-DATA-001"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Upload model weights file and calculate SHA-256 hash from actual bytes."""
    contents = await file.read()
    file_hash = hash_service.calculate_sha256_bytes(contents)

    model_in = ModelCreate(
        name=name,
        description=description,
        version=version,
        framework=framework,
        training_dataset_id=training_dataset_id,
        hash=file_hash,
        contributor_name=current_user.full_name if current_user else "Alex Chen"
    )
    user_id = current_user.id if current_user else "usr-demo-002"
    user_name = current_user.full_name if current_user else "Alex Chen"
    return model_service.create_model(db, model_in, user_id=user_id, user_name=user_name)

@router.get("/{model_id}", response_model=ModelResponse)
def get_model(model_id: str, db: Session = Depends(get_db)):
    """Retrieve details of a specific model."""
    return model_service.get_model_by_id(db, model_id)

@router.post("/{model_id}/verify", response_model=ModelResponse)
def verify_model(model_id: str, db: Session = Depends(get_db)):
    """Verify model weights hash against baseline."""
    return model_service.verify_model(db, model_id)

@router.get("/{model_id}/history", response_model=List[ModelVersionResponse])
def get_model_history(model_id: str, db: Session = Depends(get_db)):
    """Retrieve complete version history for a model."""
    return model_service.get_history(db, model_id)
