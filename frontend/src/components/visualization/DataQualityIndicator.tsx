import React from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

export interface DataQualityIndicatorProps {
  sourceName: string;
  sourceId: string;
  provider: string;
  lastIngestion: string;
  observationCount: number | string;
  missingnessPct: number;
  latencySeconds?: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'STALE';
  provenanceNote?: string;
  className?: string;
}

export const DataQualityIndicator: React.FC<DataQualityIndicatorProps> = ({
  sourceName,
  sourceId,
  provider,
  lastIngestion,
  observationCount,
  missingnessPct,
  latencySeconds,
  status,
  provenanceNote,
  className,
}) => {
  const statusConfig = {
    HEALTHY: {
      badge: 'bg-[#E4F0E8] text-[#3F7D58] border-[#3F7D58]/40',
      icon: <CheckCircle2 className="w-4 h-4 text-[#3F7D58]" />,
      label: 'HEALTHY',
    },
    WARNING: {
      badge: 'bg-[#FEF3C7] text-[#D97706] border-[#D97706]/40',
      icon: <AlertTriangle className="w-4 h-4 text-[#D97706]" />,
      label: 'WARNING',
    },
    CRITICAL: {
      badge: 'bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/40',
      icon: <XCircle className="w-4 h-4 text-[#DC2626]" />,
      label: 'CRITICAL',
    },
    STALE: {
      badge: 'bg-[#F3F6F7] text-[#486581] border-[#102A43]/20',
      icon: <Clock className="w-4 h-4 text-[#829AB1]" />,
      label: 'STALE',
    },
  }[status];

  return (
    <div
      className={cn(
        'p-3.5 bg-white rounded-xl border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0">{statusConfig.icon}</div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-[#102A43] text-sm">
              {sourceName}
            </span>
            <span className="font-mono text-[10px] text-[#829AB1] bg-[#F3F6F7] px-1.5 py-0.5 rounded border border-[#102A43]/10">
              {sourceId}
            </span>
          </div>
          <span className="text-[11px] text-[#486581] block">
            Provider: {provider}
            {provenanceNote && ` • ${provenanceNote}`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 flex-wrap font-mono text-[11px]">
        <div>
          <span className="text-[9px] text-[#829AB1] uppercase block">Observations</span>
          <strong className="text-[#102A43]">{observationCount}</strong>
        </div>

        <div>
          <span className="text-[9px] text-[#829AB1] uppercase block">Missingness</span>
          <strong className={missingnessPct > 5 ? 'text-[#D97706]' : 'text-[#3F7D58]'}>
            {missingnessPct.toFixed(1)}%
          </strong>
        </div>

        <div>
          <span className="text-[9px] text-[#829AB1] uppercase block">Ingested</span>
          <span className="text-[#486581]">{lastIngestion}</span>
        </div>

        {latencySeconds !== undefined && (
          <div>
            <span className="text-[9px] text-[#829AB1] uppercase block">Latency</span>
            <span className="text-[#486581]">{latencySeconds}s</span>
          </div>
        )}

        <span
          className={cn(
            'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border shrink-0',
            statusConfig.badge
          )}
        >
          {statusConfig.label}
        </span>
      </div>
    </div>
  );
};
