import React from 'react';

type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'secondary' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20',
  success: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
  danger: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
  warning: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
  secondary: 'bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/20',
  info: 'bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20',
};

const dotClasses: Record<BadgeVariant, string> = {
  primary: 'bg-[#38BDF8]',
  success: 'bg-[#22C55E]',
  danger: 'bg-[#EF4444]',
  warning: 'bg-[#F59E0B]',
  secondary: 'bg-[#94A3B8]',
  info: 'bg-[#60A5FA]',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'primary', children, className = '', dot = false }) => (
  <span className={`
    inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
    ${variantClasses[variant]} ${className}
  `}>
    {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[variant]}`} />}
    {children}
  </span>
);

type StatusBadgeStatus = 'TRUSTED' | 'COMPROMISED' | 'PENDING' | 'VERIFIED' | 'FAILED' | 'WARNING';

interface StatusBadgeProps {
  status: StatusBadgeStatus;
  className?: string;
}

const statusConfig: Record<StatusBadgeStatus, { variant: BadgeVariant; label: string }> = {
  TRUSTED: { variant: 'success', label: 'Trusted' },
  COMPROMISED: { variant: 'danger', label: 'Compromised' },
  PENDING: { variant: 'warning', label: 'Pending' },
  VERIFIED: { variant: 'success', label: 'Verified' },
  FAILED: { variant: 'danger', label: 'Failed' },
  WARNING: { variant: 'warning', label: 'Warning' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status] || { variant: 'secondary', label: status };
  return <Badge variant={config.variant as BadgeVariant} dot className={className}>{config.label}</Badge>;
};
