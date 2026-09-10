import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database, Brain, FlaskConical, Eye, ShieldCheck, AlertTriangle,
  CheckCircle2, Activity, Users, TrendingUp
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/Badge';
import { timeAgo } from '../utils/format';

const integrityTrendData = [
  { time: 'Day 1', score: 100, alerts: 0 },
  { time: 'Day 2', score: 100, alerts: 0 },
  { time: 'Day 3', score: 98, alerts: 1 },
  { time: 'Day 4', score: 100, alerts: 0 },
  { time: 'Day 5', score: 100, alerts: 0 },
  { time: 'Day 6', score: 100, alerts: 0 },
  { time: 'Today', score: 100, alerts: 0 },
];

const verificationData = [
  { name: 'Datasets', verified: 22, pending: 2 },
  { name: 'Models', verified: 12, pending: 0 },
  { name: 'Inferences', verified: 180, pending: 4 },
];

const tooltipStyle = {
  backgroundColor: '#0B1624',
  border: '1px solid rgba(56,189,248,0.2)',
  borderRadius: '8px',
  color: '#F8FAFC',
  fontSize: '12px',
};

export const CommandCenterPage: React.FC = () => {
  const { pipelineStatus, datasets, models, inferences, securityEvents, auditLogs, contributors, verifyPipeline, isVerifyingPipeline } = useApp();
  const { showToast } = useToast();
  const [lastVerified, setLastVerified] = useState<string | null>(null);

  const activeAlerts = securityEvents.filter(e => !e.resolved);
  const isCompromised = pipelineStatus.overall === 'COMPROMISED';

  const handleVerify = async () => {
    await verifyPipeline();
    setLastVerified(new Date().toISOString());
    if (pipelineStatus.overall === 'COMPROMISED') {
      showToast('⚠ Pipeline integrity compromised. Check Attack Lab for details.', 'error');
    } else {
      showToast('Pipeline integrity verified. All stages trusted.', 'success');
    }
  };

  const stages = [
    { label: 'DATA', icon: <Database size={18} />, status: pipelineStatus.stages.DATA },
    { label: 'MODEL', icon: <Brain size={18} />, status: pipelineStatus.stages.MODEL },
    { label: 'INFERENCE', icon: <FlaskConical size={18} />, status: pipelineStatus.stages.INFERENCE },
    { label: 'OUTPUT', icon: <Eye size={18} />, status: pipelineStatus.stages.OUTPUT },
  ];

  const chartData = integrityTrendData.map((d, i) => ({
    ...d,
    alerts: i === integrityTrendData.length - 1 ? activeAlerts.length : d.alerts,
    score: isCompromised && i === integrityTrendData.length - 1 ? 60 : d.score,
  }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Pipeline Security Command Center</h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Real-time integrity monitoring across your computer vision pipeline.
          </p>
        </div>
        <button
          onClick={handleVerify}
          disabled={isVerifyingPipeline}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors disabled:opacity-60 text-sm"
        >
          {isVerifyingPipeline ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-4 h-4 rounded-full border-2 border-[#050B14]/30 border-t-[#050B14]" />
          ) : <ShieldCheck size={18} />}
          {isVerifyingPipeline ? 'Verifying...' : 'Verify Pipeline'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Registered Datasets" value={datasets.length} icon={<Database size={22} />} color="blue" />
        <StatCard title="Registered Models" value={models.length} icon={<Brain size={22} />} color="blue" />
        <StatCard title="Total Inferences" value={inferences.length} icon={<FlaskConical size={22} />} color="green" />
        <StatCard title="Active Security Alerts" value={activeAlerts.length} icon={<AlertTriangle size={22} />} color={activeAlerts.length > 0 ? 'red' : 'green'} />
      </div>

      {/* Pipeline status */}
      <Card>
        <div className="px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <h2 className="text-base font-semibold text-[#F8FAFC]">Pipeline Integrity Status</h2>
            {lastVerified && (
              <span className="text-xs text-[#94A3B8]">Last verified: {timeAgo(lastVerified)}</span>
            )}
          </div>

          {/* Stage indicators */}
          <div className="flex flex-wrap gap-3 mb-5">
            {stages.map((stage, i) => (
              <React.Fragment key={stage.label}>
                <div className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium
                  ${stage.status === 'TRUSTED'
                    ? 'bg-[#22C55E]/5 border-[#22C55E]/30 text-[#22C55E]'
                    : stage.status === 'COMPROMISED'
                      ? 'bg-[#EF4444]/5 border-[#EF4444]/30 text-[#EF4444]'
                      : 'bg-[#F59E0B]/5 border-[#F59E0B]/30 text-[#F59E0B]'
                  }
                `}>
                  {stage.icon}
                  <span>{stage.label}</span>
                  {stage.status === 'TRUSTED'
                    ? <CheckCircle2 size={14} />
                    : stage.status === 'COMPROMISED'
                      ? <span className="font-bold">✕</span>
                      : <AlertTriangle size={14} />
                  }
                </div>
                {i < stages.length - 1 && (
                  <div className="flex items-center text-[#94A3B8]/30 text-lg font-bold">→</div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Overall status */}
          <motion.div
            key={pipelineStatus.overall}
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            className={`
              p-4 rounded-xl border text-center font-bold text-sm
              ${isCompromised
                ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                : 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
              }
            `}
          >
            {isCompromised ? '⚠ PIPELINE COMPROMISED — Integrity Verification Required' : '🟢 PIPELINE TRUSTED — All Stages Hash-Verified'}
          </motion.div>
        </div>
      </Card>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Integrity Trend */}
        <Card>
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-[#38BDF8]" />
              <h2 className="text-base font-semibold text-[#F8FAFC]">Integrity Score Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="integrityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.08)" />
                <XAxis dataKey="time" stroke="#94A3B8" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#94A3B8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="score" stroke="#38BDF8" fill="url(#integrityGrad)" strokeWidth={2} name="Score %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Verification stats */}
        <Card>
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-[#38BDF8]" />
              <h2 className="text-base font-semibold text-[#F8FAFC]">Verification Statistics</h2>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={verificationData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.08)" />
                <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="verified" fill="#22C55E" radius={[4, 4, 0, 0]} name="Verified" />
                <Bar dataKey="pending" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent activity + Security events */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Audit Logs */}
        <Card>
          <div className="px-6 py-5">
            <h2 className="text-base font-semibold text-[#F8FAFC] mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-[#38BDF8]/5 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.status === 'VERIFIED' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#F8FAFC]">{log.recordType.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-[#94A3B8] truncate">{log.assetId}</p>
                  </div>
                  <span className="text-xs text-[#94A3B8] flex-shrink-0">{timeAgo(log.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Security Events */}
        <Card>
          <div className="px-6 py-5">
            <h2 className="text-base font-semibold text-[#F8FAFC] mb-4">Security Events</h2>
            <div className="space-y-3">
              {securityEvents.slice(0, 5).map(evt => (
                <div key={evt.id} className={`
                  flex items-start gap-3 p-3 rounded-xl border text-xs
                  ${evt.severity === 'CRITICAL' ? 'bg-[#EF4444]/5 border-[#EF4444]/20' :
                    evt.severity === 'HIGH' ? 'bg-[#F59E0B]/5 border-[#F59E0B]/20' :
                      'bg-[#22C55E]/5 border-[#22C55E]/20'}
                `}>
                  {evt.severity === 'CRITICAL' || evt.severity === 'HIGH'
                    ? <AlertTriangle size={14} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
                    : <CheckCircle2 size={14} className="text-[#22C55E] flex-shrink-0 mt-0.5" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#F8FAFC]">{evt.type.replace(/_/g, ' ')}</p>
                    <p className="text-[#94A3B8] mt-0.5 leading-relaxed">{evt.description}</p>
                    <p className="text-[#94A3B8] mt-1">{timeAgo(evt.timestamp)}</p>
                  </div>
                </div>
              ))}
              {securityEvents.length === 0 && (
                <p className="text-sm text-[#94A3B8] text-center py-4">No security events recorded.</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Contributors + Blockchain */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contributor Activity */}
        <Card>
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-[#38BDF8]" />
              <h2 className="text-base font-semibold text-[#F8FAFC]">Contributor Activity</h2>
            </div>
            <div className="space-y-3">
              {contributors.map(c => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8] font-bold text-xs flex-shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F8FAFC] truncate">{c.name}</p>
                    <p className="text-xs text-[#94A3B8]">{c.role} · {c.assetsContributed} assets</p>
                  </div>
                  <StatusBadge status={c.trustStatus === 'TRUSTED' ? 'TRUSTED' : 'WARNING'} />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Blockchain Records */}
        <Card>
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-base font-semibold text-[#F8FAFC]">Recent Blockchain Records</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 font-medium">
                DEMO
              </span>
            </div>
            <div className="space-y-3">
              {auditLogs.slice(0, 4).map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-[#050B14] border border-[#38BDF8]/10">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-medium text-[#38BDF8]">{log.transactionReference}</span>
                    <StatusBadge status={log.status === 'VERIFIED' ? 'VERIFIED' : 'FAILED'} />
                  </div>
                  <p className="text-xs text-[#94A3B8]">{log.recordType.replace(/_/g, ' ')} · {log.assetId}</p>
                  <p className="text-xs text-[#94A3B8]/60 mt-0.5">{timeAgo(log.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Threat Monitor */}
      <Card>
        <div className="px-6 py-5">
          <h2 className="text-base font-semibold text-[#F8FAFC] mb-4">Threat Monitor</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { label: 'Dataset Integrity', value: datasets.filter(d => d.status === 'TRUSTED').length + '/' + datasets.length, ok: !datasets.some(d => d.status === 'COMPROMISED') },
              { label: 'Model Integrity', value: models.filter(m => m.status === 'TRUSTED').length + '/' + models.length, ok: !models.some(m => m.status === 'COMPROMISED') },
              { label: 'Inference Integrity', value: inferences.filter(i => i.status === 'TRUSTED').length + '/' + inferences.length, ok: !inferences.some(i => i.status === 'COMPROMISED') },
              { label: 'Active Threats', value: activeAlerts.length.toString(), ok: activeAlerts.length === 0 },
            ].map(item => (
              <div key={item.label} className={`p-4 rounded-xl border text-center ${item.ok ? 'bg-[#22C55E]/5 border-[#22C55E]/20' : 'bg-[#EF4444]/5 border-[#EF4444]/20'}`}>
                <p className={`text-2xl font-bold ${item.ok ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>{item.value}</p>
                <p className="text-xs text-[#94A3B8] mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
