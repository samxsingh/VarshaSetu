import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldAlert,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Activity,
  Layers,
  FileCheck,
} from 'lucide-react';
import { OperationalSignalDTO, SignalSeverity, OperationalSignalType } from '../../services/operationalService';
import { cn } from '../../utils/cn';

interface OperationalSignalCardProps {
  signal: OperationalSignalDTO;
  onInspectEvidence?: (signal: OperationalSignalDTO) => void;
  onInspectDetails?: (signal: OperationalSignalDTO) => void;
  compact?: boolean;
}

const SEVERITY_STYLES: Record<
  SignalSeverity,
  { bg: string; border: string; text: string; badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  CRITICAL: {
    bg: 'bg-red-50/70 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-900/50',
    text: 'text-red-900 dark:text-red-200',
    badge: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800',
    icon: AlertTriangle,
  },
  WARNING: {
    bg: 'bg-amber-50/70 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-900/50',
    text: 'text-amber-900 dark:text-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-800',
    icon: AlertCircle,
  },
  WATCH: {
    bg: 'bg-sky-50/70 dark:bg-sky-950/20',
    border: 'border-sky-200 dark:border-sky-900/50',
    text: 'text-sky-900 dark:text-sky-200',
    badge: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/50 dark:text-sky-200 dark:border-sky-800',
    icon: Info,
  },
  INFO: {
    bg: 'bg-slate-50/70 dark:bg-slate-900/40',
    border: 'border-slate-200 dark:border-slate-800',
    text: 'text-slate-900 dark:text-slate-200',
    badge: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    icon: Activity,
  },
};

const TYPE_LABELS: Record<OperationalSignalType, string> = {
  EVENT: 'Meteorological Event',
  FORECAST_CHANGE: 'Forecast Transition',
  ADVISORY: 'Extension Advisory',
  DATA_QUALITY: 'Telemetry Quality',
  MODEL_STATUS: 'Model Calibration Status',
  OPERATIONAL_GATE: 'Scientific Verification Gate',
};

export const OperationalSignalCard: React.FC<OperationalSignalCardProps> = ({
  signal,
  onInspectEvidence,
  onInspectDetails,
  compact = false,
}) => {
  const severityStyle = SEVERITY_STYLES[signal.severity] || SEVERITY_STYLES.INFO;
  const IconComponent = severityStyle.icon;

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'NOT SPECIFIED';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const probabilityDisplay =
    typeof signal.probability === 'number'
      ? `${Math.round(signal.probability * 100)}%`
      : 'NOT AVAILABLE';

  return (
    <article
      data-testid={`signal-card-${signal.signalId}`}
      className={cn(
        'rounded-xl border p-4 sm:p-5 transition-all shadow-sm hover:shadow-md bg-white dark:bg-slate-900/90',
        severityStyle.border,
        compact ? 'p-3 text-sm' : ''
      )}
      aria-label={`Operational signal: ${signal.title}`}
    >
      {/* Header bar: Severity, Type, Block */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border',
              severityStyle.badge
            )}
          >
            <IconComponent className="w-3.5 h-3.5" />
            {signal.severity}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            {TYPE_LABELS[signal.signalType] || signal.signalType}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono">{signal.blockId}</span>
        </div>
      </div>

      {/* Title & Summary */}
      <div className="mb-3">
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
          {signal.title}
        </h4>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {signal.summary}
        </p>
      </div>

      {/* Scientific & Operational Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs mb-3">
        <div>
          <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
            Probability
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {probabilityDisplay}
          </span>
        </div>
        <div>
          <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
            Confidence
          </span>
          <span
            className={cn(
              'font-semibold',
              signal.confidenceStatus === 'CALIBRATED' || signal.confidenceStatus === 'PASS'
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-amber-700 dark:text-amber-400'
            )}
          >
            {signal.confidenceStatus}
          </span>
        </div>
        <div>
          <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
            Operational Mode
          </span>
          <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
            {signal.operationalStatus}
          </span>
        </div>
        <div>
          <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
            Data Freshness
          </span>
          <span className="font-mono text-slate-600 dark:text-slate-400 truncate block">
            {signal.dataFreshness}
          </span>
        </div>
      </div>

      {/* Validity window */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span>
          Valid: <span className="font-medium text-slate-700 dark:text-slate-300">{formatDate(signal.validFrom)}</span>
          {' → '}
          <span className="font-medium text-slate-700 dark:text-slate-300">{formatDate(signal.validUntil)}</span>
        </span>
      </div>

      {/* Recommended Inspection note */}
      {signal.recommendedInspection && (
        <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 mb-3 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Recommended Operational Action: </span>
            {signal.recommendedInspection}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          {signal.sourceReferences.map((ref, idx) => (
            <span
              key={`${ref.id}-${idx}`}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono"
            >
              <Layers className="w-3 h-3 text-slate-400" />
              {ref.label || ref.id}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {onInspectEvidence && (
            <button
              type="button"
              onClick={() => onInspectEvidence(signal)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-1 px-2.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              aria-label={`View evidence for ${signal.title}`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              Evidence →
            </button>
          )}

          {onInspectDetails && (
            <button
              type="button"
              onClick={() => onInspectDetails(signal)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors py-1 px-2.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label={`Inspect ${signal.title}`}
            >
              Inspect
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
