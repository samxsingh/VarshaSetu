import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning' | 'danger' | 'success';
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = 'info',
  title,
  children,
  ...props
}) => {
  const configs = {
    info: {
      container: 'bg-brand-azure-tint/60 border-brand-azure-border text-brand-azure-dark',
      icon: <Info className="w-5 h-5 text-brand-azure shrink-0 mt-0.5" />,
    },
    warning: {
      container: 'bg-brand-amber-tint/70 border-brand-amber-border text-brand-amber-dark',
      icon: <AlertTriangle className="w-5 h-5 text-brand-amber shrink-0 mt-0.5" />,
    },
    danger: {
      container: 'bg-brand-crimson-tint/70 border-brand-crimson-border text-brand-crimson-dark',
      icon: <AlertCircle className="w-5 h-5 text-brand-crimson shrink-0 mt-0.5" />,
    },
    success: {
      container: 'bg-brand-emerald-tint/70 border-brand-emerald-border text-brand-emerald-dark',
      icon: <CheckCircle2 className="w-5 h-5 text-brand-emerald shrink-0 mt-0.5" />,
    },
  };

  const current = configs[variant];

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 p-4 rounded-xl border text-sm leading-relaxed',
        current.container,
        className
      )}
      {...props}
    >
      {current.icon}
      <div className="flex-1">
        {title && <h5 className="font-heading font-semibold text-slate-900 mb-1">{title}</h5>}
        <div className="text-slate-800">{children}</div>
      </div>
    </div>
  );
};
