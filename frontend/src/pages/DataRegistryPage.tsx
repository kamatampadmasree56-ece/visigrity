import React, { useState } from 'react';
import { Plus, Eye, ShieldCheck, History, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/Badge';
import { SearchBar } from '../components/common/SearchBar';
import { HashDisplay } from '../components/common/HashDisplay';
import { Modal } from '../components/common/Modal';
import { formatDate } from '../utils/format';

export const DataRegistryPage: React.FC = () => {
  const { datasets, registerDataset, verifyDataset } = useApp();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<typeof datasets[0] | null>(null);
  const [form, setForm] = useState({ name: '', description: '', version: 'v1.0' });
  const [registering, setRegistering] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const filtered = datasets.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.version.trim()) { setFormError('Name and version are required.'); return; }
    setFormError('');
    setRegistering(true);
    try {
      await registerDataset({
        name: form.name,
        description: form.description,
        version: form.version,
        contributorId: user?.id || 'usr-demo-001',
        contributorName: user?.name || 'Demo Validator',
      });
      showToast(`Dataset "${form.name}" registered successfully.`, 'success');
      setForm({ name: '', description: '', version: 'v1.0' });
      setShowModal(false);
    } catch {
      showToast('Registration failed. Please try again.', 'error');
    } finally {
      setRegistering(false);
    }
  };

  const handleVerify = async (id: string, name: string) => {
    setVerifying(id);
    try {
      await verifyDataset(id);
      showToast(`Dataset "${name}" verified successfully. Hash Match Confirmed.`, 'success');
    } catch {
      showToast('Verification failed.', 'error');
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Data Registry</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Register, verify, and track dataset integrity.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors text-sm"
        >
          <Plus size={18} /> Register Dataset
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search datasets..." className="flex-1 min-w-48" />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#050B14] border border-[#38BDF8]/20 rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50"
        >
          <option value="ALL">All Status</option>
          <option value="TRUSTED">Trusted</option>
          <option value="PENDING">Pending</option>
          <option value="COMPROMISED">Compromised</option>
        </select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#38BDF8]/10 text-xs text-[#94A3B8] uppercase tracking-wider">
                <th className="text-left px-6 py-3 font-medium">Dataset ID</th>
                <th className="text-left px-6 py-3 font-medium">Name</th>
                <th className="text-left px-6 py-3 font-medium">Version</th>
                <th className="text-left px-6 py-3 font-medium hidden md:table-cell">SHA-256</th>
                <th className="text-left px-6 py-3 font-medium hidden lg:table-cell">Contributor</th>
                <th className="text-left px-6 py-3 font-medium hidden lg:table-cell">Timestamp</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(dataset => (
                <motion.tr
                  key={dataset.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-[#38BDF8]/5 hover:bg-[#38BDF8]/3 transition-colors"
                >
                  <td className="px-6 py-4">
                    <code className="text-xs text-[#38BDF8] font-mono">{dataset.id}</code>
                  </td>
                  <td className="px-6 py-4 text-[#F8FAFC] font-medium">{dataset.name}</td>
                  <td className="px-6 py-4 text-[#94A3B8]">{dataset.version}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <code className="text-xs text-[#94A3B8] font-mono">{dataset.hash.slice(0, 16)}...</code>
                  </td>
                  <td className="px-6 py-4 text-[#94A3B8] hidden lg:table-cell">{dataset.contributorName}</td>
                  <td className="px-6 py-4 text-[#94A3B8] hidden lg:table-cell text-xs">{formatDate(dataset.timestamp)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={dataset.status === 'TRUSTED' ? 'TRUSTED' : dataset.status === 'COMPROMISED' ? 'COMPROMISED' : 'PENDING'} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedDataset(dataset); setShowDetailModal(true); }}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-colors"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleVerify(dataset.id, dataset.name)}
                        disabled={verifying === dataset.id}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors disabled:opacity-50"
                        title="Verify Hash"
                      >
                        {verifying === dataset.id
                          ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-3.5 h-3.5 rounded-full border border-[#22C55E]/30 border-t-[#22C55E]" />
                          : <ShieldCheck size={15} />}
                      </button>
                      <button className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#60A5FA] hover:bg-[#60A5FA]/10 transition-colors" title="History">
                        <History size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#94A3B8]">
              <Database size={40} className="mx-auto mb-3 opacity-30" />
              <p>No datasets found matching your filters.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Register Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register Dataset">
        <form onSubmit={handleRegister} className="p-6 space-y-4">
          {formError && <div className="text-sm text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg p-3">{formError}</div>}
          <div>
            <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">Dataset Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. UAV Aerial Dataset Beta"
              className="w-full bg-[#050B14] border border-[#38BDF8]/20 rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of this dataset..."
              rows={3}
              className="w-full bg-[#050B14] border border-[#38BDF8]/20 rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">Version *</label>
            <input
              type="text"
              value={form.version}
              onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
              placeholder="e.g. v1.0"
              className="w-full bg-[#050B14] border border-[#38BDF8]/20 rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50"
            />
          </div>
          <div className="p-3 rounded-lg bg-[#38BDF8]/5 border border-[#38BDF8]/15">
            <p className="text-xs text-[#94A3B8]">
              <span className="text-[#38BDF8] font-medium">Contributor:</span> {user?.name} · {user?.role}
            </p>
            <p className="text-xs text-[#94A3B8] mt-1">
              A SHA-256 demo hash will be generated and this registration will be recorded in the audit log.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 border border-[#38BDF8]/30 text-[#94A3B8] rounded-xl hover:bg-[#0D1B2A] transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={registering}
              className="flex-1 py-2.5 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors disabled:opacity-50 text-sm">
              {registering ? 'Registering...' : 'Register Dataset'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Dataset Details" size="lg">
        {selectedDataset && (
          <div className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Dataset ID', value: selectedDataset.id },
                { label: 'Name', value: selectedDataset.name },
                { label: 'Version', value: selectedDataset.version },
                { label: 'Contributor', value: selectedDataset.contributorName },
                { label: 'Registered', value: formatDate(selectedDataset.timestamp) },
                { label: 'Status', value: selectedDataset.status },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">{f.label}</p>
                  <p className="text-sm font-medium text-[#F8FAFC]">{f.value}</p>
                </div>
              ))}
            </div>
            {selectedDataset.description && (
              <div>
                <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-[#94A3B8]">{selectedDataset.description}</p>
              </div>
            )}
            <HashDisplay hash={selectedDataset.hash} label="SHA-256 Hash" truncate={false} />
            <div className="flex gap-3">
              <button
                onClick={() => { handleVerify(selectedDataset.id, selectedDataset.name); setShowDetailModal(false); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors text-sm"
              >
                <ShieldCheck size={16} /> Verify Hash
              </button>
              <button onClick={() => setShowDetailModal(false)}
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
