import React from 'react';
import { cn } from '../../utils/cn';

export interface LoadingStateProps {
  label?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Checking monsoon intelligence...',
  className,
}) => {
  return (
    <div
      role="status"
      className={cn('flex flex-col items-center justify-center py-12 px-4 space-y-4 text-center', className)}
    >
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-teal/20 border-t-brand-teal animate-spin" />
        <div className="absolute w-2 h-2 rounded-full bg-brand-teal animate-ping" />
      </div>
      <p className="text-sm font-medium font-heading text-slate-700 animate-pulse">{label}</p>
      <span className="sr-only">Loading</span>
    </div>
  );
};
