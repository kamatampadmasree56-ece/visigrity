from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class ReportCreate(BaseModel):
    asset_id: Optional[str] = "PIPELINE"
    contributor_name: Optional[str] = "Demo Validator"

class ReportResponse(BaseModel):
    id: str
    asset_id: str
    integrity_status: str
    contributor_name: str
    blockchain_reference: str
    generated_date: datetime
    report_data: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)
