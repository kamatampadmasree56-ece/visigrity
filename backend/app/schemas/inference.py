from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class BoundingBox(BaseModel):
    x: float
    y: float
    w: float
    h: float

class InferenceResult(BaseModel):
    label: str
    confidence: float
    boundingBox: Optional[BoundingBox] = None

class InferenceCreate(BaseModel):
    model_id: str
    model_name: Optional[str] = None
    input_hash: Optional[str] = None
    output_hash_override: Optional[str] = None  # When CV engine computes the hash externally
    is_demo: bool = True

class InferenceResponse(BaseModel):
    id: str
    model_id: str
    model_name: str
    model_version: str
    input_hash: str
    model_hash: str
    output_hash: str
    result: Dict[str, Any]
    contributor_id: str
    contributor_name: str
    status: str
    is_demo: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
