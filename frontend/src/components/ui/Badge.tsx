import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'teal' | 'climate' | 'amber' | 'azure' | 'emerald' | 'agri' | 'crimson' | 'neutral' | 'demo';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  icon,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center gap-1.5 font-medium rounded-full tracking-wide select-none';

  const variants = {
    teal: 'bg-[#E8F4F6] text-[#0E7490] border border-[#0E7490]/30',
    climate: 'bg-[#E8F4F6] text-[#0E7490] border border-[#0E7490]/30',
    amber: 'bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/40',
    azure: 'bg-[#DBEAFE] text-[#2563EB] border border-[#2563EB]/30',
    emerald: 'bg-[#E4F0E8] text-[#3F7D58] border border-[#3F7D58]/40',
    agri: 'bg-[#E4F0E8] text-[#3F7D58] border border-[#3F7D58]/40',
    crimson: 'bg-red-50 text-red-700 border border-red-200',
    neutral: 'bg-[#EAF0F2] text-[#486581] border border-[#B8C5CC]',
    demo: 'bg-[#FEF3C7] text-[#102A43] border border-[#D97706]/50 font-semibold uppercase tracking-wider',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {icon && <span className="inline-flex shrink-0 text-current">{icon}</span>}
      {children}
    </span>
  );
};
