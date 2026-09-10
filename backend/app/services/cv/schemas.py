from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class CVBoundingBox(BaseModel):
    x: float = Field(..., description="Top-left X coordinate percentage [0-100]")
    y: float = Field(..., description="Top-left Y coordinate percentage [0-100]")
    w: float = Field(..., description="Bounding box width percentage [0-100]")
    h: float = Field(..., description="Bounding box height percentage [0-100]")

    model_config = ConfigDict(from_attributes=True)

class CVDetection(BaseModel):
    label: str
    confidence: float = Field(..., ge=0.0, le=100.0)
    bounding_box: CVBoundingBox

    model_config = ConfigDict(from_attributes=True)

class CVInferenceOutput(BaseModel):
    cv_mode: str = Field(..., description="DEMO or YOLO")
    model_id: str
    model_version: str
    model_hash: str
    input_hash: str
    output_hash: str
    detections: List[CVDetection]
    primary_result: Dict[str, Any]
    image_metadata: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)
