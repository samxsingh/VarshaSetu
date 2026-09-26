import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted' | 'accent' | 'warning' | 'alert' | 'agronomic';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border-2 border-[#102A43] text-[#102A43] shadow-[4px_4px_0px_#102A43]',
      muted: 'bg-[#EAF0F2] border-2 border-[#102A43] text-[#102A43] shadow-[3px_3px_0px_#102A43]',
      accent: 'bg-[#E8F4F6] border-2 border-[#102A43] text-[#102A43] shadow-[4px_4px_0px_#102A43]',
      warning: 'bg-[#FEF3C7] border-2 border-[#102A43] text-[#102A43] shadow-[4px_4px_0px_#102A43]',
      agronomic: 'bg-[#E4F0E8] border-2 border-[#102A43] text-[#102A43] shadow-[4px_4px_0px_#102A43]',
      alert: 'bg-white border-l-4 border-l-[#DC2626] border-y-2 border-r-2 border-[#102A43] text-[#102A43] shadow-[4px_4px_0px_#102A43]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-5 sm:p-6 transition-all duration-200',
          variants[variant],
          interactive && 'cursor-pointer hover:border-[#0E7490] hover:shadow-[5px_5px_0px_#102A43] active:translate-x-0.5 active:translate-y-0.5',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('flex flex-col space-y-1.5 pb-3', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('font-heading font-bold text-lg text-[#102A43] tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-sm text-[#486581]', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('pt-1', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('flex items-center pt-4 border-t border-[#102A43]/10 mt-4', className)} {...props}>
    {children}
  </div>
);
