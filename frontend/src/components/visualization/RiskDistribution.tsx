import React from 'react';
import { cn } from '../../utils/cn';

export interface RiskDistributionItem {
  key: string;
  label: string;
  count: number;
  color: string;
  borderColor?: string;
  description?: string;
}

export interface RiskDistributionProps {
  title?: string;
  subtitle?: string;
  items: RiskDistributionItem[];
  totalLabel?: string;
  className?: string;
  ariaLabel?: string;
}

export const RiskDistribution: React.FC<RiskDistributionProps> = ({
  title = 'Administrative Block Distribution',
  subtitle = 'Spatial risk distribution across active monitoring centroids',
  items,
  totalLabel = 'Total Observed Blocks',
  className,
  ariaLabel = 'Risk distribution across administrative blocks',
}) => {
  const totalCount = items.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...items.map((i) => i.count), 1);

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn('space-y-4', className)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h4 className="font-heading font-black text-sm text-[#102A43] uppercase tracking-wider">
            {title}
          </h4>
          {subtitle && (
            <p className="text-xs text-[#486581] font-medium font-sans">
              {subtitle}
            </p>
          )}
        </div>
        <div className="text-xs font-mono font-bold text-[#102A43] bg-[#EAF0F2] px-2.5 py-1 rounded-lg border border-[#102A43]/15 self-start sm:self-auto">
          {totalLabel}: {totalCount}
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const pctOfTotal = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
          const barWidth = Math.max(4, Math.round((item.count / maxCount) * 100));

          return (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#102A43] flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm inline-block border"
                    style={{
                      backgroundColor: item.color,
                      borderColor: item.borderColor || item.color,
                    }}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#102A43] text-sm">{item.count}</span>
                  <span className="text-[#829AB1] text-[10px]">({pctOfTotal}%)</span>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full bg-[#EAF0F2] h-3 rounded-full border border-[#102A43]/20 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: item.color,
                  }}
                  role="meter"
                  aria-label={`${item.label}: ${item.count} blocks (${pctOfTotal}%)`}
                  aria-valuenow={item.count}
                  aria-valuemin={0}
                  aria-valuemax={totalCount}
                />
              </div>

              {item.description && (
                <span className="text-[10px] text-[#829AB1] font-sans block pl-4">
                  {item.description}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
