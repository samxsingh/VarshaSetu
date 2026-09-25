import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted' | 'accent' | 'warning' | 'alert';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-surface-border text-slate-900 shadow-card',
      muted: 'bg-surface-muted border border-surface-border text-slate-800',
      accent: 'bg-white border-l-4 border-l-brand-teal border-y border-r border-surface-border shadow-card',
      warning: 'bg-white border-l-4 border-l-brand-amber border-y border-r border-surface-border shadow-card',
      alert: 'bg-white border-l-4 border-l-brand-crimson border-y border-r border-surface-border shadow-card',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl p-5 transition-all duration-200',
          variants[variant],
          interactive && 'cursor-pointer hover:border-brand-teal hover:shadow-elevated active:scale-[0.99]',
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
  <h3 className={cn('font-heading font-semibold text-lg text-slate-900 tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-sm text-slate-600', className)} {...props}>
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
  <div className={cn('flex items-center pt-4 border-t border-surface-border/60 mt-4', className)} {...props}>
    {children}
  </div>
);
