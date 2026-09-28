import React from 'react';
import { FreshnessClassification } from '../../services/weatherService';

interface DataFreshnessBadgeProps {
  status: FreshnessClassification | string;
  source?: string;
  updatedAtIST?: string;
  className?: string;
}

export const DataFreshnessBadge: React.FC<DataFreshnessBadgeProps> = ({
  status,
  source,
  updatedAtIST,
  className = '',
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'LIVE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'RECENT':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'HISTORICAL':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'SIMULATED':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'UNAVAILABLE':
      case 'STALE':
      default:
        return 'bg-rose-50 text-rose-800 border-rose-300';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'LIVE':
        return 'LIVE INGESTION';
      case 'RECENT':
        return 'RECENT ANALYSIS';
      case 'HISTORICAL':
        return 'HISTORICAL BASELINE';
      case 'SIMULATED':
        return 'SYNTHETIC SIMULATION';
      case 'STALE':
        return 'CACHED / STALE';
      default:
        return status;
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono font-medium ${getBadgeStyle()} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      <span>{getLabel()}</span>
      {source && <span className="opacity-75 font-normal">({source})</span>}
      {updatedAtIST && <span className="text-[10px] opacity-70 ml-1">· {updatedAtIST}</span>}
    </div>
  );
};
