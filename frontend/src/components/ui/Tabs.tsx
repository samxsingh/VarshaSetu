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
        'flex items-center gap-1.5 overflow-x-auto no-scrollbar',
        variant === 'pill' ? 'bg-[#EAF0F2] p-1.5 rounded-xl border-2 border-[#102A43]/20' : 'border-b-2 border-[#102A43]/20',
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
              'flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-heading font-bold transition-all whitespace-nowrap min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490] active:translate-x-0.5 active:translate-y-0.5',
              variant === 'pill'
                ? isActive
                  ? 'bg-[#0E7490] text-white border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] rounded-lg'
                  : 'text-[#486581] hover:text-[#102A43] hover:bg-white rounded-lg border-2 border-transparent'
                : isActive
                ? 'border-b-2 border-[#0E7490] text-[#0E7490] -mb-[2px]'
                : 'text-[#486581] hover:text-[#102A43] border-b-2 border-transparent'
            )}
          >
            {item.icon && <span className="inline-flex shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded font-mono font-bold',
                  isActive ? 'bg-white/20 text-white' : 'bg-[#102A43]/10 text-[#102A43]'
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
