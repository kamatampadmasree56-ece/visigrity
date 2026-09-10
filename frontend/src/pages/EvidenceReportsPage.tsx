import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Eye, Download, Printer, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { VisigrityLogo } from '../components/common/Logo';
import { formatDate, timeAgo } from '../utils/format';
import type { Report } from '../types';

export const EvidenceReportsPage: React.FC = () => {
  const { reports, generateReport, datasets, models, inferences, pipelineStatus, securityEvents } = useApp();
  const { showToast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const report = await generateReport();
      showToast('Report generated successfully.', 'success');
      setViewReport(report);
    } catch {
      showToast('Report generation failed.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
    showToast('Sending report to printer...', 'info');
  };

  const handleDownload = async (reportId?: string) => {
    const idToDownload = reportId || viewReport?.id;
    if (idToDownload) {
      try {
        showToast('Downloading compliance dossier...', 'info');
        await import('../services/reportService').then(m => m.reportService.downloadReportPdf(idToDownload));
      } catch (err) {
        showToast('Failed to download PDF.', 'error');
      }
    } else {
      showToast('No report selected.', 'error');
    }
  };

  const demoDataset = datasets.find(d => d.id === 'UAV-DEMO-DATA-001');
  const demoModel = models.find(m => m.id === 'VISI-YOLO-DEMO');
  const demoInference = inferences.find(i => i.id === 'INF-DEMO-001') || inferences[0];
  const isCompromised = pipelineStatus.overall === 'COMPROMISED';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Evidence & Audit Reports</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Generate integrity evidence reports with full provenance chain.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors text-sm disabled:opacity-50"
        >
          {generating
            ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-4 h-4 rounded-full border-2 border-[#050B14]/30 border-t-[#050B14]" />
            : <Plus size={18} />}
          {generating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* Reports list */}
      {reports.length === 0 ? (
        <Card>
          <div className="px-6 py-16 text-center">
            <FileText size={40} className="mx-auto mb-3 text-[#94A3B8]/40" />
            <p className="text-[#94A3B8]">No reports generated yet. Click "Generate Report" to create one.</p>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(report => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="h-full">
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <code className="text-xs text-[#38BDF8] font-mono">{report.id}</code>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{timeAgo(report.generatedDate)}</p>
                    </div>
                    <StatusBadge status={report.integrityStatus === 'TRUSTED' ? 'TRUSTED' : 'COMPROMISED'} />
                  </div>
                  <div className="space-y-1 text-xs text-[#94A3B8] mb-4">
                    <p>Asset: <span className="text-[#F8FAFC]">{report.assetId}</span></p>
                    <p>Contributor: <span className="text-[#F8FAFC]">{report.contributorName}</span></p>
                    <p>Ref: <code className="text-[#F59E0B]">{report.blockchainReference}</code></p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewReport(report)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#38BDF8]/30 text-[#38BDF8] hover:bg-[#38BDF8]/10 rounded-lg transition-colors text-xs font-medium"
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#38BDF8]/30 text-[#94A3B8] hover:bg-[#0D1B2A] rounded-lg transition-colors text-xs font-medium"
                    >
                      <Printer size={13} /> Print
                    </button>
                    <button
                      onClick={() => handleDownload(report.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#38BDF8]/30 text-[#94A3B8] hover:bg-[#0D1B2A] rounded-lg transition-colors text-xs font-medium"
                    >
                      <Download size={13} /> PDF
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Report Preview Modal */}
      <Modal isOpen={!!viewReport} onClose={() => setViewReport(null)} title="Audit Report Preview" size="xl">
        {viewReport && (
          <div ref={reportRef} className="p-6">
            {/* Report header */}
            <div className="flex items-start justify-between border-b border-[#38BDF8]/10 pb-5 mb-5">
              <VisigrityLogo size={40} />
              <div className="text-right">
                <p className="text-xs text-[#94A3B8]">Report ID</p>
                <code className="text-[#38BDF8] font-mono text-sm">{viewReport.id}</code>
                <p className="text-xs text-[#94A3B8] mt-1">Generated: {formatDate(viewReport.generatedDate)}</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-[#F8FAFC] mb-1">Pipeline Integrity Audit Report</h2>
            <p className="text-xs text-[#94A3B8] mb-5">This report documents the integrity verification status of the VISIGRITY computer vision pipeline at the time of generation.</p>

            {/* Overall status */}
            <div className={`p-4 rounded-xl border mb-5 flex items-center gap-3 ${isCompromised ? 'bg-[#EF4444]/5 border-[#EF4444]/30' : 'bg-[#22C55E]/5 border-[#22C55E]/30'}`}>
              {isCompromised
                ? <AlertTriangle size={20} className="text-[#EF4444] flex-shrink-0" />
                : <CheckCircle2 size={20} className="text-[#22C55E] flex-shrink-0" />}
              <div>
                <p className={`font-bold text-sm ${isCompromised ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                  Integrity Status: {isCompromised ? 'COMPROMISED' : 'TRUSTED'}
                </p>
                <p className="text-xs text-[#94A3B8]">
                  {isCompromised
                    ? 'One or more pipeline stages failed hash verification. See details below.'
                    : 'All pipeline stages passed hash verification at the time of this report.'}
                </p>
              </div>
            </div>

            {/* Pipeline assets */}
            <div className="space-y-4 mb-5">
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Pipeline Assets</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Dataset', value: demoDataset?.name || 'UAV-DEMO-DATA-001', hash: demoDataset?.hash || '', status: demoDataset?.status || 'TRUSTED' },
                  { label: 'Model', value: demoModel?.name || 'VISI-YOLO-DEMO', hash: demoModel?.hash || '', status: demoModel?.status || 'TRUSTED' },
                  { label: 'Inference', value: demoInference?.id || 'INF-DEMO-001', hash: demoInference?.outputHash || '', status: demoInference?.status || 'TRUSTED' },
                  { label: 'Contributor', value: viewReport.contributorName, hash: '', status: 'TRUSTED' },
                ].map(item => (
                  <div key={item.label} className="bg-[#050B14] rounded-lg p-3 border border-[#38BDF8]/10">
                    <p className="text-[#94A3B8] uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-[#F8FAFC] font-medium mb-1">{item.value}</p>
                    {item.hash && <code className="text-[#38BDF8] font-mono break-all">{item.hash.slice(0, 24)}...</code>}
                    <p className={`mt-1 font-bold ${item.status === 'TRUSTED' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>{item.status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Security events */}
            {securityEvents.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-[#F8FAFC] mb-3">Security Events ({securityEvents.length})</h3>
                <div className="space-y-2">
                  {securityEvents.slice(0, 3).map(evt => (
                    <div key={evt.id} className="text-xs bg-[#050B14] rounded-lg p-3 border border-[#EF4444]/10">
                      <span className="font-medium text-[#EF4444]">{evt.type.replace(/_/g, ' ')}</span>
                      <span className="text-[#94A3B8] ml-2">{formatDate(evt.timestamp)}</span>
                      <p className="text-[#94A3B8] mt-1">{evt.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blockchain reference */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-[#F8FAFC] mb-2">Blockchain Reference</h3>
              <div className="bg-[#050B14] rounded-lg p-3 border border-[#F59E0B]/20">
                <p className="text-xs text-[#94A3B8]">Demo Reference (Phase 2 will use real blockchain):</p>
                <code className="text-[#F59E0B] font-mono text-sm">{viewReport.blockchainReference}</code>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-xl bg-[#0D1B2A] border border-[#38BDF8]/10 text-xs text-[#94A3B8]">
              <strong className="text-[#F8FAFC]">Disclaimer:</strong> This report verifies pipeline integrity through SHA-256 hash comparison.
              It does not assert the factual correctness of any AI inference output. "Pipeline Integrity Verified" means that
              recorded hashes match baseline records — not that AI predictions are accurate.
              This is a Phase 1 demo report. Phase 2 will include cryptographically signed PDF reports.
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-5 pt-5 border-t border-[#38BDF8]/10">
              <button onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 border border-[#38BDF8]/30 text-[#94A3B8] rounded-xl hover:bg-[#0D1B2A] transition-colors text-sm">
                <Printer size={15} /> Print
              </button>
              <button onClick={() => handleDownload()}
                className="flex items-center gap-2 px-4 py-2 border border-[#38BDF8]/30 text-[#94A3B8] rounded-xl hover:bg-[#0D1B2A] transition-colors text-sm">
                <Download size={15} /> Download PDF (Demo)
              </button>
              <button onClick={() => setViewReport(null)}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors text-sm">
                <X size={15} /> Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
