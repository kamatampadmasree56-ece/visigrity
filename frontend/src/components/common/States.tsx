import React from 'react';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className="w-10 h-10 rounded-full border-2 border-[#38BDF8]/20 border-t-[#38BDF8]"
    />
    <p className="text-sm text-[#94A3B8]">{message}</p>
  </div>
);

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    {icon && <div className="text-[#94A3B8]/50">{icon}</div>}
    <div>
      <h3 className="text-lg font-semibold text-[#F8FAFC]">{title}</h3>
      {description && <p className="text-sm text-[#94A3B8] mt-1">{description}</p>}
    </div>
    {action && action}
  </div>
);
