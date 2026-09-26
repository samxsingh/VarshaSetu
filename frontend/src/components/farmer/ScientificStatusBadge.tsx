import React from 'react';

interface ScientificStatusBadgeProps {
  status?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const ScientificStatusBadge: React.FC<ScientificStatusBadgeProps> = ({
  status = 'DIAGNOSTIC ONLY',
  className = '',
  size = 'md',
}) => {
  const isSm = size === 'sm';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218] font-mono font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#0B1726] ${
        isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#E5A33D] animate-pulse shrink-0" />
      <span>{status}</span>
    </div>
  );
};
