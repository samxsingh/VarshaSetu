import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'amber' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-heading font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none min-h-[44px]';

    const variants = {
      primary:
        'bg-[#0E7490] text-white border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] hover:bg-[#155E75] hover:shadow-[4px_4px_0px_#102A43] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#102A43] rounded-xl',
      secondary:
        'bg-white text-[#102A43] border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] hover:bg-[#EAF0F2] hover:shadow-[4px_4px_0px_#102A43] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#102A43] rounded-xl',
      outline:
        'bg-transparent text-[#102A43] border-2 border-[#102A43] hover:bg-[#EAF0F2] rounded-xl',
      ghost:
        'bg-transparent text-[#486581] hover:text-[#102A43] hover:bg-[#EAF0F2] rounded-xl min-h-[40px]',
      amber:
        'bg-[#D97706] text-white border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] hover:bg-[#B45309] hover:shadow-[4px_4px_0px_#102A43] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#102A43] rounded-xl',
      danger:
        'bg-[#DC2626] text-white border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] hover:bg-[#991B1B] hover:shadow-[4px_4px_0px_#102A43] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#102A43] rounded-xl',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
