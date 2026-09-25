import React from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'pill' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  className,
  variant = 'pill',
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1 overflow-x-auto no-scrollbar',
        variant === 'pill' ? 'bg-surface-muted p-1 rounded-full border border-surface-border' : 'border-b border-surface-border',
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium font-heading transition-all whitespace-nowrap min-h-[40px]',
              variant === 'pill'
                ? isActive
                  ? 'bg-brand-teal text-white rounded-full shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 rounded-full hover:bg-white/50'
                : isActive
                ? 'border-b-2 border-brand-teal text-brand-teal font-semibold'
                : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'
            )}
          >
            {item.icon && <span className="inline-flex shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
