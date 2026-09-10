import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, CheckCircle2, RotateCcw, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/Badge';
import { HashDisplay } from '../components/common/HashDisplay';
import { Modal } from '../components/common/Modal';
import { formatDate } from '../utils/format';

type Tab = 'datasets' | 'models' | 'inferences';

export const VersionControlPage: React.FC = () => {
  const { datasets, models, inferences, addAuditLog } = useApp();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('datasets');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleRestore = (item: any, _type: string) => {
    addAuditLog({
      recordType: 'VERSION_RESTORED',
      assetId: item.id,
      hash: item.hash,
      version: item.version,
      contributorName: 'Demo Validator',
      status: 'VERIFIED',
    });
    showToast(`Version ${item.version} of ${item.name} marked as trusted and audit event created.`, 'success');
  };

  const tabs = [
    { id: 'datasets' as Tab, label: 'Datasets', count: datasets.length },
    { id: 'models' as Tab, label: 'Models', count: models.length },
    { id: 'inferences' as Tab, label: 'Inferences', count: inferences.length },
  ];

  const items = tab === 'datasets' ? datasets : tab === 'models' ? models : inferences;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Version Control</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Track all versioned assets with complete hash history. History is never deleted.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0D1B2A] rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === t.id
                ? 'bg-[#38BDF8] text-[#050B14] font-bold'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#38BDF8]/10 text-xs text-[#94A3B8] uppercase tracking-wider">
                <th className="text-left px-6 py-3 font-medium">Asset</th>
                <th className="text-left px-6 py-3 font-medium">Version</th>
                <th className="text-left px-6 py-3 font-medium hidden md:table-cell">SHA-256</th>
                <th className="text-left px-6 py-3 font-medium hidden lg:table-cell">Contributor</th>
                <th className="text-left px-6 py-3 font-medium hidden lg:table-cell">Timestamp</th>
                <th className="text-left px-6 py-3 font-medium">Trust Status</th>
                <th className="text-left px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(items as any[]).map((item, i) => (
                <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-[#38BDF8]/5 hover:bg-[#38BDF8]/3 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#F8FAFC]">{item.name || item.modelName}</p>
                    <code className="text-xs text-[#38BDF8] font-mono">{item.id}</code>
                  </td>
                  <td className="px-6 py-4 text-[#94A3B8]">{item.version || item.modelVersion || 'v1'}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <code className="text-xs text-[#94A3B8] font-mono">{(item.hash || item.outputHash || '').slice(0, 16)}...</code>
                  </td>
                  <td className="px-6 py-4 text-[#94A3B8] hidden lg:table-cell">{item.contributorName}</td>
                  <td className="px-6 py-4 text-[#94A3B8] text-xs hidden lg:table-cell">{formatDate(item.timestamp)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status === 'TRUSTED' ? 'TRUSTED' : item.status === 'COMPROMISED' ? 'COMPROMISED' : 'PENDING'} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedItem(item)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-colors" title="View Hash">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => handleRestore(item, tab)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors" title="Mark Trusted / Restore">
                        <RotateCcw size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#60A5FA] hover:bg-[#60A5FA]/10 transition-colors" title="Compare">
                        <GitBranch size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Hash View Modal */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="Hash Details">
        {selectedItem && (
          <div className="p-6 space-y-4">
            <p className="text-sm font-medium text-[#F8FAFC]">{selectedItem.name || selectedItem.modelName}</p>
            <p className="text-xs text-[#94A3B8]">Version: {selectedItem.version || selectedItem.modelVersion}</p>
            <HashDisplay hash={selectedItem.hash || selectedItem.outputHash || ''} label="SHA-256 Hash" truncate={false} />
            <div className="flex gap-3">
              <button onClick={() => { handleRestore(selectedItem, tab); setSelectedItem(null); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold rounded-xl transition-colors text-sm">
                <CheckCircle2 size={16} /> Mark Trusted & Create Audit Event
              </button>
              <button onClick={() => setSelectedItem(null)}
                className="flex-1 py-2.5 border border-[#38BDF8]/30 text-[#94A3B8] rounded-xl hover:bg-[#0D1B2A] transition-colors text-sm">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
