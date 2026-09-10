import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, AlertTriangle, Search, Database, Brain, FlaskConical, Eye, Link2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { HashDisplay } from '../components/common/HashDisplay';
import { DEMO_HASHES } from '../data/demoData';

interface VerifyResult {
  stage: string;
  icon: React.ReactNode;
  status: 'TRUSTED' | 'COMPROMISED';
  expectedHash: string;
  currentHash: string;
  note?: string;
}

export const IntegrityVerifyPage: React.FC = () => {
  const { datasets, models, inferences } = useApp();
  const [query, setQuery] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [results, setResults] = useState<VerifyResult[] | null>(null);
  const [inputUsed, setInputUsed] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = query.trim() || 'INF-DEMO-001';
    setVerifying(true);
    setResults(null);

    await new Promise(r => setTimeout(r, 1500));

    const demoDataset = datasets.find(d => d.id === 'UAV-DEMO-DATA-001');
    const demoModel = models.find(m => m.id === 'VISI-YOLO-DEMO');
    const demoInference = inferences.find(i => i.id === 'INF-DEMO-001') || inferences[0];

    const res: VerifyResult[] = [
      {
        stage: 'DATA',
        icon: <Database size={18} />,
        status: demoDataset?.status === 'COMPROMISED' ? 'COMPROMISED' : 'TRUSTED',
        expectedHash: DEMO_HASHES.dataset,
        currentHash: demoDataset?.hash || DEMO_HASHES.dataset,
        note: demoDataset?.status === 'COMPROMISED' ? 'Expected dataset hash differs from current recorded hash.' : undefined,
      },
      {
        stage: 'MODEL',
        icon: <Brain size={18} />,
        status: demoModel?.status === 'COMPROMISED' ? 'COMPROMISED' : 'TRUSTED',
        expectedHash: DEMO_HASHES.model,
        currentHash: demoModel?.hash || DEMO_HASHES.model,
        note: demoModel?.status === 'COMPROMISED' ? 'Expected model hash differs from current recorded hash.' : undefined,
      },
      {
        stage: 'INPUT',
        icon: <Search size={18} />,
        status: 'TRUSTED',
        expectedHash: DEMO_HASHES.inferenceInput,
        currentHash: demoInference?.inputHash || DEMO_HASHES.inferenceInput,
      },
      {
        stage: 'INFERENCE',
        icon: <FlaskConical size={18} />,
        status: demoModel?.status === 'COMPROMISED' ? 'COMPROMISED' : 'TRUSTED',
        expectedHash: DEMO_HASHES.inferenceOutput,
        currentHash: demoInference?.outputHash || DEMO_HASHES.inferenceOutput,
        note: demoModel?.status === 'COMPROMISED' ? 'Inference integrity affected by compromised model.' : undefined,
      },
      {
        stage: 'OUTPUT',
        icon: <Eye size={18} />,
        status: demoInference?.status === 'COMPROMISED' ? 'COMPROMISED' : (demoModel?.status === 'COMPROMISED' ? 'COMPROMISED' : 'TRUSTED'),
        expectedHash: DEMO_HASHES.inferenceOutput,
        currentHash: demoInference?.outputHash || DEMO_HASHES.inferenceOutput,
      },
      {
        stage: 'BLOCKCHAIN',
        icon: <Link2 size={18} />,
        status: 'TRUSTED',
        expectedHash: 'DEMO-AUDIT-003',
        currentHash: 'DEMO-AUDIT-003',
      },
    ];

    setResults(res);
    setInputUsed(id);
    setVerifying(false);
  };

  const allTrusted = results?.every(r => r.status === 'TRUSTED');
  const compromisedStages = results?.filter(r => r.status === 'COMPROMISED');

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Integrity Verification</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Verify the full integrity chain for any asset or inference record.</p>
      </div>

      {/* Search form */}
      <Card>
        <form onSubmit={handleVerify} className="px-6 py-5">
          <h2 className="text-sm font-semibold text-[#F8FAFC] mb-3">Enter Asset or Inference ID</h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. INF-DEMO-001 (leave blank for demo)"
                className="w-full bg-[#050B14] border border-[#38BDF8]/20 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50"
              />
            </div>
            <button type="submit" disabled={verifying}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors text-sm disabled:opacity-50">
              {verifying
                ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-4 h-4 rounded-full border-2 border-[#050B14]/30 border-t-[#050B14]" />
                : <ShieldCheck size={16} />}
              {verifying ? 'Verifying...' : 'Verify Integrity'}
            </button>
          </div>
          <p className="text-xs text-[#94A3B8] mt-2">
            Try: <code className="text-[#38BDF8] cursor-pointer" onClick={() => setQuery('INF-DEMO-001')}>INF-DEMO-001</code>
            {' '}· <code className="text-[#38BDF8] cursor-pointer" onClick={() => setQuery('UAV-DEMO-DATA-001')}>UAV-DEMO-DATA-001</code>
            {' '}· <code className="text-[#38BDF8] cursor-pointer" onClick={() => setQuery('VISI-YOLO-DEMO')}>VISI-YOLO-DEMO</code>
          </p>
        </form>
      </Card>

      {/* Verification loading */}
      {verifying && (
        <div className="text-center py-8">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-2 border-[#38BDF8]/20 border-t-[#38BDF8] mx-auto mb-3" />
          <p className="text-sm text-[#94A3B8]">Verifying integrity chain...</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results && !verifying && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Overall status */}
            <div className={`p-5 rounded-2xl border text-center ${allTrusted
              ? 'bg-[#22C55E]/5 border-[#22C55E]/30'
              : 'bg-[#EF4444]/5 border-[#EF4444]/30'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                {allTrusted
                  ? <CheckCircle2 size={24} className="text-[#22C55E]" />
                  : <AlertTriangle size={24} className="text-[#EF4444]" />}
                <span className={`text-lg font-bold ${allTrusted ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {allTrusted ? 'TRUSTED PIPELINE' : 'PIPELINE INTEGRITY COMPROMISED'}
                </span>
              </div>
              <p className="text-sm text-[#94A3B8]">
                {allTrusted
                  ? `All integrity stages verified for: ${inputUsed}`
                  : `${compromisedStages?.length} stage(s) failed integrity check for: ${inputUsed}`}
              </p>
            </div>

            {/* Stage results */}
            <div className="space-y-3">
              {results.map((r, i) => (
                <motion.div
                  key={r.stage}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`rounded-xl border p-4 ${r.status === 'TRUSTED'
                    ? 'bg-[#22C55E]/3 border-[#22C55E]/20'
                    : 'bg-[#EF4444]/5 border-[#EF4444]/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${r.status === 'TRUSTED' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                      {r.icon}
                    </div>
                    <span className="font-semibold text-[#F8FAFC] text-sm">{r.stage}</span>
                    <div className="ml-auto flex items-center gap-1.5 text-sm font-bold">
                      {r.status === 'TRUSTED'
                        ? <><CheckCircle2 size={16} className="text-[#22C55E]" /><span className="text-[#22C55E]">HASH MATCH</span></>
                        : <><AlertTriangle size={16} className="text-[#EF4444]" /><span className="text-[#EF4444]">HASH MISMATCH</span></>
                      }
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <HashDisplay hash={r.expectedHash} label="Expected Hash" />
                    <HashDisplay hash={r.currentHash} label="Current Hash" />
                  </div>
                  {r.note && (
                    <p className="text-xs text-[#EF4444] mt-2 flex items-center gap-1">
                      <AlertTriangle size={12} /> {r.note}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
