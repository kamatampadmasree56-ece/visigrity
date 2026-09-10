from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class ModelCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    version: str = Field(default="v1.0")
    framework: str = Field(default="PyTorch / YOLO")
    training_dataset_id: str = Field(default="UAV-DEMO-DATA-001")
    contributor_name: Optional[str] = "Demo Validator"
    hash: Optional[str] = None

class ModelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    framework: Optional[str] = None
    status: Optional[str] = None

class ModelVersionResponse(BaseModel):
    id: str
    model_id: str
    version: str
    hash: str
    framework: str
    training_dataset_id: str
    description: Optional[str] = None
    contributor_id: str
    contributor_name: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ModelResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    version: str
    framework: str
    training_dataset_id: str
    hash: str
    contributor_id: str
    contributor_name: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
