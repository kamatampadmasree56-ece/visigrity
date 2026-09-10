from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class SecurityEventResponse(BaseModel):
    id: str
    type: str
    description: str
    affected_asset_id: str
    asset_type: str
    severity: str
    expected_hash: Optional[str] = None
    current_hash: Optional[str] = None
    resolved: bool
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class TamperSimulationResponse(BaseModel):
    success: bool
    message: str
    event: SecurityEventResponse
    pipeline_status: str
