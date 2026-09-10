import { generateDemoHash } from '../utils/hash';
import type {
  Dataset, Model, Inference, SecurityEvent, AuditLog,
  Contributor, PipelineStatus
} from '../types';

const BASE_DATASET_HASH = 'a8f9e3b12c4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0';
const BASE_MODEL_HASH = 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4';
const TAMPERED_MODEL_HASH = 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5';
const BASE_INFERENCE_INPUT_HASH = 'f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1';
const BASE_INFERENCE_OUTPUT_HASH = 'e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2';

export const DEMO_HASHES = {
  dataset: BASE_DATASET_HASH,
  model: BASE_MODEL_HASH,
  tamperedModel: TAMPERED_MODEL_HASH,
  inferenceInput: BASE_INFERENCE_INPUT_HASH,
  inferenceOutput: BASE_INFERENCE_OUTPUT_HASH,
};

export const initialDatasets: Dataset[] = [
  {
    id: 'UAV-DEMO-DATA-001',
    name: 'UAV Aerial Dataset Alpha',
    description: 'High-resolution aerial imagery for vehicle detection in urban environments.',
    version: 'v2.1',
    hash: BASE_DATASET_HASH,
    contributorId: 'usr-demo-001',
    contributorName: 'Demo Validator',
    timestamp: '2026-09-01T10:30:00Z',
    status: 'TRUSTED',
    size: 4096,
  },
  {
    id: 'UAV-DEMO-DATA-002',
    name: 'Parking Lot Overhead Survey',
    description: 'Annotated parking lot imagery for vehicle count and occupancy analysis.',
    version: 'v1.0',
    hash: generateDemoHash('UAV-DEMO-DATA-002-v1.0'),
    contributorId: 'usr-demo-002',
    contributorName: 'Alex Chen',
    timestamp: '2026-08-28T14:15:00Z',
    status: 'TRUSTED',
    size: 2048,
  },
  {
    id: 'UAV-DEMO-DATA-003',
    name: 'Traffic Flow Analysis Set',
    description: 'Time-series road video dataset for traffic density assessment.',
    version: 'v1.2',
    hash: generateDemoHash('UAV-DEMO-DATA-003-v1.2'),
    contributorId: 'usr-demo-003',
    contributorName: 'Maria Santos',
    timestamp: '2026-08-25T09:00:00Z',
    status: 'PENDING',
    size: 8192,
  },
];

export const initialModels: Model[] = [
  {
    id: 'VISI-YOLO-DEMO',
    name: 'VISI-YOLO-DEMO',
    description: 'Primary vehicle detection model for UAV imagery. Demo instance only.',
    version: 'v2.1',
    framework: 'PyTorch / YOLO',
    trainingDatasetId: 'UAV-DEMO-DATA-001',
    hash: BASE_MODEL_HASH,
    contributorId: 'usr-demo-002',
    contributorName: 'Alex Chen',
    timestamp: '2026-09-02T11:00:00Z',
    status: 'TRUSTED',
  },
  {
    id: 'VISI-YOLO-LITE',
    name: 'VISI-YOLO-LITE',
    description: 'Lightweight model for edge deployment. Reduced parameter count.',
    version: 'v1.0',
    framework: 'ONNX',
    trainingDatasetId: 'UAV-DEMO-DATA-002',
    hash: generateDemoHash('VISI-YOLO-LITE-v1.0'),
    contributorId: 'usr-demo-003',
    contributorName: 'Maria Santos',
    timestamp: '2026-09-03T14:00:00Z',
    status: 'TRUSTED',
  },
];

export const initialInferences: Inference[] = [
  {
    id: 'INF-DEMO-001',
    modelId: 'VISI-YOLO-DEMO',
    modelName: 'VISI-YOLO-DEMO',
    modelVersion: 'v2.1',
    inputHash: BASE_INFERENCE_INPUT_HASH,
    modelHash: BASE_MODEL_HASH,
    outputHash: BASE_INFERENCE_OUTPUT_HASH,
    result: {
      label: 'Vehicle',
      confidence: 94.2,
      boundingBox: { x: 20, y: 30, w: 55, h: 35 },
    },
    contributorId: 'usr-demo-001',
    contributorName: 'Demo Validator',
    timestamp: '2026-09-10T08:00:00Z',
    status: 'TRUSTED',
    isDemo: true,
  },
];

export const initialSecurityEvents: SecurityEvent[] = [
  {
    id: 'SEC-001',
    type: 'HASH_VERIFICATION_SUCCESS',
    description: 'Pipeline integrity verified. All stage hashes match baseline records.',
    affectedAssetId: 'PIPELINE',
    assetType: 'PIPELINE',
    severity: 'LOW',
    timestamp: '2026-09-10T06:00:00Z',
    resolved: true,
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'AUDIT-001',
    recordType: 'DATA_REGISTERED',
    assetId: 'UAV-DEMO-DATA-001',
    hash: BASE_DATASET_HASH,
    version: 'v2.1',
    contributorName: 'Demo Validator',
    timestamp: '2026-09-01T10:30:00Z',
    transactionReference: 'DEMO-AUDIT-001',
    status: 'VERIFIED',
    isDemo: true,
  },
  {
    id: 'AUDIT-002',
    recordType: 'MODEL_REGISTERED',
    assetId: 'VISI-YOLO-DEMO',
    hash: BASE_MODEL_HASH,
    version: 'v2.1',
    contributorName: 'Alex Chen',
    timestamp: '2026-09-02T11:00:00Z',
    transactionReference: 'DEMO-AUDIT-002',
    status: 'VERIFIED',
    isDemo: true,
  },
  {
    id: 'AUDIT-003',
    recordType: 'INFERENCE_CREATED',
    assetId: 'INF-DEMO-001',
    hash: BASE_INFERENCE_OUTPUT_HASH,
    version: 'v1',
    contributorName: 'Demo Validator',
    timestamp: '2026-09-10T08:00:00Z',
    transactionReference: 'DEMO-AUDIT-003',
    status: 'VERIFIED',
    isDemo: true,
  },
];

export const initialContributors: Contributor[] = [
  {
    id: 'usr-demo-001',
    name: 'Demo Validator',
    role: 'VALIDATOR',
    assetsContributed: 3,
    lastActivity: '2026-09-10T08:00:00Z',
    trustStatus: 'TRUSTED',
  },
  {
    id: 'usr-demo-002',
    name: 'Alex Chen',
    role: 'MODEL DEVELOPER',
    assetsContributed: 2,
    lastActivity: '2026-09-03T14:00:00Z',
    trustStatus: 'TRUSTED',
  },
  {
    id: 'usr-demo-003',
    name: 'Maria Santos',
    role: 'DATA CONTRIBUTOR',
    assetsContributed: 2,
    lastActivity: '2026-08-28T09:00:00Z',
    trustStatus: 'TRUSTED',
  },
];

export const initialPipelineStatus: PipelineStatus = {
  overall: 'TRUSTED',
  stages: {
    DATA: 'TRUSTED',
    MODEL: 'TRUSTED',
    INFERENCE: 'TRUSTED',
    OUTPUT: 'TRUSTED',
  },
};


