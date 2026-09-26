import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  Shield,
  Radio,
  RefreshCw,
  ExternalLink,
  Layers,
  ChevronRight,
  ClipboardList,
  CheckSquare,
  XCircle,
  Filter,
  BarChart3,
  Calendar,
  Sparkles,
  Server,
  ArrowRight,
  UserCheck,
  PlayCircle,
} from 'lucide-react';
import {
  operationalService,
  OperationalCommandCenterDTO,
  AttentionQueueItemDTO,
  SignalSeverity,
  OperationalCommandCenterParams,
} from '../../services/operationalService';
import { useRealtimeStore } from '../../stores/useRealtimeStore';
import { OperationalSignalCenter } from './OperationalSignalCenter';
import { InspectionActionWorkspace } from './InspectionActionWorkspace';
import { DecisionSupportWorkspace } from './DecisionSupportWorkspace';
import { cn } from '../../utils/cn';

export interface OperationalCommandCenterProps {
  initialBlockId?: string;
  persona?: 'FARMER' | 'OFFICER' | 'GOVERNMENT' | 'CLIMATE_ANALYST' | 'ADMIN';
  className?: string;
}

export type CommandCenterTab = 'queue' | 'signals' | 'actions' | 'resolution';

const PRIORITY_BADGES: Record<string, { label: string; badge: string }> = {
  P1: {
    label: 'P1 - Immediate',
    badge: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-200 dark:border-red-800',
  },
  P2: {
    label: 'P2 - High',
    badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800',
  },
  P3: {
    label: 'P3 - Medium',
    badge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800',
  },
  P4: {
    label: 'P4 - Informational',
    badge: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
};

const SEVERITY_BADGES: Record<SignalSeverity, { badge: string; text: string }> = {
  CRITICAL: {
    badge: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-400',
  },
  WARNING: {
    badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400',
  },
  WATCH: {
    badge: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-800',
    text: 'text-sky-700 dark:text-sky-400',
  },
  INFO: {
    badge: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    text: 'text-slate-600 dark:text-slate-400',
  },
};

const REASON_LABELS: Record<string, string> = {
  UNACTIONED_CRITICAL_SIGNAL: 'Unactioned Critical Signal',
  OVERDUE_P1_ACTION: 'Overdue P1 Action (>24h)',
  STALLED_IN_PROGRESS: 'Stalled In-Progress (>48h)',
  UNASSIGNED_HIGH_PRIORITY: 'Unassigned High Priority',
  ROUTINE_MONITORING: 'Routine Monitoring',
};

export const OperationalCommandCenter: React.FC<OperationalCommandCenterProps> = ({
  initialBlockId = 'UP_LKO_BKT',
  persona = 'CLIMATE_ANALYST',
  className,
}) => {
  const [blockId, setBlockId] = useState<string>(initialBlockId);
  const [timeHorizon, setTimeHorizon] = useState<'24h' | '7d' | '30d'>('24h');
  const [selectedTab, setSelectedTab] = useState<CommandCenterTab>('queue');
  const [data, setData] = useState<OperationalCommandCenterDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inspectingSignalId, setInspectingSignalId] = useState<string | null>(null);

  // Realtime store bindings
  const commandCenterStale = useRealtimeStore((state) => state.commandCenterStale);
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus);
  const markCommandCenterFresh = useRealtimeStore((state) => state.markCommandCenterFresh);

  // Authoritative API fetch
  const fetchCommandCenterData = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const params: OperationalCommandCenterParams = {
          blockId: blockId === 'ALL' ? undefined : blockId,
          timeHorizon,
        };

        const res = await operationalService.getCommandCenter(params);

        if (res.data) {
          setData(res.data);
          markCommandCenterFresh();
        } else {
          setError('Command center payload missing from server response.');
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.error?.message ||
            err?.message ||
            'Failed to load operational command center intelligence.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [blockId, timeHorizon, markCommandCenterFresh]
  );

  // Initial load and filter dependencies
  useEffect(() => {
    fetchCommandCenterData(false);
  }, [fetchCommandCenterData]);

  // Realtime reactivity: auto-refresh with debounce when commandCenterStale triggers
  useEffect(() => {
    if (commandCenterStale) {
      const timer = setTimeout(() => {
        fetchCommandCenterData(true);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [commandCenterStale, fetchCommandCenterData]);

  // Handle signal inspection from Attention Queue
  const handleInspectSignal = (signalId: string) => {
    setInspectingSignalId(signalId);
  };

  // Handle switching to Actions workspace
  const handleOpenActionWorkspace = () => {
    setSelectedTab('actions');
  };

  // Format reason code
  const formatReason = (reason: string): string => {
    return REASON_LABELS[reason] || reason.replace(/_/g, ' ');
  };

  return (
    <div
      data-testid="operational-command-center"
      className={cn('w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6', className)}
    >
      {/* 1. Executive Operational Posture Bar */}
      <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-1.5 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 rounded-lg border border-teal-200 dark:border-teal-800">
                <Shield className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Operational Command Center
              </h1>
              <span
                data-testid="posture-diagnostic-badge"
                className="px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800"
              >
                DIAGNOSTIC ONLY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Deterministic operational intelligence, triage attention queue, and inspection resolution pipeline.
            </p>
          </div>

          {/* Operational Controls & Telemetry */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Connection Status Pill */}
            <div
              data-testid="connection-status-pill"
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
                connectionStatus === 'CONNECTED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  connectionStatus === 'CONNECTED'
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-500'
                )}
              />
              <span className="uppercase tracking-wider">{connectionStatus}</span>
            </div>

            {/* Time Horizon Selector */}
            <div
              className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800"
              role="group"
              aria-label="Time Horizon Selector"
            >
              {(['24h', '7d', '30d'] as const).map((horizon) => (
                <button
                  key={horizon}
                  type="button"
                  data-testid={`time-horizon-${horizon}`}
                  onClick={() => setTimeHorizon(horizon)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                    timeHorizon === horizon
                      ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  )}
                >
                  {horizon}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              data-testid="refresh-command-center-button"
              onClick={() => fetchCommandCenterData(true)}
              disabled={refreshing || loading}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                'hover:bg-slate-50 dark:hover:bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-teal-500',
                'disabled:opacity-50 cursor-pointer'
              )}
              aria-label="Refresh operational command center data"
            >
              <RefreshCw
                className={cn('w-3.5 h-3.5', (refreshing || loading) && 'animate-spin text-teal-600')}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Realtime Invalidation Banner */}
        {commandCenterStale && (
          <div
            data-testid="command-center-stale-banner"
            className="flex items-center justify-between gap-3 p-3 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 rounded-lg text-xs sm:text-sm text-teal-900 dark:text-teal-200"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>Operational updates detected from live stream. Refreshing command intelligence...</span>
            </div>
            <button
              type="button"
              onClick={() => fetchCommandCenterData(true)}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer shrink-0"
            >
              Refresh Now
            </button>
          </div>
        )}

        {/* Sub-header Scope & Location Indicators */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              <strong className="text-slate-700 dark:text-slate-300">Monitored Scope:</strong>{' '}
              {data?.scope?.blockId === 'ALL'
                ? 'All Monitored Blocks'
                : data?.scope?.blockId || blockId}
            </span>
            <span>
              <strong className="text-slate-700 dark:text-slate-300">Dataset:</strong>{' '}
              {data?.systemStatus?.activeDataset || 'Kharif 2024'}
            </span>
            <span>
              <strong className="text-slate-700 dark:text-slate-300">Persona Role:</strong>{' '}
              {data?.scope?.userRole || persona}
            </span>
          </div>
          {data?.timestamp && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Synced at: {new Date(data.timestamp).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </header>

      {/* 2. Scientific Posture Strip */}
      {data?.systemStatus && (
        <section
          data-testid="scientific-posture-strip"
          aria-label="Scientific Operational Posture"
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
              Forecast Service
            </span>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate block mt-0.5">
              {data.systemStatus.forecastServiceStatus}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
              Model Registry
            </span>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate block mt-0.5">
              {data.systemStatus.modelRegistryStatus}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
              Data Freshness
            </span>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate block mt-0.5">
              {data.systemStatus.dataFreshnessStatus}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
              Validation
            </span>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate block mt-0.5">
              {data.systemStatus.validationStatus}
            </span>
          </div>
        </section>
      )}

      {/* Error Boundary / Display */}
      {error && (
        <div
          data-testid="command-center-error-alert"
          className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">
              Operational Intelligence Error
            </h4>
            <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchCommandCenterData(false)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. Four Core Executive KPI Cards */}
      <section
        data-testid="executive-kpi-grid"
        aria-label="Operational Key Metrics"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* KPI 1: Active Signals */}
        <div
          data-testid="kpi-active-signals"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Signals
            </span>
            <Radio className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
              {loading && !data ? '—' : data?.signalSummary?.total ?? 0}
            </span>
            <span className="text-xs text-slate-500">total active</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-red-600 dark:text-red-400 font-semibold">
              {data?.signalSummary?.bySeverity?.CRITICAL ?? 0} Critical
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {data?.signalSummary?.bySeverity?.WARNING ?? 0} Warning
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {(data?.signalSummary?.bySeverity?.WATCH ?? 0) +
                (data?.signalSummary?.bySeverity?.INFO ?? 0)}{' '}
              Watch/Info
            </span>
          </div>
        </div>

        {/* KPI 2: Action Resolution Pipeline */}
        <div
          data-testid="kpi-resolution-pipeline"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Action Pipeline
            </span>
            <ClipboardList className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
              {loading && !data ? '—' : data?.actionSummary?.totalActions ?? 0}
            </span>
            <span className="text-xs text-slate-500">total actions</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {data?.actionSummary?.openCount ?? 0} Open
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
              {data?.actionSummary?.assignedCount ?? 0} Assigned
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {data?.actionSummary?.inProgressCount ?? 0} In Prog
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {data?.actionSummary?.completedCount ?? 0} Done
            </span>
          </div>
        </div>

        {/* KPI 3: Attention Queue */}
        <div
          data-testid="kpi-attention-queue"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Attention Queue
            </span>
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
              {loading && !data ? '—' : data?.attentionQueue?.length ?? 0}
            </span>
            <span className="text-xs text-slate-500">items prioritized</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-red-600 dark:text-red-400 font-semibold">
              {data?.coverage?.criticalSignalsUnactioned ?? 0} Critical Unactioned
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Triage order
            </span>
          </div>
        </div>

        {/* KPI 4: Signal -> Action Coverage */}
        <div
          data-testid="kpi-action-coverage"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Human Review Coverage
            </span>
            <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
              {loading && !data ? '—' : `${data?.coverage?.coveragePercentage ?? 0}%`}
            </span>
            <span className="text-xs text-slate-500">of active signals</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {data?.coverage?.actionedSignalsCount ?? 0} Actioned
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {data?.coverage?.unactionedSignalsCount ?? 0} Pending Review
            </span>
          </div>
        </div>
      </section>

      {/* 4. Tab Navigation Bar */}
      <nav
        role="tablist"
        aria-label="Operational Command Center Sections"
        className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto"
      >
        <button
          type="button"
          role="tab"
          id="tab-queue"
          aria-selected={selectedTab === 'queue'}
          aria-controls="panel-queue"
          data-testid="tab-attention-queue"
          onClick={() => setSelectedTab('queue')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
            selectedTab === 'queue'
              ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          )}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Attention Queue</span>
          {data?.attentionQueue && data.attentionQueue.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
              {data.attentionQueue.length}
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          id="tab-signals"
          aria-selected={selectedTab === 'signals'}
          aria-controls="panel-signals"
          data-testid="tab-operational-signals"
          onClick={() => setSelectedTab('signals')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
            selectedTab === 'signals'
              ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          )}
        >
          <Radio className="w-4 h-4" />
          <span>Operational Signals</span>
          {data?.signalSummary?.total !== undefined && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              {data.signalSummary.total}
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          id="tab-actions"
          aria-selected={selectedTab === 'actions'}
          aria-controls="panel-actions"
          data-testid="tab-inspection-actions"
          onClick={() => setSelectedTab('actions')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
            selectedTab === 'actions'
              ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          )}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Inspection Actions</span>
          {data?.actionSummary?.totalActions !== undefined && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              {data.actionSummary.totalActions}
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          id="tab-resolution"
          aria-selected={selectedTab === 'resolution'}
          aria-controls="panel-resolution"
          data-testid="tab-resolution-intelligence"
          onClick={() => setSelectedTab('resolution')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
            selectedTab === 'resolution'
              ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          )}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Resolution & Audit</span>
        </button>
      </nav>

      {/* 5. Main Workspace Content Area */}
      <main className="space-y-6">
        {/* Loading Skeleton */}
        {loading && !data && (
          <div data-testid="command-center-loading-skeleton" className="space-y-4 animate-pulse">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
            <div className="h-48 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
            <div className="h-48 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
          </div>
        )}

        {/* Tab 1: Attention Queue Panel (Default) */}
        {selectedTab === 'queue' && (
          <section
            id="panel-queue"
            role="tabpanel"
            aria-labelledby="tab-queue"
            data-testid="panel-attention-queue"
            className="space-y-4"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Authoritative Operational Attention Queue
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Deterministically ranked triage stream. Highest urgency items require immediate human operational inspection.
                </p>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Authoritative backend prioritization
              </span>
            </div>

            {data?.attentionQueue && data.attentionQueue.length === 0 ? (
              <div
                data-testid="attention-queue-empty"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3 shadow-sm"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  No immediate operational attention required.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  All active signals have assigned review actions and no actions are stalled or overdue.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.attentionQueue.map((item, index) => {
                  const priorityStyle =
                    PRIORITY_BADGES[item.priority] || PRIORITY_BADGES.P4;
                  const severityStyle =
                    SEVERITY_BADGES[item.severity] || SEVERITY_BADGES.INFO;

                  return (
                    <article
                      key={item.id || `${item.sourceType}-${item.sourceId}-${index}`}
                      data-testid={`attention-queue-item-${item.id}`}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Priority Badge */}
                            <span
                              className={cn(
                                'px-2 py-0.5 text-xs font-bold rounded-md border uppercase tracking-wider',
                                priorityStyle.badge
                              )}
                            >
                              {priorityStyle.label}
                            </span>

                            {/* Source Type Badge */}
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-md border bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                              {item.sourceType === 'SIGNAL' ? 'SIGNAL' : 'ACTION'}
                            </span>

                            {/* Severity Badge */}
                            <span
                              className={cn(
                                'px-2 py-0.5 text-xs font-semibold rounded-md border',
                                severityStyle.badge
                              )}
                            >
                              {item.severity}
                            </span>

                            {/* Reason Code Badge */}
                            <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800">
                              {formatReason(item.reason)}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                            {item.title}
                          </h3>

                          {/* Metadata row */}
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                            <span>
                              <strong className="text-slate-700 dark:text-slate-300">Block:</strong>{' '}
                              {item.blockId}
                            </span>
                            <span>
                              <strong className="text-slate-700 dark:text-slate-300">Status:</strong>{' '}
                              {item.status}
                            </span>
                            <span>
                              <strong className="text-slate-700 dark:text-slate-300">Age:</strong>{' '}
                              {typeof item.ageHours === 'number' ? `${item.ageHours.toFixed(1)}h` : 'N/A'}
                            </span>
                            {item.assignedTo && (
                              <span>
                                <strong className="text-slate-700 dark:text-slate-300">Assigned:</strong>{' '}
                                {item.assignedTo}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 sm:self-center shrink-0">
                          {item.sourceType === 'SIGNAL' ? (
                            <>
                              <button
                                type="button"
                                data-testid={`inspect-signal-${item.sourceId}`}
                                onClick={() => handleInspectSignal(item.sourceId)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer"
                              >
                                <span>Inspect Evidence</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedTab('signals')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                title="Open Signals Workspace"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              data-testid={`open-action-${item.sourceId}`}
                              onClick={handleOpenActionWorkspace}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                            >
                              <span>Open Action</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Operational Signals Panel */}
        {selectedTab === 'signals' && (
          <section
            id="panel-signals"
            role="tabpanel"
            aria-labelledby="tab-signals"
            data-testid="panel-operational-signals"
            className="space-y-4"
          >
            <OperationalSignalCenter
              blockId={blockId === 'ALL' ? undefined : blockId}
              persona={persona}
              title="Operational Intelligence Signals"
              description="Authoritative operational signals derived from scientific telemetry, calibrated forecasts, and validation gates."
            />
          </section>
        )}

        {/* Tab 3: Inspection Actions Panel */}
        {selectedTab === 'actions' && (
          <section
            id="panel-actions"
            role="tabpanel"
            aria-labelledby="tab-actions"
            data-testid="panel-inspection-actions"
            className="space-y-4"
          >
            <InspectionActionWorkspace
              blockId={blockId === 'ALL' ? undefined : blockId}
              persona={persona}
              title="Operational Inspection & Action Tracking"
              description="Human-in-the-loop operational review workflows. Field actions do not alter ML models or trigger automated farm actuators."
              onNavigateSignal={(sigId) => {
                setInspectingSignalId(sigId);
              }}
            />
          </section>
        )}

        {/* Tab 4: Resolution & Audit Intelligence Panel */}
        {selectedTab === 'resolution' && (
          <section
            id="panel-resolution"
            role="tabpanel"
            aria-labelledby="tab-resolution"
            data-testid="panel-resolution-intelligence"
            className="space-y-6"
          >
            {/* 1. Aging Distribution & Coverage Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Aging Distribution */}
              <div
                data-testid="aging-distribution-card"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      Operational Aging Distribution
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Active signal and action age across time horizons.
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="font-medium text-slate-700 dark:text-slate-300">&lt; 1 hour</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {data?.aging?.lessThan1h ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="font-medium text-slate-700 dark:text-slate-300">1 – 6 hours</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {data?.aging?.between1hAnd6h ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="font-medium text-slate-700 dark:text-slate-300">6 – 24 hours</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {data?.aging?.between6hAnd24h ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="font-medium text-slate-700 dark:text-slate-300">24 – 72 hours</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {data?.aging?.between24hAnd72h ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="font-medium text-slate-700 dark:text-slate-300">&gt; 72 hours (Critical Staleness)</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {data?.aging?.greaterThan72h ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coverage & Turnaround Performance */}
              <div
                data-testid="turnaround-metrics-card"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      Action Turnaround & Coverage
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Authoritative human review turnaround metrics.
                    </p>
                  </div>
                  <Shield className="w-4 h-4 text-slate-400" />
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                    Average Time to Resolution
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {data?.actionSummary?.averageTimeToResolutionHours !== null &&
                    data?.actionSummary?.averageTimeToResolutionHours !== undefined
                      ? `${data.actionSummary.averageTimeToResolutionHours.toFixed(1)} hours`
                      : 'NOT AVAILABLE'}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Calculated strictly on completed actions within the active horizon.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-500 dark:text-slate-400 block font-medium">Coverage Rate</span>
                    <span className="text-base font-bold text-teal-700 dark:text-teal-300">
                      {data?.coverage?.coveragePercentage ?? 0}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-500 dark:text-slate-400 block font-medium">Critical Unactioned</span>
                    <span className="text-base font-bold text-red-600 dark:text-red-400">
                      {data?.coverage?.criticalSignalsUnactioned ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Immutable Operational Audit Timeline */}
            <div
              data-testid="operational-audit-timeline-card"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    Immutable Operational Audit Timeline
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tamper-evident log of operational inspection transitions recorded by authoritative gateway.
                  </p>
                </div>
                <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>

              {data?.recentActivity && data.recentActivity.length === 0 ? (
                <div
                  data-testid="audit-timeline-empty"
                  className="p-6 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  No operational inspection activity recorded in the selected time horizon.
                </div>
              ) : (
                <div className="space-y-3">
                  {data?.recentActivity.map((actItem) => (
                    <div
                      key={actItem.id}
                      data-testid={`audit-activity-item-${actItem.id}`}
                      className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            {actItem.transition}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            Action ID: {actItem.actionId}
                          </span>
                        </div>
                        {actItem.notes && (
                          <p className="text-slate-600 dark:text-slate-400 text-xs italic">
                            &ldquo;{actItem.notes}&rdquo;
                          </p>
                        )}
                        <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Performed by <strong className="text-slate-700 dark:text-slate-300">{actItem.performedBy}</strong> ({actItem.role})
                        </div>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] shrink-0 sm:text-right">
                        {new Date(actItem.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* 6. Scientific Disclosure Footer */}
      <footer
        data-testid="scientific-disclosures-footer"
        className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-xs text-slate-600 dark:text-slate-400"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <h4 className="font-bold text-slate-900 dark:text-slate-200 text-xs sm:text-sm">
            Operational Disclosures & Diagnostic Invariants
          </h4>
        </div>
        <ul className="list-disc pl-5 space-y-1 leading-relaxed">
          {data?.systemStatus?.scientificDisclosures &&
          data.systemStatus.scientificDisclosures.length > 0 ? (
            data.systemStatus.scientificDisclosures.map((disc, idx) => (
              <li key={idx}>{disc}</li>
            ))
          ) : (
            <>
              <li>
                <strong>Probability ≠ Confidence ≠ Operational Availability:</strong> Probability
                denotes meteorological likelihood; confidence reflects ensemble agreement and
                calibration reliability; operational availability signifies data pipeline readiness.
              </li>
              <li>
                <strong>Diagnostic-Only Operational Boundary:</strong> All operational intelligence
                signals and inspection actions support human decision-making only. The platform
                performs no automated farm actuation or physical equipment control.
              </li>
              <li>
                <strong>Kharif 2024 Baseline:</strong> Operational calibrations and verification
                gates are benchmarked against historical agro-meteorological records for Uttar
                Pradesh.
              </li>
            </>
          )}
        </ul>
      </footer>

      {/* 7. Decision Support Workspace Modal */}
      {inspectingSignalId && (
        <DecisionSupportWorkspace
          signalId={inspectingSignalId}
          isOpen={Boolean(inspectingSignalId)}
          onClose={() => setInspectingSignalId(null)}
          persona={persona}
          onNavigateAction={(target) => {
            setInspectingSignalId(null);
            setSelectedTab('actions');
          }}
          onActionCreated={() => {
            fetchCommandCenterData(true);
          }}
        />
      )}
    </div>
  );
};
