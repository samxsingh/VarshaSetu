import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, helperText, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#102A43]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full bg-white border-2 border-[#102A43] text-[#102A43] rounded-xl px-3.5 py-2.5 text-sm appearance-none focus:border-[#0E7490] focus:ring-2 focus:ring-[#0E7490]/20 focus:outline-none min-h-[44px] pr-10 shadow-[2px_2px_0px_#102A43]',
              error && 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 text-[#829AB1] pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <span className="text-xs text-[#DC2626] font-medium font-sans">{error}</span>}
        {!error && helperText && <span className="text-xs text-[#829AB1] font-sans">{helperText}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
