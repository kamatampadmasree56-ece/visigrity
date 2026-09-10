import { apiClient } from './apiClient';
import type { Inference, AssetStatus } from '../types';

function mapInference(inf: any): Inference {
  return {
    id: inf.id,
    modelId: inf.model_id,
    modelName: inf.model_name,
    modelVersion: inf.model_version,
    inputHash: inf.input_hash,
    modelHash: inf.model_hash,
    outputHash: inf.output_hash,
    result: inf.result,
    contributorId: inf.contributor_id,
    contributorName: inf.contributor_name,
    timestamp: inf.created_at,
    status: inf.status as AssetStatus,
    isDemo: inf.is_demo,
  };
}

export const inferenceService = {
  async getInferences(limit = 50): Promise<Inference[]> {
    const res = await apiClient.get<any[]>(`/inferences?limit=${limit}`);
    return res.map(mapInference);
  },

  async runInference(modelId: string, inputHash?: string): Promise<Inference> {
    const res = await apiClient.post<any>('/inferences', {
      model_id: modelId,
      input_hash: inputHash,
      is_demo: true,
    });
    return mapInference(res);
  },

  async runInferenceWithFile(modelId: string, file: File): Promise<Inference> {
    const formData = new FormData();
    formData.append('model_id', modelId);
    formData.append('file', file);

    const res = await apiClient.postForm<any>('/inferences/run-with-file', formData);
    return mapInference(res);
  },

  async verifyInference(id: string): Promise<Inference> {
    const res = await apiClient.post<any>(`/inferences/${id}/verify`);
    return mapInference(res);
  },
};
