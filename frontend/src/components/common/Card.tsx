import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glass = false, onClick, hover = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-xl border border-[#38BDF8]/10
        ${glass ? 'bg-[#0D1B2A]/70 backdrop-blur-md' : 'bg-[#0D1B2A]'}
        ${hover ? 'cursor-pointer hover:border-[#38BDF8]/30 transition-colors duration-200' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={hover ? { scale: 1.01 } : undefined}
    >
      {children}
    </motion.div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-[#38BDF8]/10 ${className}`}>
    {children}
  </div>
);

export const CardBody: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-[#38BDF8]/10 ${className}`}>
    {children}
  </div>
);
