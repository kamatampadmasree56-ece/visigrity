from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.schemas.security_event import SecurityEventResponse, TamperSimulationResponse
from app.services.security_service import security_service

router = APIRouter(prefix="/security", tags=["Security & Simulation"])

@router.get("/events", response_model=List[SecurityEventResponse])
def get_security_events(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve security incidents and tamper alerts."""
    return security_service.get_events(db, limit=limit)

@router.post("/simulate/model-tampering", response_model=TamperSimulationResponse)
def simulate_model_tampering(db: Session = Depends(get_db)):
    """Simulate model weights tampering attack in a controlled test environment."""
    return security_service.simulate_model_tampering(db)

@router.post("/simulate/dataset-tampering", response_model=TamperSimulationResponse)
def simulate_dataset_tampering(db: Session = Depends(get_db)):
    """Simulate dataset corruption / poisoning attack in a controlled test environment."""
    return security_service.simulate_dataset_tampering(db)

@router.post("/simulate/output-tampering", response_model=TamperSimulationResponse)
def simulate_output_tampering(db: Session = Depends(get_db)):
    """Simulate adversarial inference output modification in a controlled test environment."""
    return security_service.simulate_output_tampering(db)

@router.post("/reset-demo")
def reset_demo(db: Session = Depends(get_db)):
    """Reset all demo assets, hashes, and resolve security alerts back to trusted state."""
    security_service.reset_demo(db)
    return {"status": "ok", "message": "Demo state reset to TRUSTED."}
