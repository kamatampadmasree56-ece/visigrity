import { apiClient } from './apiClient';
import type { Model, AssetStatus } from '../types';

function mapModel(m: any): Model {
  return {
    id: m.id,
    name: m.name,
    description: m.description || '',
    version: m.version,
    framework: m.framework,
    trainingDatasetId: m.training_dataset_id,
    hash: m.hash,
    contributorId: m.contributor_id,
    contributorName: m.contributor_name,
    timestamp: m.created_at,
    status: m.status as AssetStatus,
  };
}

export const modelService = {
  async getModels(search?: string, framework?: string): Promise<Model[]> {
    let url = '/models';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (framework) params.append('framework', framework);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await apiClient.get<any[]>(url);
    return res.map(mapModel);
  },

  async createModel(model: Omit<Model, 'id' | 'hash' | 'timestamp' | 'status'> & { hash?: string }): Promise<Model> {
    const res = await apiClient.post<any>('/models', {
      name: model.name,
      description: model.description,
      version: model.version,
      framework: model.framework,
      training_dataset_id: model.trainingDatasetId,
      contributor_name: model.contributorName,
      hash: model.hash,
    });
    return mapModel(res);
  },

  async uploadModelFile(
    name: string,
    description: string,
    version: string,
    framework: string,
    trainingDatasetId: string,
    file: File
  ): Promise<Model> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('version', version);
    formData.append('framework', framework);
    formData.append('training_dataset_id', trainingDatasetId);
    formData.append('file', file);

    const res = await apiClient.postForm<any>('/models/upload', formData);
    return mapModel(res);
  },

  async verifyModel(id: string): Promise<Model> {
    const res = await apiClient.post<any>(`/models/${id}/verify`);
    return mapModel(res);
  },

  async getModelHistory(id: string): Promise<any[]> {
    return apiClient.get<any[]>(`/models/${id}/history`);
  },
};
