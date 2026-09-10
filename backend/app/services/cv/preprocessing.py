import cv2
import numpy as np
import hashlib
from typing import Tuple, Dict, Any, Optional
from fastapi import HTTPException, status
from PIL import Image
import io

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "bmp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit
MAX_DIMENSION = 4096
MIN_DIMENSION = 16

class CVPreprocessor:
    @staticmethod
    def validate_and_preprocess_image(
        image_bytes: bytes,
        filename: Optional[str] = None
    ) -> Tuple[np.ndarray, str, Dict[str, Any]]:
        """
        Validate image integrity, prevent malicious payloads/traversal,
        calculate deterministic SHA-256 input hash, and decode with OpenCV.
        """
        # 1. File size check
        if not image_bytes or len(image_bytes) == 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty image data provided.")
        if len(image_bytes) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image exceeds 10MB size limit.")

        # 2. Extension sanity check if filename provided
        if filename:
            clean_ext = filename.split(".")[-1].lower() if "." in filename else ""
            if clean_ext and clean_ext not in ALLOWED_EXTENSIONS:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsupported image format: .{clean_ext}")

        # 3. Calculate deterministic SHA-256 of raw input bytes
        input_hash = hashlib.sha256(image_bytes).hexdigest()

        # 4. Decode image safely with OpenCV
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            # Fallback verification with Pillow
            try:
                pil_img = Image.open(io.BytesIO(image_bytes))
                pil_img.verify()
                # Reload for numpy conversion
                pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            except Exception:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or corrupt image binary.")

        height, width = img.shape[:2]
        if height < MIN_DIMENSION or width < MIN_DIMENSION:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image dimensions are too small (minimum 16x16).")
        if height > MAX_DIMENSION or width > MAX_DIMENSION:
            # Safely resize while preserving aspect ratio
            scale = MAX_DIMENSION / max(height, width)
            new_w, new_h = int(width * scale), int(height * scale)
            img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
            height, width = new_h, new_w

        metadata = {
            "width": width,
            "height": height,
            "channels": int(img.shape[2]) if len(img.shape) > 2 else 1,
            "file_size_bytes": len(image_bytes),
            "input_hash": input_hash,
            "color_space": "BGR",
        }

        return img, input_hash, metadata

cv_preprocessor = CVPreprocessor()
