import React from 'react';
import { motion } from 'framer-motion';
import { Link2, CheckCircle2, Database, Brain, FlaskConical, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/Badge';
import { HashDisplay } from '../components/common/HashDisplay';
import { formatDate } from '../utils/format';

const recordTypeIcons: Record<string, React.ReactNode> = {
  DATA_REGISTERED: <Database size={16} />,
  MODEL_REGISTERED: <Brain size={16} />,
  INFERENCE_CREATED: <FlaskConical size={16} />,
  OUTPUT_VERIFIED: <Eye size={16} />,
  TAMPERING_DETECTED: <span className="text-[#EF4444] font-bold text-xs">⚠</span>,
  VERSION_RESTORED: <CheckCircle2 size={16} />,
};

export const BlockchainAuditPage: React.FC = () => {
  const { auditLogs } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Blockchain Audit Trail</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Immutable record of all pipeline integrity events.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30">
          <span className="text-sm font-bold text-[#F59E0B]">BLOCKCHAIN MODE: DEMO</span>
        </div>
      </div>

      {/* Demo disclaimer */}
      <div className="p-4 rounded-xl bg-[#0D1B2A] border border-[#F59E0B]/20">
        <p className="text-xs text-[#94A3B8]">
          <span className="text-[#F59E0B] font-semibold">Demo Mode:</span> Blockchain records shown here are controlled demo references only.
          No real blockchain transactions are generated in Phase 1. References prefixed with <code className="text-[#38BDF8]">DEMO-</code> are simulated audit records.
          Real blockchain integration is planned for Phase 2.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-[#38BDF8]/15" />
        <div className="space-y-4 pl-14">
          {auditLogs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="relative"
            >
              {/* Timeline dot */}
              <div className={`absolute -left-10 top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center ${log.status === 'VERIFIED' ? 'bg-[#22C55E] border-[#22C55E]' : 'bg-[#EF4444] border-[#EF4444]'}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              <Card>
                <div className="px-5 py-4">
                  <div className="flex flex-wrap items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg text-[#38BDF8] bg-[#38BDF8]/10`}>
                      {recordTypeIcons[log.recordType] || <Link2 size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[#F8FAFC]">
                          {log.recordType.replace(/_/g, ' ')}
                        </span>
                        <StatusBadge status={log.status === 'VERIFIED' ? 'VERIFIED' : 'FAILED'} />
                        {log.isDemo && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 font-medium">DEMO</span>
                        )}
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{formatDate(log.timestamp)}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-[#94A3B8] uppercase tracking-wider mb-1">Asset ID</p>
                      <code className="text-[#38BDF8] font-mono">{log.assetId}</code>
                    </div>
                    <div>
                      <p className="text-[#94A3B8] uppercase tracking-wider mb-1">Version</p>
                      <span className="text-[#F8FAFC]">{log.version}</span>
                    </div>
                    <div>
                      <p className="text-[#94A3B8] uppercase tracking-wider mb-1">Contributor</p>
                      <span className="text-[#F8FAFC]">{log.contributorName}</span>
                    </div>
                    <div>
                      <p className="text-[#94A3B8] uppercase tracking-wider mb-1">Tx Reference</p>
                      <code className="text-[#F59E0B] font-mono">{log.transactionReference}</code>
                    </div>
                  </div>

                  <div className="mt-3">
                    <HashDisplay hash={log.hash} label="Record Hash" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
