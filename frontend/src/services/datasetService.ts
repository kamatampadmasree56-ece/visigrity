import { apiClient } from './apiClient';
import type { Dataset, AssetStatus } from '../types';

function mapDataset(d: any): Dataset {
  return {
    id: d.id,
    name: d.name,
    description: d.description || '',
    version: d.version,
    hash: d.hash,
    contributorId: d.contributor_id,
    contributorName: d.contributor_name,
    timestamp: d.created_at,
    status: d.status as AssetStatus,
    size: d.size || 0,
  };
}

export const datasetService = {
  async getDatasets(search?: string, status?: string): Promise<Dataset[]> {
    let url = '/datasets';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await apiClient.get<any[]>(url);
    return res.map(mapDataset);
  },

  async createDataset(dataset: Omit<Dataset, 'id' | 'hash' | 'timestamp' | 'status'> & { hash?: string }): Promise<Dataset> {
    const res = await apiClient.post<any>('/datasets', {
      name: dataset.name,
      description: dataset.description,
      version: dataset.version,
      contributor_name: dataset.contributorName,
      hash: dataset.hash,
      size: dataset.size,
    });
    return mapDataset(res);
  },

  async uploadDatasetFile(name: string, description: string, version: string, file: File): Promise<Dataset> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('version', version);
    formData.append('file', file);

    const res = await apiClient.postForm<any>('/datasets/upload', formData);
    return mapDataset(res);
  },

  async verifyDataset(id: string): Promise<Dataset> {
    const res = await apiClient.post<any>(`/datasets/${id}/verify`);
    return mapDataset(res);
  },

  async getDatasetHistory(id: string): Promise<any[]> {
    return apiClient.get<any[]>(`/datasets/${id}/history`);
  },
};
