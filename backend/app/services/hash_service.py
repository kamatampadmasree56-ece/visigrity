import hashlib
import json
from typing import Any, Dict

class HashService:
    @staticmethod
    def calculate_sha256_str(data: str) -> str:
        """Calculate SHA-256 hash of a string."""
        return hashlib.sha256(data.encode("utf-8")).hexdigest()

    @staticmethod
    def calculate_sha256_bytes(data: bytes) -> str:
        """Calculate SHA-256 hash of raw bytes."""
        return hashlib.sha256(data).hexdigest()

    @staticmethod
    def calculate_sha256_dict(data: Dict[str, Any]) -> str:
        """Calculate SHA-256 of a canonical sorted JSON representation."""
        canonical_json = json.dumps(data, sort_keys=True, separators=(',', ':'))
        return hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()

    @staticmethod
    def generate_demo_hash(seed: str) -> str:
        """Generate a deterministic demo SHA-256 hash from a seed string."""
        return hashlib.sha256(f"visigrity-demo-{seed}".encode("utf-8")).hexdigest()

hash_service = HashService()
