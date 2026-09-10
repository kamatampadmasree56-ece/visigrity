import uuid
from datetime import datetime, timezone
from app.services.blockchain.base import BaseBlockchainService
from app.services.blockchain.schemas import BlockchainAuditRecord

class DemoBlockchainService(BaseBlockchainService):
    """
    Mock implementation of a blockchain ledger for Visigrity Phase 3.
    Returns deterministic-looking transaction receipts for audit records.
    """
    
    def __init__(self):
        self._mode = "DEMO"
        self._network = "VISIGRITY-DEMO-LEDGER"

    @property
    def mode(self) -> str:
        return self._mode

    def _create_record(self, record_type: str, asset_id: str, asset_type: str, hash_value: str) -> BlockchainAuditRecord:
        record_id = f"aud-{uuid.uuid4().hex[:8]}"
        tx_hash = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex}"
        
        return BlockchainAuditRecord(
            record_id=record_id,
            record_type=record_type,
            asset_id=asset_id,
            asset_type=asset_type,
            hash_value=hash_value,
            timestamp=datetime.now(timezone.utc),
            status="CONFIRMED",
            mode=self._mode,
            transaction_reference=tx_hash,
            block_number=1337,
            network=self._network
        )

    def register_data(self, dataset_id: str, hash_value: str, version: str) -> BlockchainAuditRecord:
        return self._create_record("DATA_REGISTRATION", dataset_id, "dataset", hash_value)

    def register_model(self, model_id: str, hash_value: str, version: str) -> BlockchainAuditRecord:
        return self._create_record("MODEL_REGISTRATION", model_id, "model", hash_value)

    def record_inference(self, inference_id: str, output_hash: str) -> BlockchainAuditRecord:
        return self._create_record("INFERENCE_RECORD", inference_id, "inference", output_hash)

    def record_verification(self, asset_id: str, verification_status: str) -> BlockchainAuditRecord:
        # Here we embed the status in the hash/value field for tracking
        return self._create_record("VERIFICATION_EVENT", asset_id, "verification", f"status:{verification_status}")

    def record_audit_event(self, record_type: str, asset_id: str, hash_value: str) -> BlockchainAuditRecord:
        return self._create_record(record_type, asset_id, "audit_event", hash_value)

demo_blockchain = DemoBlockchainService()
