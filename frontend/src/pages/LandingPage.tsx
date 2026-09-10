import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Eye, Database, Brain, FlaskConical, ChevronRight,
  GitBranch, Users, FileText, Link2, Zap, CheckCircle2,
  AlertTriangle, RotateCcw, ArrowRight, Hash, BookOpen, Server, ShieldCheck
} from 'lucide-react';
import { VisigrityLogo } from '../components/common/Logo';

// ---- DEMO ATTACK SIMULATION ----
type StageStatus = 'ok' | 'compromised' | 'warning';

interface PipelineStageState {
  label: string;
  status: StageStatus;
}

const initialStages: PipelineStageState[] = [
  { label: 'DATA', status: 'ok' },
  { label: 'MODEL', status: 'ok' },
  { label: 'INFERENCE', status: 'ok' },
  { label: 'OUTPUT', status: 'ok' },
];

const compromisedStages: PipelineStageState[] = [
  { label: 'DATA', status: 'ok' },
  { label: 'MODEL', status: 'compromised' },
  { label: 'INFERENCE', status: 'warning' },
  { label: 'OUTPUT', status: 'warning' },
];

const statusIcon = (s: StageStatus) => {
  if (s === 'ok') return <CheckCircle2 size={20} className="text-[#22C55E]" />;
  if (s === 'compromised') return <span className="text-[#EF4444] text-lg font-bold">✕</span>;
  return <AlertTriangle size={20} className="text-[#F59E0B]" />;
};

const statusBorder = (s: StageStatus) => {
  if (s === 'ok') return 'border-[#22C55E]/40';
  if (s === 'compromised') return 'border-[#EF4444]/60';
  return 'border-[#F59E0B]/60';
};

// ---- HOW IT WORKS STAGES ----
const pipelineStages = [
  { label: 'DATA', icon: <Database size={20} />, desc: 'Datasets are registered with SHA-256 hashes and contributor metadata.' },
  { label: 'SHA-256', icon: <Hash size={20} />, desc: 'Every asset is fingerprinted using SHA-256 hashing for tamper detection.' },
  { label: 'MODEL', icon: <Brain size={20} />, desc: 'Models are registered, versioned, and hash-verified before deployment.' },
  { label: 'SHA-256', icon: <Hash size={20} />, desc: 'Model hashes are re-verified at inference time to detect unauthorized changes.' },
  { label: 'INFERENCE', icon: <FlaskConical size={20} />, desc: 'Inference inputs and outputs are hashed and recorded with contributor attribution.' },
  { label: 'SHA-256', icon: <Hash size={20} />, desc: 'Output hashes are recorded to detect post-inference output manipulation.' },
  { label: 'OUTPUT', icon: <Eye size={20} />, desc: 'Final output is stored with full hash chain from DATA → MODEL → INFERENCE.' },
  { label: 'BLOCKCHAIN', icon: <Link2 size={20} />, desc: 'All integrity records are written to a blockchain audit trail (Demo mode in Phase 1).' },
  { label: 'VERIFICATION', icon: <Shield size={20} />, desc: 'Any stage in the pipeline can be verified against baseline records at any time.' },
];

const features = [
  { icon: <Shield size={24} />, title: 'End-to-End Integrity Chain', desc: 'Hash verification at every stage from data ingestion to final output ensures a complete and verifiable audit chain.' },
  { icon: <Zap size={24} />, title: 'Real-Time Tamper Detection', desc: 'Continuous hash comparison detects any unauthorized modification to datasets, models, or outputs immediately.' },
  { icon: <Users size={24} />, title: 'Multi-Contributor Accountability', desc: 'Every action is attributed to a verified contributor with role-based access, creating a full accountability record.' },
  { icon: <CheckCircle2 size={24} />, title: 'Trusted Inference Verification', desc: 'Verify that an inference result was produced by an unmodified model on an unmodified dataset — not that the result is factually correct.' },
  { icon: <Link2 size={24} />, title: 'Blockchain Audit Trail', desc: 'Immutable audit records provide provenance for every registered asset and integrity event.' },
  { icon: <GitBranch size={24} />, title: 'Version Control', desc: 'Track every version of datasets and models with full hash history and contributor attribution.' },
  { icon: <AlertTriangle size={24} />, title: 'Security Attack Simulator', desc: 'Controlled simulations demonstrate how tampering is detected — for testing, training, and demonstration purposes.' },
  { icon: <FileText size={24} />, title: 'Evidence & Audit Reports', desc: 'Generate structured audit reports with full integrity chain, contributor history, and blockchain references.' },
];

const techStack = [
  { name: 'React', status: 'IMPLEMENTED', color: 'success' },
  { name: 'TypeScript', status: 'IMPLEMENTED', color: 'success' },
  { name: 'Vite', status: 'IMPLEMENTED', color: 'success' },
  { name: 'Tailwind CSS', status: 'IMPLEMENTED', color: 'success' },
  { name: 'React Router', status: 'IMPLEMENTED', color: 'success' },
  { name: 'Recharts', status: 'IMPLEMENTED', color: 'success' },
  { name: 'Framer Motion', status: 'IMPLEMENTED', color: 'success' },
  { name: 'FastAPI', status: 'PLANNED', color: 'warning' },
  { name: 'Python', status: 'PLANNED', color: 'warning' },
  { name: 'PostgreSQL', status: 'PLANNED', color: 'warning' },
  { name: 'OpenCV / YOLO', status: 'PLANNED', color: 'warning' },
  { name: 'SHA-256 Engine', status: 'PLANNED', color: 'warning' },
  { name: 'Solidity / EVM', status: 'PLANNED', color: 'warning' },
];

const navLinks = ['Home', 'Problem', 'Solution', 'How It Works', 'Features', 'Security', 'Technology'];

export const LandingPage: React.FC = () => {
  const [demoStages, setDemoStages] = useState<PipelineStageState[]>(initialStages);
  const [demoTriggered, setDemoTriggered] = useState(false);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  const problemRef = useRef<HTMLElement>(null);
  const solutionRef = useRef<HTMLElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const securityRef = useRef<HTMLElement>(null);
  const techRef = useRef<HTMLElement>(null);

  const sectionRefs: Record<string, React.RefObject<HTMLElement | null>> = {
    Problem: problemRef,
    Solution: solutionRef,
    'How It Works': howItWorksRef,
    Features: featuresRef,
    Security: securityRef,
    Technology: techRef,
  };

  const scrollToSection = (name: string) => {
    const ref = sectionRefs[name];
    ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const simulateTampering = () => {
    setDemoStages(compromisedStages);
    setDemoTriggered(true);
  };

  const resetDemo = () => {
    setDemoStages(initialStages);
    setDemoTriggered(false);
  };

  return (
    <div className="bg-[#050B14] text-[#F8FAFC] min-h-screen">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050B14]/90 backdrop-blur-md border-b border-[#38BDF8]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <VisigrityLogo size={36} />
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <button
                key={link}
                onClick={() => link === 'Home'
                  ? window.scrollTo({ top: 0, behavior: 'smooth' })
                  : scrollToSection(link)
                }
                className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              >
                {link}
              </button>
            ))}
          </div>
          <Link
            to="/login"
            className="px-4 py-2 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-semibold text-sm rounded-lg transition-colors"
          >
            Launch Security Center
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#38BDF8]/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] text-xs font-medium mb-6"
            >
              <Shield size={12} /> Phase 1 — Frontend Prototype
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl font-bold text-[#F8FAFC] leading-tight"
            >
              VISIGRITY
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-[#38BDF8] font-medium mt-2 mb-4"
            >
              Integrity Behind Every Vision.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base text-[#94A3B8] mb-8 max-w-lg"
            >
              Trustworthy integrity and provenance assurance for multi-contributor computer vision pipelines.
              Verify every stage — DATA, MODEL, INFERENCE, and OUTPUT — with SHA-256 hash verification and immutable audit trails.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                to="/login"
                className="px-6 py-3 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                Launch Security Center <ArrowRight size={18} />
              </Link>
              <button
                onClick={() => scrollToSection('How It Works')}
                className="px-6 py-3 border border-[#38BDF8]/40 hover:border-[#38BDF8] text-[#38BDF8] rounded-xl transition-colors"
              >
                Explore How It Works
              </button>
            </motion.div>
          </div>

          {/* Pipeline visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            {[
              { label: 'DATA', icon: <Database size={22} />, color: 'text-[#60A5FA]', hash: 'a8f9e3b1...2c4d5f6a' },
              { label: 'MODEL', icon: <Brain size={22} />, color: 'text-[#38BDF8]', hash: 'c3d4e5f6...a7b8c9d0' },
              { label: 'INFERENCE', icon: <FlaskConical size={22} />, color: 'text-[#FF7A18]', hash: 'f0e1d2c3...b4a5f6e7' },
              { label: 'OUTPUT', icon: <Eye size={22} />, color: 'text-[#22C55E]', hash: 'e1d2c3b4...a5f6e7d8' },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="w-full max-w-sm bg-[#0D1B2A] rounded-xl border border-[#38BDF8]/15 px-5 py-4 flex items-center gap-4"
                >
                  <div className={`p-2 rounded-lg bg-[#38BDF8]/10 ${item.color}`}>{item.icon}</div>
                  <div className="flex-1">
                    <p className="text-xs text-[#94A3B8] font-medium">{item.label}</p>
                    <p className="text-[10px] text-[#38BDF8] font-mono mt-0.5">{item.hash}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#22C55E] font-medium">
                    <CheckCircle2 size={14} /> Verified
                  </div>
                </motion.div>
                {i < 3 && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-5 bg-[#38BDF8]/30" />
                    <div className="text-[10px] text-[#38BDF8]/60 font-mono">SHA-256</div>
                    <div className="w-px h-5 bg-[#38BDF8]/30" />
                  </div>
                )}
              </React.Fragment>
            ))}
            <div className="mt-2 flex items-center gap-2 text-xs text-[#22C55E] font-semibold">
              <CheckCircle2 size={16} /> PIPELINE INTEGRITY VERIFIED
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section ref={problemRef as React.RefObject<HTMLElement>} className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#F8FAFC]">The Problem</h2>
            <p className="text-[#94A3B8] mt-3 max-w-xl mx-auto">Computer vision pipelines involve multiple contributors and stages — each a potential point of failure or compromise.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Database size={28} />, title: 'Data Tampering', desc: 'Unauthorized modification of training or evaluation datasets can compromise every downstream model and inference decision without detection.', color: 'text-[#EF4444] bg-[#EF4444]/10' },
              { icon: <Brain size={28} />, title: 'Model Tampering', desc: 'Unauthorized changes to model weights or architecture can silently alter inference behavior, making outputs untrustworthy.', color: 'text-[#F59E0B] bg-[#F59E0B]/10' },
              { icon: <Eye size={28} />, title: 'Output Manipulation', desc: 'Recorded inference outputs may be retroactively modified, making it impossible to verify what the model originally produced.', color: 'text-[#FF7A18] bg-[#FF7A18]/10' },
              { icon: <Users size={28} />, title: 'Accountability Gap', desc: 'With no contributor attribution, tracking who made changes, when, and why is impossible — creating significant compliance and audit gaps.', color: 'text-[#94A3B8] bg-[#94A3B8]/10' },
            ].map(card => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#0D1B2A] rounded-xl border border-[#38BDF8]/10 p-6"
              >
                <div className={`p-3 rounded-xl w-fit mb-4 ${card.color}`}>{card.icon}</div>
                <h3 className="font-semibold text-[#F8FAFC] mb-2">{card.title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section ref={solutionRef as React.RefObject<HTMLElement>} className="py-20 px-4 sm:px-6 bg-[#0B1624]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#F8FAFC]">The VISIGRITY Solution</h2>
            <p className="text-[#94A3B8] mt-3 max-w-2xl mx-auto">
              VISIGRITY verifies pipeline integrity and provenance. It does not determine whether an AI prediction is factually correct.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: <Hash size={22} />, label: 'SHA-256 Hashing' },
              { icon: <FileText size={22} />, label: 'Provenance Tracking' },
              { icon: <Users size={22} />, label: 'Contributor Accountability' },
              { icon: <ShieldCheck size={22} />, label: 'Integrity Verification' },
              { icon: <GitBranch size={22} />, label: 'Version Control' },
              { icon: <BookOpen size={22} />, label: 'Audit Trail' },
              { icon: <Link2 size={22} />, label: 'Blockchain Audit' },
              { icon: <AlertTriangle size={22} />, label: 'Tamper Detection' },
            ].map(item => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 bg-[#0D1B2A] rounded-xl border border-[#38BDF8]/10 px-4 py-3.5"
              >
                <div className="text-[#38BDF8]">{item.icon}</div>
                <span className="text-sm font-medium text-[#F8FAFC]">{item.label}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-[#94A3B8] mt-8 border border-[#38BDF8]/10 rounded-lg p-4 bg-[#0D1B2A] max-w-2xl mx-auto">
            ⚠️ <strong>Important Disclaimer:</strong> VISIGRITY verifies pipeline integrity and provenance. It does not determine whether an AI prediction is factually correct. Labels such as "Pipeline Integrity Verified" refer to hash verification of the pipeline, not validation of the accuracy of AI outputs.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={howItWorksRef as React.RefObject<HTMLElement>} className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#F8FAFC]">How It Works</h2>
            <p className="text-[#94A3B8] mt-3">Click any stage to learn more.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            {pipelineStages.map((stage, i) => (
              <React.Fragment key={`${stage.label}-${i}`}>
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedStage(selectedStage === i ? null : i)}
                  className={`
                    w-full max-w-md flex items-center gap-4 px-5 py-3.5 rounded-xl border text-left transition-all duration-200
                    ${selectedStage === i
                      ? 'bg-[#38BDF8]/10 border-[#38BDF8]/50 text-[#38BDF8]'
                      : 'bg-[#0D1B2A] border-[#38BDF8]/10 text-[#94A3B8] hover:border-[#38BDF8]/30 hover:text-[#F8FAFC]'
                    }
                  `}
                >
                  <div className={`p-2 rounded-lg ${selectedStage === i ? 'bg-[#38BDF8]/20' : 'bg-[#38BDF8]/5'}`}>
                    {stage.icon}
                  </div>
                  <span className="font-semibold text-sm">{stage.label}</span>
                  <ChevronRight size={16} className={`ml-auto transition-transform ${selectedStage === i ? 'rotate-90' : ''}`} />
                </motion.button>
                <AnimatePresence>
                  {selectedStage === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full max-w-md overflow-hidden"
                    >
                      <div className="px-5 py-3 rounded-xl bg-[#38BDF8]/5 border border-[#38BDF8]/20 text-sm text-[#94A3B8] mb-2">
                        {stage.desc}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {i < pipelineStages.length - 1 && (
                  <div className="w-px h-4 bg-[#38BDF8]/20" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section ref={featuresRef as React.RefObject<HTMLElement>} className="py-20 px-4 sm:px-6 bg-[#0B1624]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#F8FAFC]">Core Features</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#0D1B2A] rounded-xl border border-[#38BDF8]/10 p-6 hover:border-[#38BDF8]/30 transition-colors group"
              >
                <div className="text-[#38BDF8] mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="font-semibold text-[#F8FAFC] mb-2 text-sm">{f.title}</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY ARCHITECTURE */}
      <section ref={securityRef as React.RefObject<HTMLElement>} className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#F8FAFC]">Security Architecture</h2>
          </div>
          <div className="flex flex-col items-center gap-0">
            {[
              { label: 'CONTRIBUTOR', icon: <Users size={22} />, desc: 'Authenticated, role-based access' },
              { label: 'APPLICATION', icon: <Server size={22} />, desc: 'VISIGRITY frontend and API layer' },
              { label: 'INTEGRITY ENGINE', icon: <Shield size={22} />, desc: 'SHA-256 hash verification and comparison' },
              { label: 'BLOCKCHAIN', icon: <Link2 size={22} />, desc: 'Immutable audit record storage' },
              { label: 'AUDIT', icon: <FileText size={22} />, desc: 'Evidence generation and reporting' },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="w-full max-w-sm bg-[#0D1B2A] rounded-xl border border-[#38BDF8]/15 px-6 py-4 flex items-center gap-4"
                >
                  <div className="text-[#38BDF8] bg-[#38BDF8]/10 p-2.5 rounded-lg">{item.icon}</div>
                  <div>
                    <p className="font-semibold text-[#F8FAFC] text-sm">{item.label}</p>
                    <p className="text-xs text-[#94A3B8]">{item.desc}</p>
                  </div>
                </motion.div>
                {i < 4 && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-0.5 h-8 bg-gradient-to-b from-[#38BDF8]/50 to-[#38BDF8]/20" />
                    <div className="w-2 h-2 rounded-full bg-[#38BDF8]/50" />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ATTACK DEMO */}
      <section className="py-20 px-4 sm:px-6 bg-[#0B1624]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-medium mb-4">
              <Zap size={12} /> Controlled Security Simulation
            </div>
            <h2 className="text-2xl font-bold text-[#F8FAFC]">Live Integrity Demo</h2>
            <p className="text-sm text-[#94A3B8] mt-2">See how VISIGRITY detects pipeline tampering in real time.</p>
          </div>
          <div className="bg-[#0D1B2A] rounded-2xl border border-[#38BDF8]/15 p-6">
            {/* Pipeline stages */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {demoStages.map(stage => (
                <div
                  key={stage.label}
                  className={`rounded-xl border p-3 text-center transition-all duration-500 ${statusBorder(stage.status)} ${
                    stage.status === 'compromised' ? 'bg-[#EF4444]/5' :
                    stage.status === 'warning' ? 'bg-[#F59E0B]/5' : 'bg-[#22C55E]/5'
                  }`}
                >
                  <div className="flex justify-center mb-1">{statusIcon(stage.status)}</div>
                  <p className="text-xs font-bold text-[#F8FAFC]">{stage.label}</p>
                </div>
              ))}
            </div>

            {/* Status label */}
            <div className={`text-center py-3 rounded-xl mb-6 font-bold text-sm transition-all duration-500 ${
              demoTriggered
                ? 'bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444]'
                : 'bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]'
            }`}>
              {demoTriggered ? '⚠ TAMPERING DETECTED' : '🟢 PIPELINE TRUSTED'}
            </div>

            {/* Tamper details */}
            <AnimatePresence>
              {demoTriggered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 space-y-2"
                >
                  <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-[#EF4444] uppercase tracking-wider">Model Hash Mismatch Detected</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#94A3B8]">Expected Hash:</span>
                      <code className="text-[#22C55E] font-mono">c3d4e5f6...a7b8c9d0</code>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#94A3B8]">Current Hash:</span>
                      <code className="text-[#EF4444] font-mono">d4e5f6a7...b8c9d0e1</code>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#94A3B8]">Affected Asset:</span>
                      <span className="text-[#F8FAFC]">VISI-YOLO-DEMO v2.1</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#94A3B8]">Severity:</span>
                      <span className="text-[#EF4444] font-bold">CRITICAL</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#94A3B8]">Timestamp:</span>
                      <span className="text-[#94A3B8]">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex gap-3 flex-wrap justify-center">
              {!demoTriggered ? (
                <button
                  onClick={simulateTampering}
                  className="px-5 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-2"
                >
                  <Zap size={16} /> Simulate Model Tampering
                </button>
              ) : (
                <button
                  onClick={resetDemo}
                  className="px-5 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={16} /> Reset Demo
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section ref={techRef as React.RefObject<HTMLElement>} className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#F8FAFC]">Technology</h2>
            <p className="text-[#94A3B8] mt-3">Current implementation status</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {techStack.map(tech => (
              <div
                key={tech.name}
                className="flex items-center justify-between bg-[#0D1B2A] rounded-xl border border-[#38BDF8]/10 px-4 py-3"
              >
                <span className="text-sm font-medium text-[#F8FAFC]">{tech.name}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  tech.color === 'success'
                    ? 'bg-[#22C55E]/10 text-[#22C55E]'
                    : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                }`}>
                  {tech.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 bg-[#0B1624]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#F8FAFC] mb-4">Ready to Verify Your Pipeline?</h2>
          <p className="text-[#94A3B8] mb-8">Launch the VISIGRITY Security Center and explore the full integrity verification workflow.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors text-lg"
          >
            Launch Security Center <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#38BDF8]/10 text-center">
        <VisigrityLogo size={28} className="justify-center mb-3" />
        <p className="text-xs text-[#94A3B8]">
          © 2026 VISIGRITY — Phase 1 Frontend Prototype. All pipeline integrity claims refer to SHA-256 hash verification only.
        </p>
      </footer>
    </div>
  );
};


