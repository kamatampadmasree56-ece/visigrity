from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class BlockchainAuditRecord(BaseModel):
    record_id: str
    record_type: str
    asset_id: str
    asset_type: str
    hash_value: str
    timestamp: datetime
    status: str
    mode: str  # DEMO or EVM
    transaction_reference: str
    block_number: Optional[int] = None
    network: str = "VISIGRITY-DEMO-LEDGER"

    model_config = ConfigDict(from_attributes=True)
