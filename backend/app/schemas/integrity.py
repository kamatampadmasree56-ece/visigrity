from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class IntegrityVerifyRequest(BaseModel):
    asset_id: Optional[str] = None
    asset_type: Optional[str] = "PIPELINE"
    hash: Optional[str] = None

class IntegrityStageResult(BaseModel):
    data: str  # MATCH / MISMATCH
    model: str
    input: str
    inference: str
    output: str

class PipelineStatusResponse(BaseModel):
    overall: str  # TRUSTED / COMPROMISED / PENDING
    stages: Dict[str, str]  # {"DATA": "TRUSTED", "MODEL": "TRUSTED", ...}

class IntegrityResponse(BaseModel):
    status: str  # TRUSTED / COMPROMISED
    stages: Dict[str, str]  # {"data": "MATCH", "model": "MISMATCH", ...}
    expected_hash: Optional[str] = None
    current_hash: Optional[str] = None
    reason: Optional[str] = None
    verified_at: datetime
    asset_id: Optional[str] = None
    asset_type: Optional[str] = None
