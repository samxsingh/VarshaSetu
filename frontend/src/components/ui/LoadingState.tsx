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
        <div className="w-12 h-12 rounded-full border-4 border-[#0E7490]/20 border-t-[#0E7490] animate-spin" />
        <div className="absolute w-2.5 h-2.5 rounded-full bg-[#0E7490] animate-ping" />
      </div>
      <p className="text-xs sm:text-sm font-heading font-bold text-[#102A43] tracking-wide animate-pulse">{label}</p>
      <span className="sr-only">Loading</span>
    </div>
  );
};
