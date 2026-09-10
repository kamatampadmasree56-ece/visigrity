from typing import List, Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_optional_user, require_role
from app.models.user import User
from app.models.dataset import Dataset
from app.schemas.dataset import DatasetCreate, DatasetResponse, DatasetVersionResponse
from app.services.dataset_service import dataset_service
from app.services.hash_service import hash_service

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.get("", response_model=List[DatasetResponse])
def get_datasets(
    search: Optional[str] = Query(None, description="Search term for name/description"),
    status: Optional[str] = Query(None, description="Filter by status: TRUSTED, COMPROMISED, PENDING"),
    db: Session = Depends(get_db)
):
    """List all registered datasets."""
    return dataset_service.get_datasets(db, search=search, status_filter=status)

@router.post("", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
def create_dataset(
    dataset_in: DatasetCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Register a new dataset with cryptographic hash."""
    user_id = current_user.id if current_user else "usr-demo-001"
    user_name = current_user.full_name if current_user else (dataset_in.contributor_name or "Demo Validator")
    return dataset_service.create_dataset(db, dataset_in, user_id=user_id, user_name=user_name)

@router.post("/upload", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    version: str = Form("v1.0"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Upload dataset file and calculate SHA-256 hash from actual bytes."""
    contents = await file.read()
    file_hash = hash_service.calculate_sha256_bytes(contents)
    file_size = len(contents)

    dataset_in = DatasetCreate(
        name=name,
        description=description,
        version=version,
        hash=file_hash,
        size=file_size,
        contributor_name=current_user.full_name if current_user else "Demo Validator"
    )
    user_id = current_user.id if current_user else "usr-demo-001"
    user_name = current_user.full_name if current_user else "Demo Validator"
    return dataset_service.create_dataset(db, dataset_in, user_id=user_id, user_name=user_name)

@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Retrieve details of a specific dataset."""
    return dataset_service.get_dataset_by_id(db, dataset_id)

@router.post("/{dataset_id}/verify", response_model=DatasetResponse)
def verify_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Verify dataset integrity against baseline version hashes."""
    return dataset_service.verify_dataset(db, dataset_id)

@router.get("/{dataset_id}/history", response_model=List[DatasetVersionResponse])
def get_dataset_history(dataset_id: str, db: Session = Depends(get_db)):
    """Retrieve complete version history for a dataset."""
    return dataset_service.get_history(db, dataset_id)
