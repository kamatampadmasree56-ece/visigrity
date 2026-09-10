from abc import ABC, abstractmethod
from typing import List, Dict, Any, Tuple
import numpy as np
from app.services.cv.schemas import CVDetection

class BaseDetector(ABC):
    @property
    @abstractmethod
    def mode(self) -> str:
        """Returns detector mode: 'DEMO' or 'YOLO'."""
        pass

    @property
    @abstractmethod
    def model_name(self) -> str:
        pass

    @property
    @abstractmethod
    def model_version(self) -> str:
        pass

    @abstractmethod
    def detect(self, img: np.ndarray, model_hash: str) -> List[CVDetection]:
        """Execute detection and return list of bounding boxes and class predictions."""
        pass
