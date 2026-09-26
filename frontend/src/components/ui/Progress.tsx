import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  color?: 'teal' | 'amber' | 'azure' | 'emerald' | 'crimson';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  color = 'teal',
  height = 'md',
  showLabel = false,
  className,
  ...props
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const colors = {
    teal: 'bg-[#0E7490]',
    amber: 'bg-[#D97706]',
    azure: 'bg-[#2563EB]',
    emerald: 'bg-[#3F7D58]',
    crimson: 'bg-[#DC2626]',
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      <div className={cn('w-full bg-[#EAF0F2] border border-[#102A43]/20 rounded-full overflow-hidden', heights[height])}>
        <div
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          className={cn('h-full transition-all duration-300 rounded-full', colors[color])}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-mono text-[#829AB1] mt-1">
          <span>0%</span>
          <span className="font-heading font-bold text-[#102A43]">{clampedValue}%</span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
};
