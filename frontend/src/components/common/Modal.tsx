import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
              w-full ${sizeClasses[size]} mx-4
              bg-[#0B1624] border border-[#38BDF8]/20 rounded-2xl shadow-2xl shadow-black/50
            `}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#38BDF8]/10">
                <h2 className="text-lg font-semibold text-[#F8FAFC]">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors p-1 rounded-lg hover:bg-[#0D1B2A]"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <div className="max-h-[85vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
