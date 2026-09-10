import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Play, ShieldCheck, CheckCircle2, AlertTriangle, ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { HashDisplay } from '../components/common/HashDisplay';
import type { Inference } from '../types';

export const InferenceLabPage: React.FC = () => {
  const { models, runInference } = useApp();
  const { showToast } = useToast();
  const [selectedModelId, setSelectedModelId] = useState(models[0]?.id || '');
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [running, setRunning] = useState(false);
  const [verifyingModel, setVerifyingModel] = useState(false);
  const [result, setResult] = useState<Inference | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedModel = models.find(m => m.id === selectedModelId);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { showToast('Please select an image file.', 'error'); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleVerifyModel = async () => {
    setVerifyingModel(true);
    await new Promise(r => setTimeout(r, 800));
    setVerifyingModel(false);
    if (selectedModel?.status === 'COMPROMISED') {
      showToast('⚠ Model hash mismatch detected. Model integrity compromised.', 'error');
    } else {
      showToast(`Model ${selectedModel?.name} verified. Hash match confirmed.`, 'success');
    }
  };

  const handleRunInference = async () => {
    if (!selectedModelId) { showToast('Please select a model.', 'warning'); return; }
    setRunning(true);
    try {
      // If a file is uploaded, use the real CV pipeline endpoint
      const inf = await runInference(selectedModelId, selectedFile ?? undefined);
      setResult(inf);
      if (inf.status === 'TRUSTED') {
        showToast(
          selectedFile
            ? 'CV inference complete. SHA-256 hashes verified. Pipeline Integrity Confirmed.'
            : 'Demo inference complete. Pipeline Integrity Verified.',
          'success'
        );
      } else {
        showToast('Inference complete with warnings. Model integrity was compromised.', 'warning');
      }
    } catch {
      showToast('Inference failed.', 'error');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Inference Lab</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Computer vision inference workspace with integrity verification.</p>
        <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-medium">
          <span>⚠</span> DEMO INFERENCE — Not a real operational AI system
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left panel - input */}
        <div className="lg:col-span-3 space-y-4">
          {/* Model selector */}
          <Card>
            <div className="px-6 py-4">
              <h2 className="text-sm font-semibold text-[#F8FAFC] mb-3">Model Selection</h2>
              <select
                value={selectedModelId}
                onChange={e => { setSelectedModelId(e.target.value); setResult(null); }}
                className="w-full bg-[#050B14] border border-[#38BDF8]/20 rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 mb-3"
              >
                {models.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#0B1624]">
                    {m.name} {m.version} {m.status === 'COMPROMISED' ? '⚠ COMPROMISED' : '✓'}
                  </option>
                ))}
              </select>
              {selectedModel && (
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>Framework: {selectedModel.framework}</span>
                  <span className={selectedModel.status === 'COMPROMISED' ? 'text-[#EF4444]' : 'text-[#22C55E]'}>
                    {selectedModel.status === 'COMPROMISED' ? '⚠ COMPROMISED' : '✓ TRUSTED'}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Image input */}
          <Card>
            <div className="px-6 py-4">
              <h2 className="text-sm font-semibold text-[#F8FAFC] mb-3">Input Image</h2>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`
                  relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden
                  ${isDragging ? 'border-[#38BDF8] bg-[#38BDF8]/5' : 'border-[#38BDF8]/20 hover:border-[#38BDF8]/50 hover:bg-[#38BDF8]/3'}
                `}
                style={{ minHeight: 220 }}
              >
                {previewUrl ? (
                  <div className="relative">
                    <img src={previewUrl} alt="Input" className="w-full max-h-64 object-cover rounded-xl" />
                    {/* Bounding box overlay when result exists */}
                    {result && result.result.boundingBox && (
                      <div
                        className="absolute border-2 border-[#22C55E] rounded"
                        style={{
                          left: `${result.result.boundingBox.x}%`,
                          top: `${result.result.boundingBox.y}%`,
                          width: `${result.result.boundingBox.w}%`,
                          height: `${result.result.boundingBox.h}%`,
                        }}
                      >
                        <div className="absolute -top-5 left-0 bg-[#22C55E] text-[#050B14] text-xs font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                          {result.result.label} {result.result.confidence.toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-14 gap-3 text-[#94A3B8]">
                    <ImageIcon size={36} className="opacity-50" />
                    <div className="text-center">
                      <p className="text-sm font-medium">Drag & drop an image</p>
                      <p className="text-xs mt-1">or click to browse</p>
                    </div>
                    <Upload size={16} className="opacity-50" />
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
              {previewUrl && (
                <button onClick={() => fileRef.current?.click()}
                  className="mt-2 text-xs text-[#38BDF8] hover:text-[#60A5FA] transition-colors">
                  Change image
                </button>
              )}
            </div>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button onClick={handleVerifyModel} disabled={verifyingModel}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[#38BDF8]/40 hover:border-[#38BDF8] text-[#38BDF8] rounded-xl transition-colors text-sm font-medium disabled:opacity-50">
              {verifyingModel
                ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-4 h-4 rounded-full border border-[#38BDF8]/30 border-t-[#38BDF8]" />
                : <ShieldCheck size={16} />}
              {verifyingModel ? 'Verifying...' : 'Verify Model'}
            </button>
            <button onClick={handleRunInference} disabled={running}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors text-sm disabled:opacity-50"
              title={selectedFile ? 'Run full CV pipeline with uploaded image' : 'Run demo inference (no image selected)'}>
              {running
                ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-4 h-4 rounded-full border-2 border-[#050B14]/30 border-t-[#050B14]" />
                : <Play size={16} />}
              {running ? 'Running...' : 'Run Inference'}
            </button>
          </div>
        </div>

        {/* Right panel - results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Demo note */}
          <div className="p-3 rounded-xl bg-[#F59E0B]/5 border border-[#F59E0B]/20 text-xs text-[#F59E0B]">
            Demo inference only. Results demonstrate pipeline integrity verification, not real AI output.
          </div>

          {/* Result card */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <div className="px-6 py-4">
                    <h2 className="text-sm font-semibold text-[#F8FAFC] mb-3">Inference Result</h2>
                    <div className={`p-3 rounded-xl border mb-4 ${result.status === 'TRUSTED' ? 'bg-[#22C55E]/5 border-[#22C55E]/30' : 'bg-[#EF4444]/5 border-[#EF4444]/30'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {result.status === 'TRUSTED' ? <CheckCircle2 size={16} className="text-[#22C55E]" /> : <AlertTriangle size={16} className="text-[#EF4444]" />}
                        <span className={`text-sm font-bold ${result.status === 'TRUSTED' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                          {result.status === 'TRUSTED' ? 'PIPELINE INTEGRITY VERIFIED' : 'PIPELINE INTEGRITY COMPROMISED'}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8]">
                        {result.status === 'TRUSTED'
                          ? 'All stage hashes verified. This verifies pipeline integrity, not factual correctness of the output.'
                          : 'Model hash mismatch detected during inference. Results may not be reliable.'}
                      </p>
                    </div>

                    {/* Detection result */}
                    <div className="bg-[#050B14] rounded-xl p-4 mb-4 border border-[#38BDF8]/10">
                      <p className="text-xs text-[#94A3B8] mb-2 uppercase tracking-wider">Detected Object</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-[#F8FAFC]">{result.result.label}</span>
                        <span className="text-lg text-[#22C55E] font-semibold">{result.result.confidence.toFixed(1)}%</span>
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-1">Model: {result.modelName} {result.modelVersion}</p>
                    </div>

                    {/* Hashes */}
                    <div className="space-y-2">
                      <HashDisplay hash={result.inputHash} label="Input Hash" />
                      <HashDisplay hash={result.modelHash} label="Model Hash" />
                      <HashDisplay hash={result.outputHash} label="Output Hash" />
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-3">Inference ID: <code className="text-[#38BDF8]">{result.id}</code></p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && (
            <Card>
              <div className="px-6 py-10 text-center text-[#94A3B8]">
                <Play size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a model and run inference to see results.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
