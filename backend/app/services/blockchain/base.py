from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from app.services.blockchain.schemas import BlockchainAuditRecord

class BaseBlockchainService(ABC):
    @property
    @abstractmethod
    def mode(self) -> str:
        """Return 'DEMO' or 'EVM'."""
        pass

    @abstractmethod
    def register_data(self, dataset_id: str, hash_value: str, version: str) -> BlockchainAuditRecord:
        pass

    @abstractmethod
    def register_model(self, model_id: str, hash_value: str, version: str) -> BlockchainAuditRecord:
        pass

    @abstractmethod
    def record_inference(self, inference_id: str, output_hash: str) -> BlockchainAuditRecord:
        pass

    @abstractmethod
    def record_verification(self, asset_id: str, verification_status: str) -> BlockchainAuditRecord:
        pass

    @abstractmethod
    def record_audit_event(self, record_type: str, asset_id: str, hash_value: str) -> BlockchainAuditRecord:
        pass
