import { apiClient } from './apiClient';
import type { SecurityEvent, SecuritySeverity } from '../types';

function mapSecurityEvent(evt: any): SecurityEvent {
  return {
    id: evt.id,
    type: evt.type,
    description: evt.description,
    affectedAssetId: evt.affected_asset_id,
    assetType: evt.asset_type,
    severity: evt.severity as SecuritySeverity,
    expectedHash: evt.expected_hash,
    currentHash: evt.current_hash,
    timestamp: evt.timestamp,
    resolved: evt.resolved,
  };
}

export const securityService = {
  async getEvents(limit = 50): Promise<SecurityEvent[]> {
    const res = await apiClient.get<any[]>(`/security/events?limit=${limit}`);
    return res.map(mapSecurityEvent);
  },

  async simulateModelTampering(): Promise<{ success: boolean; message: string; event: SecurityEvent }> {
    const res = await apiClient.post<any>('/security/simulate/model-tampering');
    return {
      success: res.success,
      message: res.message,
      event: mapSecurityEvent(res.event),
    };
  },

  async simulateDatasetTampering(): Promise<{ success: boolean; message: string; event: SecurityEvent }> {
    const res = await apiClient.post<any>('/security/simulate/dataset-tampering');
    return {
      success: res.success,
      message: res.message,
      event: mapSecurityEvent(res.event),
    };
  },

  async simulateOutputTampering(): Promise<{ success: boolean; message: string; event: SecurityEvent }> {
    const res = await apiClient.post<any>('/security/simulate/output-tampering');
    return {
      success: res.success,
      message: res.message,
      event: mapSecurityEvent(res.event),
    };
  },

  async resetDemo(): Promise<{ status: string; message: string }> {
    return apiClient.post<{ status: string; message: string }>('/security/reset-demo');
  },
};
