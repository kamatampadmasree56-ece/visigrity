from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.schemas.contributor import ContributorResponse, ContributorActivityResponse
from app.services.contributor_service import contributor_service

router = APIRouter(prefix="/contributors", tags=["Contributors"])

@router.get("", response_model=List[ContributorResponse])
def get_contributors(db: Session = Depends(get_db)):
    """Retrieve all contributors and their trust status."""
    return contributor_service.get_contributors(db)

@router.get("/{contributor_id}", response_model=ContributorResponse)
def get_contributor(contributor_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a single contributor."""
    return contributor_service.get_contributor_by_id(db, contributor_id)

@router.get("/{contributor_id}/activity", response_model=ContributorActivityResponse)
def get_contributor_activity(contributor_id: str, db: Session = Depends(get_db)):
    """Retrieve contributor activity metrics and contribution history."""
    return contributor_service.get_contributor_activity(db, contributor_id)
