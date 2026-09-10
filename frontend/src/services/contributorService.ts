import { apiClient } from './apiClient';
import type { Contributor, Role } from '../types';

function mapContributor(c: any): Contributor {
  return {
    id: c.id,
    name: c.name,
    role: c.role as Role,
    assetsContributed: c.assets_contributed,
    lastActivity: c.last_activity,
    trustStatus: c.trust_status,
  };
}

export const contributorService = {
  async getContributors(): Promise<Contributor[]> {
    const res = await apiClient.get<any[]>('/contributors');
    return res.map(mapContributor);
  },

  async getContributor(id: string): Promise<Contributor> {
    const res = await apiClient.get<any>(`/contributors/${id}`);
    return mapContributor(res);
  },

  async getContributorActivity(id: string): Promise<any> {
    return apiClient.get<any>(`/contributors/${id}/activity`);
  },
};
