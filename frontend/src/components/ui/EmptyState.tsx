import React from 'react';
import { CloudOff } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <CloudOff className="w-10 h-10 text-slate-400" />,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 bg-[#F3F6F7] border-2 border-dashed border-[#102A43]/30 rounded-2xl max-w-lg mx-auto my-6 shadow-[2px_2px_0px_#102A43]',
        className
      )}
    >
      <div className="p-3 bg-white rounded-xl shadow-[2px_2px_0px_#102A43] border-2 border-[#102A43] mb-3 text-[#0E7490]">
        {icon}
      </div>
      <h4 className="font-heading font-extrabold text-base sm:text-lg text-[#102A43] mb-1 tracking-tight">{title}</h4>
      <p className="text-xs sm:text-sm text-[#486581] max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
