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
      container: 'bg-[#DBEAFE] border-2 border-[#102A43] text-[#1E40AF] shadow-[2px_2px_0px_#102A43]',
      icon: <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />,
    },
    warning: {
      container: 'bg-[#FEF3C7] border-2 border-[#102A43] text-[#B45309] shadow-[2px_2px_0px_#102A43]',
      icon: <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />,
    },
    danger: {
      container: 'bg-[#FEF2F2] border-2 border-[#102A43] text-[#DC2626] shadow-[2px_2px_0px_#102A43]',
      icon: <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />,
    },
    success: {
      container: 'bg-[#EBF5EE] border-2 border-[#102A43] text-[#3F7D58] shadow-[2px_2px_0px_#102A43]',
      icon: <CheckCircle2 className="w-5 h-5 text-[#3F7D58] shrink-0 mt-0.5" />,
    },
  };

  const current = configs[variant];

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 p-4 rounded-xl text-sm leading-relaxed',
        current.container,
        className
      )}
      {...props}
    >
      {current.icon}
      <div className="flex-1">
        {title && <h5 className="font-heading font-extrabold text-[#102A43] text-sm mb-1">{title}</h5>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
};
