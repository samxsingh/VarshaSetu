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
        'flex flex-col items-center justify-center text-center p-8 bg-surface-muted/60 border border-dashed border-surface-border rounded-2xl max-w-lg mx-auto my-6',
        className
      )}
    >
      <div className="p-3 bg-white rounded-full shadow-sm border border-surface-border mb-3 text-brand-teal">
        {icon}
      </div>
      <h4 className="font-heading font-semibold text-lg text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-600 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
