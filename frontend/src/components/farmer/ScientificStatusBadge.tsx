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

  const upper = status.toUpperCase();
  let colorStyles = 'bg-[#EAF0F2] border-[#102A43]/40 text-[#102A43]';
  let dotColor = 'bg-[#102A43]';

  if (upper.includes('HEALTHY') || upper.includes('VERIFIED')) {
    colorStyles = 'bg-[#E4F0E8] border-[#3F7D58]/40 text-[#3F7D58]';
    dotColor = 'bg-[#3F7D58]';
  } else if (upper.includes('WARNING') || upper.includes('CAUTION') || upper.includes('ALERT')) {
    colorStyles = 'bg-[#FEF3C7] border-[#D97706]/50 text-[#D97706]';
    dotColor = 'bg-[#D97706]';
  } else if (upper.includes('ACTIVE') || upper.includes('SCIENTIFIC') || upper.includes('PILOT')) {
    colorStyles = 'bg-[#E8F4F6] border-[#0E7490]/40 text-[#0E7490]';
    dotColor = 'bg-[#0E7490]';
  } else if (upper.includes('DEMO')) {
    colorStyles = 'bg-[#FEF3C7] border-[#D97706]/40 text-[#D97706]';
    dotColor = 'bg-[#D97706]';
  } else if (upper.includes('NOT CONFIGURED') || upper.includes('OFFLINE')) {
    colorStyles = 'bg-[#EAF0F2] border-[#829AB1]/40 text-[#829AB1]';
    dotColor = 'bg-[#829AB1]';
  } else if (upper.includes('DIAGNOSTIC')) {
    // Neutral dark-blue treatment for scientific boundary state
    colorStyles = 'bg-[#EAF0F2] border-[#102A43]/30 text-[#102A43]';
    dotColor = 'bg-[#0E7490]';
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#102A43] ${colorStyles} ${
        isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse shrink-0`} />
      <span>{status}</span>
    </div>
  );
};
