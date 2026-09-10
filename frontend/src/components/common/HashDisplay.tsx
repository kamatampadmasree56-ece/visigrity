import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { truncateHash } from '../../utils/hash';

interface HashDisplayProps {
  hash: string;
  label?: string;
  truncate?: boolean;
  className?: string;
}

export const HashDisplay: React.FC<HashDisplayProps> = ({ hash, label, truncate = true, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      showToast('Hash copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy hash', 'error');
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <span className="text-xs text-[#94A3B8] font-medium uppercase tracking-wider">{label}</span>}
      <div className="flex items-center gap-2 bg-[#050B14] rounded-lg px-3 py-2 border border-[#38BDF8]/10">
        <code className="text-xs text-[#38BDF8] font-mono flex-1 min-w-0 break-all">
          {truncate ? truncateHash(hash) : hash}
        </code>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 text-[#94A3B8] hover:text-[#38BDF8] transition-colors p-1 rounded"
          aria-label="Copy hash"
        >
          {copied ? <Check size={14} className="text-[#22C55E]" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
};
