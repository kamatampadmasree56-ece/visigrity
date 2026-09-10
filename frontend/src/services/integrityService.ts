import { apiClient } from './apiClient';
import type { PipelineStatus, AssetStatus } from '../types';

export interface IntegrityVerifyResult {
  status: 'TRUSTED' | 'COMPROMISED';
  stages: {
    data: string;
    model: string;
    input: string;
    inference: string;
    output: string;
  };
  reason?: string;
  verified_at: string;
  asset_id?: string;
}

export const integrityService = {
  async getPipelineStatus(): Promise<PipelineStatus> {
    const res = await apiClient.get<{ overall: string; stages: Record<string, string> }>('/integrity/status');
    return {
      overall: res.overall as AssetStatus,
      stages: {
        DATA: res.stages.DATA as AssetStatus,
        MODEL: res.stages.MODEL as AssetStatus,
        INFERENCE: res.stages.INFERENCE as AssetStatus,
        OUTPUT: res.stages.OUTPUT as AssetStatus,
      },
    };
  },

  async verifyPipeline(assetId?: string, assetType?: string): Promise<IntegrityVerifyResult> {
    return apiClient.post<IntegrityVerifyResult>('/integrity/verify', {
      asset_id: assetId || 'PIPELINE',
      asset_type: assetType || 'PIPELINE',
    });
  },
};
