import json
import hashlib
from typing import Dict, Any, Optional
from app.services.cv.preprocessing import cv_preprocessor
from app.services.cv.demo_detector import demo_detector
from app.services.cv.yolo_detector import yolo_detector
from app.services.cv.schemas import CVInferenceOutput, CVDetection

class CVInferenceEngine:
    @staticmethod
    def run_cv_pipeline(
        image_bytes: bytes,
        model_id: str = "VISI-YOLO-DEMO",
        model_version: str = "v2.1",
        model_hash: str = "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4",
        filename: Optional[str] = None
    ) -> CVInferenceOutput:
        """
        Execute full Computer Vision pipeline:
        Image -> OpenCV Preprocessing -> SHA-256 Input Hash -> Detection -> Canonical Sorting -> SHA-256 Output Hash.
        """
        # 1. OpenCV Preprocessing & Input Hashing
        img, input_hash, metadata = cv_preprocessor.validate_and_preprocess_image(image_bytes, filename)

        # 2. Run Detector
        detector = yolo_detector if yolo_detector.mode == "YOLO" else demo_detector
        detections = detector.detect(img, model_hash)

        # 3. Canonical representation of detections for deterministic output hash
        canonical_detections = [
            {
                "label": d.label,
                "confidence": round(float(d.confidence), 2),
                "boundingBox": {
                    "x": round(float(d.bounding_box.x), 2),
                    "y": round(float(d.bounding_box.y), 2),
                    "w": round(float(d.bounding_box.w), 2),
                    "h": round(float(d.bounding_box.h), 2),
                }
            }
            for d in detections
        ]
        # Sort canonically by label then confidence
        canonical_detections.sort(key=lambda x: (x["label"], -x["confidence"]))

        canonical_payload = {
            "model_id": model_id,
            "model_version": model_version,
            "model_hash": model_hash,
            "input_hash": input_hash,
            "detections": canonical_detections,
            "cv_mode": detector.mode
        }
        canonical_json = json.dumps(canonical_payload, sort_keys=True, separators=(',', ':'))
        output_hash = hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()

        primary = canonical_detections[0] if canonical_detections else {
            "label": "Unknown",
            "confidence": 0.0,
            "boundingBox": {"x": 0, "y": 0, "w": 0, "h": 0}
        }

        return CVInferenceOutput(
            cv_mode=detector.mode,
            model_id=model_id,
            model_version=model_version,
            model_hash=model_hash,
            input_hash=input_hash,
            output_hash=output_hash,
            detections=detections,
            primary_result=primary,
            image_metadata=metadata
        )

cv_engine = CVInferenceEngine()
