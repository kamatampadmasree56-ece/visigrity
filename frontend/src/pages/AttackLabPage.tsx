import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Database, Brain, Eye, RotateCcw, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { DEMO_HASHES } from '../data/demoData';

type AttackType = 'dataset' | 'model' | 'output' | null;

export const AttackLabPage: React.FC = () => {
  const {
    pipelineStatus,
    simulateDatasetTampering,
    simulateModelTampering,
    simulateOutputTampering,
    resetAttackSimulation,
  } = useApp();
  const { showToast } = useToast();
  const [activeAttack, setActiveAttack] = useState<AttackType>(null);
  const [loading, setLoading] = useState(false);

  const isCompromised = pipelineStatus.overall === 'COMPROMISED';

  const runAttack = async (type: AttackType) => {
    if (!type) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    if (type === 'dataset') simulateDatasetTampering();
    if (type === 'model') simulateModelTampering();
    if (type === 'output') simulateOutputTampering();
    setActiveAttack(type);
    setLoading(false);
    showToast(`⚠ Controlled simulation: ${type} tampering detected. Check Command Center.`, 'error');
  };

  const handleReset = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    resetAttackSimulation();
    setActiveAttack(null);
    setLoading(false);
    showToast('Demo reset. Pipeline returned to trusted state.', 'success');
  };

  const stages = [
    { key: 'DATA', status: pipelineStatus.stages.DATA },
    { key: 'MODEL', status: pipelineStatus.stages.MODEL },
    { key: 'INFERENCE', status: pipelineStatus.stages.INFERENCE },
    { key: 'OUTPUT', status: pipelineStatus.stages.OUTPUT },
  ];

  const attackDetails: Record<string, { expected: string; current: string; asset: string; severity: string; description: string }> = {
    dataset: {
      expected: DEMO_HASHES.dataset.slice(0, 32) + '...',
      current: '(tampered hash — differs from baseline)',
      asset: 'UAV-DEMO-DATA-001 v2.1',
      severity: 'CRITICAL',
      description: 'Dataset hash mismatch detected. Unauthorized modification of training dataset may compromise all downstream model integrity.',
    },
    model: {
      expected: DEMO_HASHES.model.slice(0, 32) + '...',
      current: DEMO_HASHES.tamperedModel.slice(0, 32) + '...',
      asset: 'VISI-YOLO-DEMO v2.1',
      severity: 'CRITICAL',
      description: 'Model hash mismatch detected. Expected model hash differs from current recorded hash. Inference results may be unreliable.',
    },
    output: {
      expected: DEMO_HASHES.inferenceOutput.slice(0, 32) + '...',
      current: '(tampered output hash — differs from baseline)',
      asset: 'INF-DEMO-001',
      severity: 'HIGH',
      description: 'Inference output hash mismatch. Recorded output may have been modified after generation.',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Zap size={24} className="text-[#EF4444]" />
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Security Attack Simulator</h1>
        </div>
        <p className="text-sm text-[#94A3B8]">Controlled integrity attack demonstration for testing, training, and audit purposes.</p>
        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs font-medium text-[#EF4444]">
          <ShieldCheck size={12} /> CONTROLLED SECURITY SIMULATION — No real attacks are performed
        </div>
      </div>

      {/* Pipeline overview */}
      <Card>
        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold text-[#F8FAFC] mb-4">Pipeline Integrity State</h2>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {stages.map(s => (
              <motion.div
                key={s.key}
                animate={{ scale: s.status === 'COMPROMISED' ? [1, 1.03, 1] : 1 }}
                transition={{ repeat: s.status === 'COMPROMISED' ? Infinity : 0, duration: 1.5 }}
                className={`rounded-xl border p-4 text-center transition-all duration-500 ${
                  s.status === 'COMPROMISED'
                    ? 'bg-[#EF4444]/10 border-[#EF4444]/40'
                    : 'bg-[#22C55E]/5 border-[#22C55E]/30'
                }`}
              >
                <div className="text-2xl mb-1">
                  {s.status === 'COMPROMISED' ? '✕' : '✓'}
                </div>
                <p className={`text-xs font-bold ${s.status === 'COMPROMISED' ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                  {s.key}
                </p>
              </motion.div>
            ))}
          </div>
          <motion.div
            key={pipelineStatus.overall}
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            className={`py-3 rounded-xl border text-center font-bold text-sm ${
              isCompromised
                ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                : 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
            }`}
          >
            {isCompromised ? '⚠ TAMPERING DETECTED — PIPELINE INTEGRITY COMPROMISED' : '🟢 ALL VERIFIED — PIPELINE TRUSTED'}
          </motion.div>
        </div>
      </Card>

      {/* Attack buttons */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { type: 'dataset' as AttackType, label: 'Simulate Dataset Tampering', icon: <Database size={20} />, desc: 'Modifies UAV-DEMO-DATA-001 hash to simulate unauthorized dataset modification.' },
          { type: 'model' as AttackType, label: 'Simulate Model Tampering', icon: <Brain size={20} />, desc: 'Modifies VISI-YOLO-DEMO hash to simulate unauthorized model weight changes.' },
          { type: 'output' as AttackType, label: 'Simulate Output Tampering', icon: <Eye size={20} />, desc: 'Modifies INF-DEMO-001 output hash to simulate post-inference result manipulation.' },
        ].map(attack => (
          <motion.button
            key={attack.type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => runAttack(attack.type)}
            disabled={loading || isCompromised}
            className="flex flex-col items-start gap-3 p-5 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 hover:bg-[#EF4444]/10 hover:border-[#EF4444]/50 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="text-[#EF4444]">{attack.icon}</div>
            <div>
              <p className="text-sm font-semibold text-[#F8FAFC]">{attack.label}</p>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">{attack.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Reset button */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReset}
          disabled={loading || !isCompromised}
          className="flex items-center gap-2 px-8 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white" />
          ) : <RotateCcw size={18} />}
          Reset Demo — Restore Trusted State
        </motion.button>
      </div>

      {/* Attack details */}
      <AnimatePresence>
        {activeAttack && isCompromised && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <Card>
              <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle size={20} className="text-[#EF4444]" />
                  <h2 className="text-base font-semibold text-[#EF4444]">Security Alert — Tampering Detected</h2>
                </div>
                {attackDetails[activeAttack] && (
                  <div className="space-y-3">
                    <p className="text-sm text-[#94A3B8] leading-relaxed">{attackDetails[activeAttack].description}</p>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="bg-[#050B14] rounded-xl p-3 border border-[#38BDF8]/10">
                        <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Expected Hash</p>
                        <code className="text-[#22C55E] font-mono text-xs break-all">{attackDetails[activeAttack].expected}</code>
                      </div>
                      <div className="bg-[#050B14] rounded-xl p-3 border border-[#EF4444]/20">
                        <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Current Hash</p>
                        <code className="text-[#EF4444] font-mono text-xs break-all">{attackDetails[activeAttack].current}</code>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-[#94A3B8] mb-1">Affected Asset</p>
                        <p className="text-[#F8FAFC] font-medium">{attackDetails[activeAttack].asset}</p>
                      </div>
                      <div>
                        <p className="text-[#94A3B8] mb-1">Severity</p>
                        <p className="text-[#EF4444] font-bold">{attackDetails[activeAttack].severity}</p>
                      </div>
                      <div>
                        <p className="text-[#94A3B8] mb-1">Timestamp</p>
                        <p className="text-[#F8FAFC]">{new Date().toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="mt-2 p-3 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/20">
                      <p className="text-xs text-[#F59E0B]">
                        This is a <strong>Controlled Security Simulation</strong>. Navigate to Command Center or Integrity Verify to see the impact across the system.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!isCompromised && (
        <div className="text-center py-8 text-[#94A3B8]">
          <CheckCircle2 size={32} className="mx-auto mb-2 text-[#22C55E]" />
          <p className="text-sm">Pipeline is currently in a trusted state. Select an attack to simulate tampering.</p>
        </div>
      )}
    </div>
  );
};
