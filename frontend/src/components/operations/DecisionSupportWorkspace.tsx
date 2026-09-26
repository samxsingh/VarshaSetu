import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  MapPin,
  Layers,
  FileCheck,
  RefreshCw,
  Database,
  ExternalLink,
  ChevronRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  Server,
  Lock,
} from 'lucide-react';
import {
  operationalService,
  DecisionSupportContext,
  SignalSeverity,
  OperationalSignalType,
} from '../../services/operationalService';
import { useRealtimeStore } from '../../stores/useRealtimeStore';
import { ProvenanceDrawer, ProvenanceDetails } from '../visualization/ProvenanceDrawer';
import { cn } from '../../utils/cn';

interface DecisionSupportWorkspaceProps {
  signalId: string;
  isOpen: boolean;
  onClose: () => void;
  persona?: 'FARMER' | 'OFFICER' | 'GOVERNMENT' | 'CLIMATE_ANALYST' | 'ADMIN';
  onNavigateAction?: (target: string) => void;
}

const SEVERITY_COLORS: Record<SignalSeverity, { bg: string; border: string; text: string; badge: string; icon: React.ComponentType<{ className?: string }> }> = {
  CRITICAL: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-900',
    text: 'text-red-900 dark:text-red-200',
    badge: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/60 dark:text-red-200',
    icon: AlertTriangle,
  },
  WARNING: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-900',
    text: 'text-amber-900 dark:text-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200',
    icon: AlertCircle,
  },
  WATCH: {
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    border: 'border-sky-200 dark:border-sky-900',
    text: 'text-sky-900 dark:text-sky-200',
    badge: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/60 dark:text-sky-200',
    icon: Info,
  },
  INFO: {
    bg: 'bg-slate-50 dark:bg-slate-900/40',
    border: 'border-slate-200 dark:border-slate-800',
    text: 'text-slate-900 dark:text-slate-200',
    badge: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
    icon: Activity,
  },
};

export const DecisionSupportWorkspace: React.FC<DecisionSupportWorkspaceProps> = ({
  signalId,
  isOpen,
  onClose,
  persona = 'CLIMATE_ANALYST',
  onNavigateAction,
}) => {
  const [context, setContext] = useState<DecisionSupportContext | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isProvenanceOpen, setIsProvenanceOpen] = useState<boolean>(false);
  const [showAdvancedScience, setShowAdvancedScience] = useState<boolean>(persona !== 'FARMER');
  const [realtimeUpdateAvailable, setRealtimeUpdateAvailable] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Realtime subscription: monitor if this signal is updated in the background
  const realtimeSignals = useRealtimeStore((state) => state.operationalSignals);

  useEffect(() => {
    if (!isOpen || !signalId) return;
    const match = realtimeSignals.find((s) => s.signalId === signalId);
    if (match && context && match.updatedAt > context.timing.detectedAt) {
      setRealtimeUpdateAvailable(true);
    }
  }, [realtimeSignals, signalId, isOpen, context]);

  // Fetch full DecisionSupportContext
  const fetchContext = useCallback(async () => {
    if (!signalId) return;
    try {
      setLoading(true);
      setError(null);
      setRealtimeUpdateAvailable(false);
      const res = await operationalService.getSignalContext(signalId);
      if (res.success && res.data) {
        setContext(res.data);
      } else {
        setError('Evidence is not available in the current pipeline.');
      }
    } catch (err: any) {
      const status = err?.statusCode || err?.response?.status;
      if (status === 403) {
        setError('Access forbidden: You are not authorized to inspect this operational signal.');
      } else if (status === 404) {
        setError('Signal no longer exists.');
      } else {
        setError(err?.message || 'Evidence is not available in the current pipeline.');
      }
    } finally {
      setLoading(false);
    }
  }, [signalId]);

  useEffect(() => {
    if (isOpen && signalId) {
      fetchContext();
    }
  }, [isOpen, signalId, fetchContext]);

  // Keyboard accessibility: Escape closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const severityStyle = context ? SEVERITY_COLORS[context.severity] || SEVERITY_COLORS.INFO : SEVERITY_COLORS.INFO;
  const IconComponent = severityStyle.icon;

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'NOT SPECIFIED';
    try {
      return new Date(isoString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const provenanceData: ProvenanceDetails | undefined = context?.evidence.provenanceDetails
    ? {
        dataSource: String(context.evidence.provenanceDetails.dataSource || 'IMD Gridded + ECMWF SEAS5 Archive'),
        stationsCovered: String(context.evidence.provenanceDetails.stationsCovered || '1 AWS Station (UP_LKO_BKT)'),
        spatialResolution: String(context.evidence.provenanceDetails.spatialResolution || '0.25° (~25 km downscaled to ~9 km)'),
        temporalCoverage: String(context.evidence.provenanceDetails.temporalCoverage || 'Kharif 2024'),
        observationTimestamp: context.timing.detectedAt,
        validationStatus: context.scientific.validationStatus,
        fingerprintHash: String(context.evidence.provenanceDetails.verificationHash || ''),
        pipelineNotes: `Operational Mode: ${context.scientific.operationalStatus}. Single-season baseline governance active.`,
      }
    : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="decision-workspace-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <header className="px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
              <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Decision Support Workspace
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {persona}
                </span>
              </div>
              <h2
                id="decision-workspace-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight"
              >
                {context ? context.title : 'Loading operational evidence...'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchContext}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Refresh decision context"
            >
              <RefreshCw className={cn('w-4 h-4', loading ? 'animate-spin' : '')} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close decision support workspace"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Realtime Alert Banner */}
        {realtimeUpdateAvailable && (
          <div
            role="status"
            aria-live="polite"
            className="px-5 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
              <span>Signal updated just now via Socket.IO. Review latest evidence.</span>
            </div>
            <button
              type="button"
              onClick={fetchContext}
              className="px-2.5 py-1 rounded bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors text-[11px]"
            >
              Refresh Evidence
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {loading && !context ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium">Loading operational evidence…</p>
            </div>
          ) : error ? (
            <div className="py-12 px-6 text-center rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-red-900 dark:text-red-200">{error}</h3>
              <p className="mt-1 text-xs text-red-700 dark:text-red-300 max-w-md mx-auto">
                Authoritative persistence verification failed or access permissions are insufficient.
              </p>
              <button
                type="button"
                onClick={fetchContext}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : context ? (
            <>
              {/* Section 1: Signal Header & Status Grid */}
              <section aria-labelledby="signal-overview-heading" className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border tracking-wide',
                        severityStyle.badge
                      )}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                      {context.severity}
                    </span>
                    <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                      {context.signalType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {context.location.blockName} ({context.location.blockId})
                    </span>
                    <span>• {context.location.districtName}, {context.location.stateName}</span>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  {context.summary}
                </p>

                {/* SCIENTIFIC STATUS TRIO: Probability vs Confidence vs Operational Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                      1. Event Likelihood (Probability)
                    </span>
                    <strong className="text-lg font-heading font-black text-slate-900 dark:text-slate-100 block mt-0.5">
                      {typeof context.scientific.probability === 'number'
                        ? `${Math.round(context.scientific.probability * 100)}%`
                        : 'NOT AVAILABLE'}
                    </strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Calibrated forecast likelihood
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                      2. Statistical Reliability (Confidence)
                    </span>
                    <strong
                      className={cn(
                        'text-lg font-heading font-black block mt-0.5',
                        context.scientific.confidenceStatus === 'PASS' || context.scientific.confidenceStatus === 'CALIBRATED'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      )}
                    >
                      {persona === 'FARMER'
                        ? context.scientific.modelReliabilityLabel || context.scientific.confidenceStatus
                        : context.scientific.confidenceStatus}
                    </strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Platt scaling & reliability curve
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                      3. Operational Mode (Availability)
                    </span>
                    <strong className="text-lg font-heading font-black text-amber-700 dark:text-amber-400 block mt-0.5 font-mono">
                      {context.scientific.operationalStatus}
                    </strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Gated under single-season pilot
                    </span>
                  </div>
                </div>

                {/* Timing Bar */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Detected: <strong className="text-slate-700 dark:text-slate-300">{formatDate(context.timing.detectedAt)}</strong></span>
                  </div>
                  <div>
                    <span>Valid: <strong className="text-slate-700 dark:text-slate-300">{formatDate(context.timing.validFrom)}</strong> → <strong className="text-slate-700 dark:text-slate-300">{formatDate(context.timing.validUntil)}</strong></span>
                  </div>
                  <div>
                    <span>Freshness: <strong className="text-slate-700 dark:text-slate-300 font-mono">{context.scientific.dataFreshness}</strong></span>
                  </div>
                </div>
              </section>

              {/* Section 2: Evidence Chain (Traceability) */}
              <section aria-labelledby="evidence-chain-heading" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3
                    id="evidence-chain-heading"
                    className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-1.5"
                  >
                    <Layers className="w-4 h-4 text-emerald-600" />
                    Evidence Traceability Chain
                  </h3>
                  {context.evidence.provenanceAvailable && (
                    <button
                      type="button"
                      onClick={() => setIsProvenanceOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition-colors"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      View Full Provenance Ledger →
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Step 1: Underlying Entity */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">1. Backing Entity</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-mono block mt-1">
                      {context.underlyingEntity.entityType}
                    </strong>
                    <span className="text-slate-500 dark:text-slate-400 block truncate mt-0.5 font-mono text-[11px]">
                      {context.underlyingEntity.entityId}
                    </span>
                  </div>

                  {/* Step 2: Model Architecture */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">2. Model Pipeline</span>
                    <strong className="text-slate-900 dark:text-slate-100 block mt-1 truncate">
                      {context.evidence.modelReference?.modelFamily || 'Empirical Rule Gate'}
                    </strong>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{context.evidence.modelReference?.calibrationMethod || 'Pre-calibrated'}</span>
                      {context.evidence.modelReference?.modelVersion && (
                        <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700">
                          {context.evidence.modelReference.modelVersion}
                        </span>
                      )}
                    </div>
                    {persona !== 'FARMER' && typeof context.evidence.modelReference?.ece === 'number' && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block mt-1">
                        ECE: {context.evidence.modelReference.ece} | Brier: {context.evidence.modelReference.brierScore ?? 'N/A'}
                      </span>
                    )}
                  </div>

                  {/* Step 3: Observational Ground Truth */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">3. Ingestion Ground</span>
                    <strong className="text-slate-900 dark:text-slate-100 block mt-1 truncate">
                      {context.evidence.observationReference?.stationName || 'AWS Rain Gauge'}
                    </strong>
                    <span className="text-slate-500 dark:text-slate-400 block mt-0.5 text-[11px] truncate">
                      {context.evidence.observationReference?.variable || context.evidence.observationReference?.resolution || 'Station ~9 km'}
                    </span>
                    {context.evidence.observationReference?.stationId && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block mt-0.5">
                        {context.evidence.observationReference.stationId} • {context.evidence.observationReference.resolution}
                      </span>
                    )}
                  </div>

                  {/* Step 4: Verification Hash */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">4. Provenance Ledger</span>
                    {context.evidence.provenanceAvailable ? (
                      <>
                        <strong className="text-emerald-700 dark:text-emerald-400 block mt-1 flex items-center gap-1">
                          <FileCheck className="w-3.5 h-3.5" />
                          VERIFIED
                        </strong>
                        <span className="text-slate-500 dark:text-slate-400 block mt-0.5 text-[10px] font-mono truncate">
                          Kharif 2024 Archive
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 block mt-1 italic">
                        PROVENANCE NOT AVAILABLE
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Section 3: Scientific Interpretation & Feature Contributions (SHAP) */}
              {persona !== 'FARMER' && (
                <section aria-labelledby="interpretation-heading" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3
                      id="interpretation-heading"
                      className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Scientific Interpretation & Attributions
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Base Value: <strong className="text-slate-700 dark:text-slate-300 font-mono">{context.evidence.explanation?.baseValue ?? 'N/A'}</strong>
                    </span>
                  </div>

                  {context.evidence.explanation?.available && context.evidence.explanation.contributions.length > 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="space-y-2">
                        {context.evidence.explanation.contributions.map((feat) => {
                          const isPositive = feat.contribution > 0;
                          return (
                            <div key={feat.featureName} className="text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-slate-700 dark:text-slate-300">
                                  {feat.featureName}
                                </span>
                                <span
                                  className={cn(
                                    'font-mono font-bold inline-flex items-center gap-1',
                                    isPositive ? 'text-amber-700 dark:text-amber-400' : 'text-blue-700 dark:text-blue-400'
                                  )}
                                >
                                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  {isPositive ? `+${feat.contribution.toFixed(2)}` : feat.contribution.toFixed(2)}
                                </span>
                              </div>
                              {feat.description && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {feat.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-200">
                        <strong className="font-semibold">Non-Causal Disclaimer: </strong>
                        {context.evidence.explanation.nonCausalDisclaimer}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                      MODEL EXPLANATION NOT AVAILABLE
                    </div>
                  )}
                </section>
              )}

              {/* Section 4: Operational Gate Status */}
              <section aria-labelledby="operational-gate-heading" className="space-y-2.5">
                <h3
                  id="operational-gate-heading"
                  className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <Lock className="w-4 h-4 text-amber-600" />
                  Operational Gate & Validation Boundary
                </h3>

                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                      STATUS: {context.scientific.operationalStatus}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-amber-300 dark:border-amber-800">
                      GATE: {context.scientific.validationStatus}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                    Diagnostic evidence only — not approved for operational forecasting. Agronomic crop decision commands are strictly disabled under single-season governance.
                  </p>
                </div>
              </section>

              {/* Section 5: Deterministic Next Inspection Actions */}
              <section aria-labelledby="next-inspections-heading" className="space-y-3">
                <h3
                  id="next-inspections-heading"
                  className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Recommended Operational Inspections
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {context.nextInspections.map((action, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (onNavigateAction) {
                          onNavigateAction(action.target);
                        }
                      }}
                      className="p-3 text-left rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-500 transition-all shadow-xs group cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        <span>{action.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {action.description}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Section 6: Limitations & Boundaries */}
              <section aria-labelledby="limitations-heading" className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h4
                  id="limitations-heading"
                  className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400"
                >
                  Scientific Limitations & Disclosures
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {context.limitations.map((lim, i) => (
                    <li key={i}>{lim}</li>
                  ))}
                </ul>
              </section>
            </>
          ) : null}
        </div>

        {/* Provenance Drawer for Deep Traceability */}
        <ProvenanceDrawer
          isOpen={isProvenanceOpen}
          onClose={() => setIsProvenanceOpen(false)}
          title={context ? `Provenance: ${context.title}` : undefined}
          targetId={context?.underlyingEntity.entityId}
          provenance={provenanceData}
        />
      </div>
    </div>
  );
};
