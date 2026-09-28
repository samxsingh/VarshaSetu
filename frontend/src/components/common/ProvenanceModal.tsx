import React from 'react';
import { X, ShieldCheck, Database, Clock, Compass, Layers } from 'lucide-react';

export interface ProvenanceDetails {
  title?: string;
  source: string;
  dataset: string;
  observedAtIST?: string;
  retrievedAtIST?: string;
  resolution?: string;
  modelFamily?: string;
  processing?: string;
  fallbackUsed?: boolean;
  fallbackChain?: string[];
  attribution?: string;
  freshnessStatus?: string;
}

interface ProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: ProvenanceDetails | null;
}

export const ProvenanceModal: React.FC<ProvenanceModalProps> = ({
  isOpen,
  onClose,
  details,
}) => {
  if (!isOpen || !details) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border-2 border-slate-900 rounded-lg max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 bg-[#f8f5ee] border-b border-[#e2ddd3]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="font-mono font-bold text-slate-900 text-sm tracking-wide">
              SCIENTIFIC DATA PROVENANCE RECORD
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {details.title && (
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[11px] font-mono uppercase text-slate-400">Target Metric</span>
              <div className="font-bold text-slate-900 text-base">{details.title}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Database className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px] uppercase">Primary Source</span>
              </div>
              <div className="font-semibold text-slate-800">{details.source}</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px] uppercase">Dataset Identity</span>
              </div>
              <div className="font-semibold text-slate-800">{details.dataset}</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px] uppercase">Observation Time</span>
              </div>
              <div className="font-medium text-slate-800">{details.observedAtIST || 'Current Cycle'}</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px] uppercase">Ingestion / Retrieval</span>
              </div>
              <div className="font-medium text-slate-800">{details.retrievedAtIST || 'Recent Synchronization'}</div>
            </div>
          </div>

          <div className="bg-[#fcfaf7] border border-[#e2ddd3] rounded p-3 text-xs space-y-2">
            <div>
              <span className="font-mono text-[10px] uppercase text-slate-500">Spatial / Temporal Resolution</span>
              <div className="font-medium text-slate-800">{details.resolution || 'Block Centroid (~9 km Gridded) / Daily'}</div>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase text-slate-500">Numerical Model / Algorithm</span>
              <div className="font-medium text-slate-800">{details.modelFamily || 'Numerical Weather Prediction (ECMWF IFS / GFS)'}</div>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase text-slate-500">Quality Processing & Verification</span>
              <div className="font-medium text-slate-800">{details.processing || 'Canonical normalization, Range validation, Climatology check'}</div>
            </div>
          </div>

          {details.fallbackUsed && details.fallbackChain && details.fallbackChain.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded p-3 text-xs">
              <span className="font-mono text-[10px] uppercase text-amber-800 font-bold block mb-1">
                Failover & Provenance Fallback Chain
              </span>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-900 text-[11px]">
                {details.fallbackChain.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {details.attribution && (
            <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
              Attribution: {details.attribution}
            </div>
          )}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-bold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors"
          >
            Close Provenance
          </button>
        </div>
      </div>
    </div>
  );
};
