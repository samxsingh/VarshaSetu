import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  Filter,
  RefreshCw,
  Radio,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import {
  operationalService,
  OperationalSignalDTO,
  OperationalSignalType,
  SignalSeverity,
} from '../../services/operationalService';
import { useRealtimeStore } from '../../stores/useRealtimeStore';
import { OperationalSignalCard } from './OperationalSignalCard';
import { ProvenanceDrawer, ProvenanceDetails } from '../visualization/ProvenanceDrawer';
import { cn } from '../../utils/cn';

interface OperationalSignalCenterProps {
  blockId?: string;
  persona?: 'FARMER' | 'OFFICER' | 'GOVERNMENT' | 'CLIMATE_ANALYST' | 'ADMIN';
  title?: string;
  description?: string;
  compact?: boolean;
  maxItems?: number;
  className?: string;
}

const TYPE_TABS: { label: string; value: 'ALL' | OperationalSignalType }[] = [
  { label: 'All Signals', value: 'ALL' },
  { label: 'Events', value: 'EVENT' },
  { label: 'Forecasts', value: 'FORECAST_CHANGE' },
  { label: 'Advisories', value: 'ADVISORY' },
  { label: 'Gates & Quality', value: 'OPERATIONAL_GATE' },
];

const SEVERITY_OPTIONS: { label: string; value: 'ALL' | SignalSeverity }[] = [
  { label: 'All Severities', value: 'ALL' },
  { label: 'Critical Only', value: 'CRITICAL' },
  { label: 'Warning', value: 'WARNING' },
  { label: 'Watch', value: 'WATCH' },
  { label: 'Info', value: 'INFO' },
];

export const OperationalSignalCenter: React.FC<OperationalSignalCenterProps> = ({
  blockId,
  persona,
  title = 'Operational Intelligence Signals',
  description = 'Deterministic operational signals derived from scientific telemetry, calibrated forecasts, and verification gates.',
  compact = false,
  maxItems,
  className,
}) => {
  const [apiSignals, setApiSignals] = useState<OperationalSignalDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'ALL' | OperationalSignalType>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | SignalSeverity>('ALL');
  const [provenanceSignal, setProvenanceSignal] = useState<OperationalSignalDTO | null>(null);

  // Realtime signals from store
  const realtimeSignals = useRealtimeStore((state) => state.operationalSignals);
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus);

  // Fetch signals from authoritative Express API
  const fetchSignals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await operationalService.getSignals({
        blockId,
      });

      if (res.data && Array.isArray(res.data.items)) {
        setApiSignals(res.data.items);
      } else {
        setApiSignals([]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to load operational signals');
    } finally {
      setLoading(false);
    }
  }, [blockId]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  // Merge API signals with Realtime Store signals (deduplicating on signalId)
  const mergedSignals = useMemo(() => {
    const map = new Map<string, OperationalSignalDTO>();

    // Start with API signals
    apiSignals.forEach((sig) => {
      map.set(sig.signalId, sig);
    });

    // Layer in realtime signals (overriding or prepending)
    realtimeSignals.forEach((sig) => {
      if (!blockId || sig.blockId === blockId) {
        map.set(sig.signalId, sig);
      }
    });

    let list = Array.from(map.values());

    // Apply client filters
    if (selectedType !== 'ALL') {
      if (selectedType === 'OPERATIONAL_GATE') {
        list = list.filter((s) => s.signalType === 'OPERATIONAL_GATE' || s.signalType === 'DATA_QUALITY' || s.signalType === 'MODEL_STATUS');
      } else {
        list = list.filter((s) => s.signalType === selectedType);
      }
    }

    if (selectedSeverity !== 'ALL') {
      list = list.filter((s) => s.severity === selectedSeverity);
    }

    // Role-specific filtering
    if (persona === 'FARMER') {
      // Farmers see only non-internal signals
      list = list.filter((s) => s.signalType !== 'MODEL_STATUS');
    }

    // Sort descending by severity and detected time
    const severityOrder: Record<string, number> = { CRITICAL: 4, WARNING: 3, WATCH: 2, INFO: 1 };
    list.sort((a, b) => {
      const wA = severityOrder[a.severity] || 0;
      const wB = severityOrder[b.severity] || 0;
      if (wB !== wA) return wB - wA;
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
    });

    if (maxItems && maxItems > 0) {
      return list.slice(0, maxItems);
    }
    return list;
  }, [apiSignals, realtimeSignals, selectedType, selectedSeverity, persona, blockId, maxItems]);

  const handleOpenEvidence = (signal: OperationalSignalDTO) => {
    setProvenanceSignal(signal);
  };

  const provenanceData: ProvenanceDetails | undefined = useMemo(() => {
    if (!provenanceSignal) return undefined;
    return {
      dataSource: 'IMD Gridded Rainfall (0.25°) + ECMWF SEAS5 Ensemble Archive',
      stationsCovered: '1 AWS Station (Bakshi Ka Talab, UP_LKO_BKT)',
      spatialResolution: '0.25° (~25 km downscaled to block level ~9 km)',
      temporalCoverage: 'Kharif 2024 (Single-Season Baseline)',
      observationTimestamp: provenanceSignal.detectedAt,
      freshnessLatency: provenanceSignal.dataFreshness === 'HISTORICAL_ONLY' ? 'Archive Baseline' : 'Real-time Telemetry',
      modelPipeline: 'GDM-Precip-v2.4 (Calibrated Ensemble)',
      calibrator: 'Isotonic Regression (Holdout Kharif 2024)',
      validationStatus: provenanceSignal.validationStatus,
      pipelineNotes: `Operational Status: ${provenanceSignal.operationalStatus}. Crop decision commands are disabled under single-season governance.`,
    };
  }, [provenanceSignal]);

  return (
    <section
      data-testid="operational-signal-center"
      className={cn(
        'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 sm:p-6',
        className
      )}
      aria-labelledby="operational-signals-heading"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h3
              id="operational-signals-heading"
              className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight"
            >
              {title}
            </h3>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono"
              aria-live="polite"
            >
              {mergedSignals.length} Active
            </span>
            {connectionStatus === 'CONNECTED' && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* Controls: Refresh button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSignals}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Refresh operational signals"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading ? 'animate-spin' : '')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 pb-4">
        {/* Type pills */}
        <div
          role="tablist"
          aria-label="Filter signals by category"
          className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs"
        >
          {TYPE_TABS.map((tab) => {
            const isActive = selectedType === tab.value;
            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedType(tab.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-medium transition-all',
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Severity dropdown */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as any)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            aria-label="Filter by severity level"
          >
            {SEVERITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading && apiSignals.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mb-2 text-emerald-600" />
          <p className="text-xs">Querying operational intelligence pipeline...</p>
        </div>
      ) : error ? (
        <div className="py-8 px-4 text-center rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
          <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">{error}</p>
          <button
            type="button"
            onClick={fetchSignals}
            className="mt-3 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : mergedSignals.length === 0 ? (
        <div
          data-testid="signals-empty-state"
          className="py-12 px-4 text-center rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800"
        >
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No operational anomalies detected in active monitoring window
          </h4>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            All calibrated threshold gates and observational telemetry for this block are operating within nominal parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {mergedSignals.map((signal) => (
            <OperationalSignalCard
              key={signal.signalId}
              signal={signal}
              compact={compact}
              onInspectEvidence={handleOpenEvidence}
            />
          ))}
        </div>
      )}

      {/* Provenance Drawer for Signal Evidence */}
      <ProvenanceDrawer
        isOpen={Boolean(provenanceSignal)}
        onClose={() => setProvenanceSignal(null)}
        title={provenanceSignal ? `Signal Evidence: ${provenanceSignal.title}` : undefined}
        targetId={provenanceSignal?.signalId}
        provenance={provenanceData}
      />
    </section>
  );
};
