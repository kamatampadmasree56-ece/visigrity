from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class ContributorResponse(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    role: str
    assets_contributed: int
    last_activity: datetime
    trust_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ContributorActivityResponse(BaseModel):
    contributor: ContributorResponse
    recent_audit_logs: List[Dict[str, Any]]
    datasets_count: int
    models_count: int
    inferences_count: int
