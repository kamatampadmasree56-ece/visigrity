import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'border-[#22C55E]/30 bg-[#22C55E]/5 text-[#22C55E]',
  error: 'border-[#EF4444]/30 bg-[#EF4444]/5 text-[#EF4444]',
  warning: 'border-[#F59E0B]/30 bg-[#F59E0B]/5 text-[#F59E0B]',
  info: 'border-[#38BDF8]/30 bg-[#38BDF8]/5 text-[#38BDF8]',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              className={`
                pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border
                bg-[#0B1624] shadow-xl ${colors[toast.type]}
              `}
            >
              <Icon size={18} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#F8FAFC] flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
