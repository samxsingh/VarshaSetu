import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#102A43]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#829AB1] pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-white border-2 border-[#102A43] text-[#102A43] rounded-xl px-3.5 py-2.5 text-sm transition-all focus:border-[#0E7490] focus:ring-2 focus:ring-[#0E7490]/20 focus:outline-none min-h-[44px] shadow-[2px_2px_0px_#102A43]',
              leftIcon && 'pl-10',
              error && 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-[#DC2626] font-medium font-sans">{error}</span>}
        {!error && helperText && <span className="text-xs text-[#829AB1] font-sans">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
