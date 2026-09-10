import { apiClient } from './apiClient';
import type { Report, AssetStatus } from '../types';

function mapReport(r: any): Report {
  return {
    id: r.id,
    assetId: r.asset_id,
    integrityStatus: r.integrity_status as AssetStatus,
    generatedDate: r.generated_date,
    contributorName: r.contributor_name,
    blockchainReference: r.blockchain_reference,
  };
}

export const reportService = {
  async getReports(): Promise<Report[]> {
    const res = await apiClient.get<any[]>('/reports');
    return res.map(mapReport);
  },

  async createReport(assetId?: string, contributorName?: string): Promise<Report> {
    const res = await apiClient.post<any>('/reports', {
      asset_id: assetId || 'PIPELINE',
      contributor_name: contributorName || 'Demo Validator',
    });
    return mapReport(res);
  },

  async getReport(id: string): Promise<any> {
    return apiClient.get<any>(`/reports/${id}`);
  },

  async downloadReportPdf(id: string): Promise<void> {
    const blob = await apiClient.getBlob(`/reports/${id}/pdf`);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visigrity-dossier-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
