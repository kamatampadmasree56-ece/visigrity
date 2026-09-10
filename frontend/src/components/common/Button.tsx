import React from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-semibold shadow-lg shadow-[#38BDF8]/20',
  secondary: 'bg-[#0B1624] hover:bg-[#0D1B2A] text-[#F8FAFC] border border-[#38BDF8]/30 hover:border-[#38BDF8]/60',
  danger: 'bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold shadow-lg shadow-[#EF4444]/20',
  ghost: 'bg-transparent hover:bg-[#0D1B2A] text-[#94A3B8] hover:text-[#F8FAFC]',
  outline: 'bg-transparent border border-[#38BDF8]/50 hover:border-[#38BDF8] text-[#38BDF8] hover:bg-[#38BDF8]/10',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center justify-center transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 focus:ring-offset-1 focus:ring-offset-[#050B14]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
      {!loading && iconRight}
    </motion.button>
  );
};
