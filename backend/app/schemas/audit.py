from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class AuditLogCreate(BaseModel):
    record_type: str
    asset_id: str
    hash: str
    version: str = "v1.0"
    contributor_name: str
    status: str = "VERIFIED"
    is_demo: bool = True
    metadata_json: Optional[Dict[str, Any]] = None

class AuditLogResponse(BaseModel):
    id: str
    record_type: str
    asset_id: str
    hash: str
    version: str
    contributor_name: str
    timestamp: datetime
    transaction_reference: str
    status: str
    is_demo: bool
    metadata_json: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)
