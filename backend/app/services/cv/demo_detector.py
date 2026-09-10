from typing import List
import numpy as np
import hashlib
from app.services.cv.detector import BaseDetector
from app.services.cv.schemas import CVDetection, CVBoundingBox

class DemoDetector(BaseDetector):
    """
    Deterministic Demo Computer Vision Detector for VISIGRITY.
    Employed when production YOLO weights are in DEMO mode.
    """
    @property
    def mode(self) -> str:
        return "DEMO"

    @property
    def model_name(self) -> str:
        return "VISI-YOLO-DEMO"

    @property
    def model_version(self) -> str:
        return "v2.1"

    def detect(self, img: np.ndarray, model_hash: str) -> List[CVDetection]:
        # Compute deterministic seed from image shape and model hash
        h, w = img.shape[:2]
        seed_str = f"{w}_{h}_{model_hash[:16]}"
        seed_int = int(hashlib.md5(seed_str.encode()).hexdigest()[:8], 16)

        # Generate realistic, reproducible vehicle bounding box coordinates
        x_pct = 15.0 + (seed_int % 20)
        y_pct = 20.0 + ((seed_int >> 4) % 15)
        w_pct = 40.0 + ((seed_int >> 8) % 20)
        h_pct = 30.0 + ((seed_int >> 12) % 20)

        primary_detection = CVDetection(
            label="Vehicle",
            confidence=94.2,
            bounding_box=CVBoundingBox(x=x_pct, y=y_pct, w=w_pct, h=h_pct)
        )

        return [primary_detection]

demo_detector = DemoDetector()
