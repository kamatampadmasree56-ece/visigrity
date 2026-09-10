import React from 'react';
import { motion } from 'framer-motion';
import { Users, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/Badge';
import { Badge } from '../components/common/Badge';
import { timeAgo } from '../utils/format';

const roleColors: Record<string, string> = {
  'ADMIN': 'primary',
  'DATA CONTRIBUTOR': 'info',
  'MODEL DEVELOPER': 'success',
  'VALIDATOR': 'warning',
  'INFERENCE OPERATOR': 'secondary',
};

export const ContributorsPage: React.FC = () => {
  const { contributors, auditLogs } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Contributor Accountability</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Track contributor activity, roles, and trust status across the pipeline.</p>
      </div>

      {/* Contributors table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-[#38BDF8]/10 flex items-center gap-2">
          <Users size={18} className="text-[#38BDF8]" />
          <h2 className="text-base font-semibold text-[#F8FAFC]">Contributors</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#38BDF8]/10 text-xs text-[#94A3B8] uppercase tracking-wider">
                <th className="text-left px-6 py-3 font-medium">Contributor</th>
                <th className="text-left px-6 py-3 font-medium">Role</th>
                <th className="text-left px-6 py-3 font-medium">Assets</th>
                <th className="text-left px-6 py-3 font-medium hidden md:table-cell">Last Activity</th>
                <th className="text-left px-6 py-3 font-medium">Trust Status</th>
              </tr>
            </thead>
            <tbody>
              {contributors.map(c => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-[#38BDF8]/5 hover:bg-[#38BDF8]/3 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#38BDF8]/20 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] font-bold text-sm flex-shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[#F8FAFC]">{c.name}</p>
                        <p className="text-xs text-[#94A3B8]">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={roleColors[c.role] as any || 'secondary'}>{c.role}</Badge>
                  </td>
                  <td className="px-6 py-4 text-[#94A3B8]">{c.assetsContributed} assets</td>
                  <td className="px-6 py-4 text-[#94A3B8] hidden md:table-cell text-xs">{timeAgo(c.lastActivity)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={c.trustStatus === 'TRUSTED' ? 'TRUSTED' : c.trustStatus === 'WARNING' ? 'WARNING' : 'COMPROMISED'} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Activity timeline */}
      <Card>
        <div className="px-6 py-4 border-b border-[#38BDF8]/10 flex items-center gap-2">
          <Activity size={18} className="text-[#38BDF8]" />
          <h2 className="text-base font-semibold text-[#F8FAFC]">Activity Timeline</h2>
        </div>
        <div className="px-6 py-4">
          <div className="relative pl-8">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-[#38BDF8]/15" />
            <div className="space-y-4">
              {auditLogs.slice(0, 8).map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative"
                >
                  <div className={`absolute -left-10 top-1.5 w-3 h-3 rounded-full ${log.status === 'VERIFIED' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-[#F8FAFC]">
                        {log.contributorName}
                        <span className="text-[#94A3B8] font-normal ml-2">{log.recordType.replace(/_/g, ' ').toLowerCase()}</span>
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        Asset: <code className="text-[#38BDF8]">{log.assetId}</code>
                      </p>
                    </div>
                    <span className="text-xs text-[#94A3B8] flex-shrink-0">{timeAgo(log.timestamp)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
