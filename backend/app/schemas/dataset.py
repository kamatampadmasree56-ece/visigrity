from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class DatasetCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    version: str = Field(default="v1.0")
    contributor_name: Optional[str] = "Demo Validator"
    hash: Optional[str] = None
    size: Optional[int] = 0

class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    status: Optional[str] = None
    size: Optional[int] = None

class DatasetVersionResponse(BaseModel):
    id: str
    dataset_id: str
    version: str
    hash: str
    description: Optional[str] = None
    contributor_id: str
    contributor_name: str
    status: str
    size: Optional[int] = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DatasetResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    version: str
    hash: str
    contributor_id: str
    contributor_name: str
    status: str
    size: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
