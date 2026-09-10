export type Role = 'ADMIN' | 'DATA CONTRIBUTOR' | 'MODEL DEVELOPER' | 'VALIDATOR' | 'INFERENCE OPERATOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export type AssetStatus = 'TRUSTED' | 'COMPROMISED' | 'PENDING';

export interface Dataset {
  id: string;
  name: string;
  description: string;
  version: string;
  hash: string;
  contributorId: string;
  contributorName: string;
  timestamp: string;
  status: AssetStatus;
  size?: number;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  version: string;
  framework: string;
  trainingDatasetId: string;
  hash: string;
  contributorId: string;
  contributorName: string;
  timestamp: string;
  status: AssetStatus;
}

export interface Inference {
  id: string;
  modelId: string;
  modelName: string;
  modelVersion: string;
  inputHash: string;
  modelHash: string;
  outputHash: string;
  result: {
    label: string;
    confidence: number;
    boundingBox?: { x: number; y: number; w: number; h: number };
  };
  contributorId: string;
  contributorName: string;
  timestamp: string;
  status: AssetStatus;
  isDemo?: boolean;
}

export type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SecurityEvent {
  id: string;
  type: string;
  description: string;
  affectedAssetId: string;
  assetType: 'DATASET' | 'MODEL' | 'INFERENCE' | 'PIPELINE';
  severity: SecuritySeverity;
  expectedHash?: string;
  currentHash?: string;
  timestamp: string;
  resolved: boolean;
}

export interface AuditLog {
  id: string;
  recordType: 'DATA_REGISTERED' | 'MODEL_REGISTERED' | 'INFERENCE_CREATED' | 'OUTPUT_VERIFIED' | 'TAMPERING_DETECTED' | 'VERSION_RESTORED';
  assetId: string;
  hash: string;
  version: string;
  contributorName: string;
  timestamp: string;
  transactionReference: string;
  status: 'VERIFIED' | 'FAILED' | 'PENDING';
  isDemo?: boolean;
}

export interface Contributor {
  id: string;
  name: string;
  role: Role;
  assetsContributed: number;
  lastActivity: string;
  trustStatus: 'TRUSTED' | 'WARNING' | 'REVOKED';
}

export interface Report {
  id: string;
  assetId: string;
  integrityStatus: AssetStatus;
  generatedDate: string;
  contributorName: string;
  blockchainReference: string;
}

export type PipelineStage = 'DATA' | 'MODEL' | 'INFERENCE' | 'OUTPUT';

export interface PipelineStatus {
  overall: AssetStatus;
  stages: Record<PipelineStage, AssetStatus>;
}
