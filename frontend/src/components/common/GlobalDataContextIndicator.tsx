import React, { useState } from 'react';
import { useOperationalData } from '../../context/OperationalDataContext';
import { ProvenanceModal } from './ProvenanceModal';
import { Clock, ShieldCheck, Database, Info } from 'lucide-react';

interface Props {
  className?: string;
  showDetailsOnClick?: boolean;
}

export const GlobalDataContextIndicator: React.FC<Props> = ({
  className = '',
  showDetailsOnClick = true,
}) => {
  const {
    currentDateLabel,
    referenceTimeIST,
    freshnessStatus,
    dataMode,
    sourceAttribution,
    dataContext,
  } = useOperationalData();
  const [modalOpen, setModalOpen] = useState(false);

  // Status configuration
  const config = {
    LIVE: {
      badge: 'LIVE',
      dotColor: 'bg-emerald-500',
      pillBg: 'bg-emerald-50/90 text-emerald-800 border-emerald-300',
    },
    RECENT: {
      badge: 'RECENT',
      dotColor: 'bg-amber-500',
      pillBg: 'bg-amber-50/90 text-amber-800 border-amber-300',
    },
    HISTORICAL: {
      badge: 'HISTORICAL',
      dotColor: 'bg-slate-500',
      pillBg: 'bg-slate-100 text-slate-700 border-slate-300',
    },
    CLIMATOLOGICAL: {
      badge: 'CLIMATOLOGY',
      dotColor: 'bg-blue-500',
      pillBg: 'bg-blue-50 text-blue-800 border-blue-300',
    },
    SIMULATED: {
      badge: 'SIMULATED',
      dotColor: 'bg-purple-500',
      pillBg: 'bg-purple-50 text-purple-800 border-purple-300',
    },
    UNAVAILABLE: {
      badge: 'UNAVAILABLE',
      dotColor: 'bg-red-500',
      pillBg: 'bg-red-50 text-red-800 border-red-300',
    },
  }[freshnessStatus] || {
    badge: 'LIVE',
    dotColor: 'bg-emerald-500',
    pillBg: 'bg-emerald-50/90 text-emerald-800 border-emerald-300',
  };

  return (
    <>
      <button
        type="button"
        onClick={() => showDetailsOnClick && setModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono font-medium transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0E7490] ${config.pillBg} ${className}`}
        title="Current Operational Data Context (Click to inspect provenance & audit chain)"
      >
        <span className="relative flex h-2 w-2">
          {freshnessStatus === 'LIVE' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
        </span>
        <span className="font-bold tracking-wider">{config.badge}</span>
        <span className="opacity-40">•</span>
        <span className="font-sans font-medium hidden md:inline">{currentDateLabel}</span>
        <span className="opacity-40 hidden md:inline">•</span>
        <span>{referenceTimeIST}</span>
        {showDetailsOnClick && <Info className="w-3 h-3 opacity-60 ml-0.5" />}
      </button>

      {modalOpen && (
        <ProvenanceModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          details={{
            title: 'Operational Data Context & Provenance',
            source: sourceAttribution,
            dataset: 'Canonical Meteorological Assimilation',
            observedAtIST: dataContext?.observedAt || referenceTimeIST,
            retrievedAtIST: dataContext?.generatedAt || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            resolution: 'District Centroid (Bakshi Ka Talab ~9km)',
            modelFamily: 'ECMWF IFS / IMD AWS Gridded Telemetry',
            freshnessStatus: freshnessStatus,
            attribution: 'VarshaSetu Operational Meteorological Synchronization Layer',
          }}
        />
      )}
    </>
  );
};
