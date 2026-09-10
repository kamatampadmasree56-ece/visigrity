import { apiClient } from './apiClient';
import type { AuditLog } from '../types';

function mapAuditLog(a: any): AuditLog {
  return {
    id: a.id,
    recordType: a.record_type,
    assetId: a.asset_id,
    hash: a.hash,
    version: a.version,
    contributorName: a.contributor_name,
    timestamp: a.timestamp,
    transactionReference: a.transaction_reference,
    status: a.status,
    isDemo: a.is_demo,
  };
}

export const auditService = {
  async getLogs(skip = 0, limit = 100, recordType?: string, assetId?: string): Promise<AuditLog[]> {
    let url = `/audit?skip=${skip}&limit=${limit}`;
    if (recordType) url += `&record_type=${encodeURIComponent(recordType)}`;
    if (assetId) url += `&asset_id=${encodeURIComponent(assetId)}`;

    const res = await apiClient.get<any[]>(url);
    return res.map(mapAuditLog);
  },

  async createLog(log: Omit<AuditLog, 'id' | 'timestamp' | 'transactionReference'>): Promise<AuditLog> {
    const res = await apiClient.post<any>('/audit', {
      record_type: log.recordType,
      asset_id: log.assetId,
      hash: log.hash,
      version: log.version,
      contributor_name: log.contributorName,
      status: log.status,
      is_demo: log.isDemo !== false,
    });
    return mapAuditLog(res);
  },

  async getLogsByAsset(assetId: string): Promise<AuditLog[]> {
    const res = await apiClient.get<any[]>(`/audit/${assetId}`);
    return res.map(mapAuditLog);
  },
};
