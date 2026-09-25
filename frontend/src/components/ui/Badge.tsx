import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'teal' | 'amber' | 'azure' | 'emerald' | 'crimson' | 'neutral' | 'demo';
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
    teal: 'bg-brand-teal-tint text-brand-teal-dark border border-brand-teal-border',
    amber: 'bg-brand-amber-tint text-brand-amber-dark border border-brand-amber-border',
    azure: 'bg-brand-azure-tint text-brand-azure-dark border border-brand-azure-border',
    emerald: 'bg-brand-emerald-tint text-brand-emerald-dark border border-brand-emerald-border',
    crimson: 'bg-brand-crimson-tint text-brand-crimson-dark border border-brand-crimson-border',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    demo: 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold uppercase tracking-wider',
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
