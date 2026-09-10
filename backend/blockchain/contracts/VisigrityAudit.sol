// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VisigrityAudit
 * @dev A smart contract for auditing computer vision pipeline integrity.
 * Used for Visigrity Phase 3.
 */
contract VisigrityAudit {
    struct AuditRecord {
        string recordType;
        string assetId;
        string hashValue;
        uint256 timestamp;
        address registrar;
    }

    mapping(bytes32 => AuditRecord) public records;
    
    event RecordRegistered(
        bytes32 indexed transactionId,
        string recordType,
        string assetId,
        string hashValue,
        uint256 timestamp,
        address registrar
    );

    /**
     * @dev Register an audit record
     */
    function registerRecord(
        string memory _recordType,
        string memory _assetId,
        string memory _hashValue
    ) public returns (bytes32) {
        bytes32 transactionId = keccak256(abi.encodePacked(_recordType, _assetId, _hashValue, block.timestamp, msg.sender));
        
        records[transactionId] = AuditRecord({
            recordType: _recordType,
            assetId: _assetId,
            hashValue: _hashValue,
            timestamp: block.timestamp,
            registrar: msg.sender
        });
        
        emit RecordRegistered(
            transactionId,
            _recordType,
            _assetId,
            _hashValue,
            block.timestamp,
            msg.sender
        );
        
        return transactionId;
    }

    function getRecord(bytes32 _transactionId) public view returns (
        string memory recordType,
        string memory assetId,
        string memory hashValue,
        uint256 timestamp,
        address registrar
    ) {
        AuditRecord memory record = records[_transactionId];
        return (
            record.recordType,
            record.assetId,
            record.hashValue,
            record.timestamp,
            record.registrar
        );
    }
}
