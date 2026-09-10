import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'orange' | 'red';
}

const colorClasses = {
  blue: 'text-[#38BDF8] bg-[#38BDF8]/10',
  green: 'text-[#22C55E] bg-[#22C55E]/10',
  orange: 'text-[#FF7A18] bg-[#FF7A18]/10',
  red: 'text-[#EF4444] bg-[#EF4444]/10',
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, trend, color = 'blue' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0D1B2A] rounded-xl border border-[#38BDF8]/10 p-5 flex items-start gap-4"
    >
      <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#94A3B8] font-medium">{title}</p>
        <p className="text-2xl font-bold text-[#F8FAFC] mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-[#94A3B8] mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trend.value >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </motion.div>
  );
};
