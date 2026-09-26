import React from 'react';
import { cn } from '../../utils/cn';

export interface LegendItem {
  id: string;
  label: string;
  color: string;
  border?: string;
  value?: string | number;
  shape?: 'circle' | 'square' | 'line' | 'dashed-line';
  description?: string;
}

export interface ScientificLegendProps {
  items: LegendItem[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  ariaLabel?: string;
}

export const ScientificLegend: React.FC<ScientificLegendProps> = ({
  items,
  className,
  orientation = 'horizontal',
  ariaLabel = 'Chart data series legend',
}) => {
  return (
    <ul
      aria-label={ariaLabel}
      className={cn(
        'flex flex-wrap gap-x-4 gap-y-2 text-xs font-sans',
        orientation === 'vertical' && 'flex-col gap-y-2.5',
        className
      )}
    >
      {items.map((item, idx) => (
        <li key={item.id || item.label || idx} className="flex items-center gap-2">
          {item.shape === 'line' ? (
            <span
              className="w-4 h-0.5 inline-block shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
          ) : item.shape === 'dashed-line' ? (
            <span
              className="w-4 h-0.5 inline-block shrink-0 border-t-2 border-dashed"
              style={{ borderColor: item.color }}
              aria-hidden="true"
            />
          ) : item.shape === 'square' ? (
            <span
              className="w-3 h-3 inline-block shrink-0 rounded-sm border"
              style={{
                backgroundColor: item.color,
                borderColor: item.border || item.color,
              }}
              aria-hidden="true"
            />
          ) : (
            <span
              className="w-2.5 h-2.5 inline-block shrink-0 rounded-full border"
              style={{
                backgroundColor: item.color,
                borderColor: item.border || item.color,
              }}
              aria-hidden="true"
            />
          )}

          <span className="font-bold text-[#102A43]">{item.label}</span>

          {item.value !== undefined && (
            <span className="font-mono text-[11px] text-[#486581]">
              ({item.value})
            </span>
          )}

          {item.description && (
            <span className="text-[10px] text-[#829AB1] hidden sm:inline">
              — {item.description}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};
