import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  PlayCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Activity,
  Filter,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronUp,
  MapPin,
  Shield,
  Send,
  X,
} from 'lucide-react';
import {
  operationalService,
  InspectionActionDTO,
  InspectionActionStatus,
  InspectionActionType,
  SignalSeverity,
} from '../../services/operationalService';
import { useRealtimeStore } from '../../stores/useRealtimeStore';
import { cn } from '../../utils/cn';

interface InspectionActionWorkspaceProps {
  blockId?: string;
  persona?: 'FARMER' | 'OFFICER' | 'GOVERNMENT' | 'CLIMATE_ANALYST' | 'ADMIN';
  initialStatusFilter?: 'ALL' | InspectionActionStatus;
  title?: string;
  description?: string;
  className?: string;
  onNavigateSignal?: (signalId: string) => void;
}

const STATUS_TABS: { label: string; value: 'ALL' | InspectionActionStatus }[] = [
  { label: 'All Actions', value: 'ALL' },
  { label: 'Open', value: 'OPEN' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const SEVERITY_COLORS: Record<SignalSeverity, { badge: string; text: string }> = {
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

const STATUS_BADGES: Record<InspectionActionStatus, { bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  OPEN: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-900',
    icon: Clock,
  },
  ASSIGNED: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-900',
    icon: UserCheck,
  },
  IN_PROGRESS: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-900',
    icon: PlayCircle,
  },
  COMPLETED: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-900',
    icon: CheckCircle2,
  },
  CANCELLED: {
    bg: 'bg-slate-100 dark:bg-slate-800/60',
    text: 'text-slate-500 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    icon: XCircle,
  },
};

export const InspectionActionWorkspace: React.FC<InspectionActionWorkspaceProps> = ({
  blockId,
  persona = 'CLIMATE_ANALYST',
  initialStatusFilter = 'ALL',
  title = 'Operational Inspection & Action Tracking',
  description = 'Deterministic operational review workflows tracked from originating intelligence signals. Actions do not alter ML forecasts or trigger farm actuators.',
  className,
  onNavigateSignal,
}) => {
  const [apiActions, setApiActions] = useState<InspectionActionDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | InspectionActionStatus>(initialStatusFilter);
  const [expandedAuditTrail, setExpandedAuditTrail] = useState<Record<string, boolean>>({});

  // Active modal state
  const [activeModal, setActiveModal] = useState<{
    type: 'ASSIGN' | 'START' | 'COMPLETE' | 'CANCEL';
    action: InspectionActionDTO;
  } | null>(null);
  const [modalInput, setModalInput] = useState<string>('');
  const [modalNotes, setModalNotes] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Realtime actions from store
  const realtimeActions = useRealtimeStore((state) => state.inspectionActions);
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus);

  // Fetch actions from Express API
  const fetchActions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await operationalService.getInspectionActions({
        blockId,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });

      if (res.data && Array.isArray(res.data.items)) {
        setApiActions(res.data.items);
      } else {
        setApiActions([]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to load inspection actions');
    } finally {
      setLoading(false);
    }
  }, [blockId, statusFilter]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  // Merge API actions with Realtime actions (deduplicated by actionId)
  const mergedActions = useMemo(() => {
    const map = new Map<string, InspectionActionDTO>();

    // Seed with API actions
    apiActions.forEach((a) => map.set(a.actionId, a));

    // Overlay realtime actions
    realtimeActions.forEach((a) => {
      // Check block filter if applied
      if (blockId && a.blockId !== blockId) return;
      map.set(a.actionId, a);
    });

    let items = Array.from(map.values());

    // Filter by status if tab selected
    if (statusFilter !== 'ALL') {
      items = items.filter((a) => a.status === statusFilter);
    }

    // Sort newest first
    return items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [apiActions, realtimeActions, blockId, statusFilter]);

  const toggleAuditTrail = (actionId: string) => {
    setExpandedAuditTrail((prev) => ({
      ...prev,
      [actionId]: !prev[actionId],
    }));
  };

  // Open action modal
  const openModal = (type: 'ASSIGN' | 'START' | 'COMPLETE' | 'CANCEL', action: InspectionActionDTO) => {
    setActiveModal({ type, action });
    setModalInput('');
    setModalNotes('');
    setModalError(null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalInput('');
    setModalNotes('');
    setModalError(null);
    setSubmitting(false);
  };

  // Submit modal transition
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    const { type, action } = activeModal;
    setSubmitting(true);
    setModalError(null);

    try {
      if (type === 'ASSIGN') {
        if (!modalInput.trim()) {
          setModalError('Assignee name or ID is required.');
          setSubmitting(false);
          return;
        }
        await operationalService.assignInspectionAction(action.actionId, modalInput.trim(), modalNotes.trim() || undefined);
      } else if (type === 'START') {
        await operationalService.startInspectionAction(action.actionId, modalNotes.trim() || undefined);
      } else if (type === 'COMPLETE') {
        if (!modalInput.trim() || modalInput.trim().length < 5) {
          setModalError('Completion notes are required (minimum 5 characters).');
          setSubmitting(false);
          return;
        }
        await operationalService.completeInspectionAction(action.actionId, modalInput.trim());
      } else if (type === 'CANCEL') {
        if (!modalInput.trim() || modalInput.trim().length < 5) {
          setModalError('Cancellation reason is required (minimum 5 characters).');
          setSubmitting(false);
          return;
        }
        await operationalService.cancelInspectionAction(action.actionId, modalInput.trim());
      }

      closeModal();
      fetchActions();
    } catch (err: any) {
      setModalError(err?.response?.data?.error?.message || err?.message || 'Operation failed');
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="inspection-workspace-title"
      className={cn('space-y-5 font-sans', className)}
    >
      {/* Header with Title and Scientific Disclosures */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h2
              id="inspection-workspace-title"
              className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100 tracking-tight"
            >
              {title}
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {mergedActions.length} Actions
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection status indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            title={`Realtime socket status: ${connectionStatus}`}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                connectionStatus === 'CONNECTED'
                  ? 'bg-emerald-500 animate-pulse'
                  : connectionStatus === 'CONNECTING' || connectionStatus === 'RECONNECTING'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-slate-400'
              )}
            />
            <span className="capitalize">{connectionStatus.toLowerCase()}</span>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={fetchActions}
            disabled={loading}
            aria-label="Refresh inspection actions"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Scientific Triad of Truth Guardrail Banner */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
        <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            Authoritative Operational Review Protocol (Phase 7C)
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Inspection actions track investigation, physical station verification, and human expert sign-off.
            Transitioning or completing an action does <strong>not</strong> modify underlying ML predictions, probabilities, or trigger automated agricultural actuators.
            Triad of Truth: Probability ≠ Confidence ≠ Operational Availability.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer',
                isActive
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Actions List / Grid */}
      {loading && apiActions.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
          <p className="text-xs text-slate-500 font-mono">Loading inspection actions...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      ) : mergedActions.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No inspection actions found
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {statusFilter !== 'ALL'
              ? `There are no actions currently in '${statusFilter}' status for this scope.`
              : 'No operational inspection actions have been logged yet. Create an inspection action from any operational signal in the Decision Support Workspace.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mergedActions.map((action) => {
            const statusConfig = STATUS_BADGES[action.status] || STATUS_BADGES.OPEN;
            const StatusIcon = statusConfig.icon;
            const severityConfig = SEVERITY_COLORS[action.severity] || SEVERITY_COLORS.INFO;
            const isAuditExpanded = Boolean(expandedAuditTrail[action.actionId]);
            const isTerminal = action.status === 'COMPLETED' || action.status === 'CANCELLED';

            return (
              <div
                key={action.actionId}
                className={cn(
                  'rounded-xl border bg-white dark:bg-slate-900 p-4 shadow-xs transition-all space-y-3.5',
                  statusConfig.border
                )}
              >
                {/* Top header line: ActionType, Priority, Severity, Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {action.actionType.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {action.priority}
                    </span>
                    <span className={cn('px-2 py-0.5 rounded text-[11px] font-mono font-bold border', severityConfig.badge)}>
                      {action.severity}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      #{action.actionId}
                    </span>
                  </div>

                  <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border', statusConfig.bg, statusConfig.text, statusConfig.border)}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{action.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                {/* Title and Description */}
                <div>
                  <h3 className="text-base font-serif font-bold text-slate-900 dark:text-slate-100">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                {/* Metadata & Originating Signal */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Block: <strong className="text-slate-700 dark:text-slate-300">{action.blockId}</strong></span>
                  </div>

                  <div>
                    <span>Originating Signal: </span>
                    <button
                      type="button"
                      onClick={() => onNavigateSignal && onNavigateSignal(action.signalId)}
                      className={cn(
                        'font-mono font-semibold underline underline-offset-2',
                        onNavigateSignal ? 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 cursor-pointer' : 'text-slate-700 dark:text-slate-300'
                      )}
                    >
                      {action.signalId}
                    </button>
                  </div>

                  <div>
                    <span>Assigned: </span>
                    <strong className="text-slate-700 dark:text-slate-300">
                      {action.assignedTo || 'Unassigned'}
                    </strong>
                    {action.assignedRole && <span className="text-[11px] text-slate-400 ml-1">({action.assignedRole})</span>}
                  </div>

                  <div>
                    <span>Created by: </span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {action.createdBy} ({action.creatorRole})
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1">
                      {new Date(action.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Completion Notes or Cancellation Reason if present */}
                {action.status === 'COMPLETED' && action.completionNotes && (
                  <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                    <strong className="font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Completion Notes:
                    </strong>
                    <p className="leading-relaxed font-sans">{action.completionNotes}</p>
                  </div>
                )}

                {action.status === 'CANCELLED' && action.cancellationReason && (
                  <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <strong className="font-semibold flex items-center gap-1 text-slate-800 dark:text-slate-200">
                      <XCircle className="w-3.5 h-3.5 text-slate-500" />
                      Cancellation Reason:
                    </strong>
                    <p className="leading-relaxed font-sans">{action.cancellationReason}</p>
                  </div>
                )}

                {/* Lifecycle Controls & Audit Trail Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {/* Audit Trail toggle */}
                  <button
                    type="button"
                    data-testid={`audit-toggle-${action.actionId}`}
                    onClick={() => toggleAuditTrail(action.actionId)}
                    className="inline-flex items-center gap-1 text-xs font-mono font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                  >
                    <span>Audit Trail ({action.auditTrail.length})</span>
                    {isAuditExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {/* Operational Transition Buttons */}
                  <div className="flex items-center gap-2">
                    {action.status === 'OPEN' && (
                      <>
                        <button
                          type="button"
                          onClick={() => openModal('ASSIGN', action)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 transition-colors cursor-pointer"
                        >
                          Assign Action
                        </button>
                        <button
                          type="button"
                          onClick={() => openModal('CANCEL', action)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 border border-transparent transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {action.status === 'ASSIGNED' && (
                      <>
                        <button
                          type="button"
                          onClick={() => openModal('START', action)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          Start Work
                        </button>
                        <button
                          type="button"
                          onClick={() => openModal('ASSIGN', action)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                        >
                          Reassign
                        </button>
                        <button
                          type="button"
                          onClick={() => openModal('CANCEL', action)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 border border-transparent transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {action.status === 'IN_PROGRESS' && (
                      <>
                        <button
                          type="button"
                          onClick={() => openModal('COMPLETE', action)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Complete Action
                        </button>
                        <button
                          type="button"
                          onClick={() => openModal('CANCEL', action)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 border border-transparent transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {isTerminal && (
                      <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
                        Workflow Finalized ({action.status})
                      </span>
                    )}
                  </div>
                </div>

                {/* Collapsible Audit Trail Content */}
                {isAuditExpanded && (
                  <div data-testid="audit-trail-history" className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-2">
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      Audit Trail History
                    </p>
                    <div className="space-y-2">
                      {action.auditTrail.map((entry, idx) => (
                        <div
                          key={idx}
                          className="text-xs p-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col gap-0.5"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {entry.transition}
                            </span>
                            <span className="text-slate-400 font-mono">
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            By: <strong>{entry.performedBy}</strong> ({entry.role})
                          </div>
                          {entry.notes && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 italic">
                              &ldquo;{entry.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Transition Modal */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="transition-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3
                id="transition-modal-title"
                className="text-base font-serif font-bold text-slate-900 dark:text-slate-100"
              >
                {activeModal.type === 'ASSIGN' && 'Assign Inspection Action'}
                {activeModal.type === 'START' && 'Start Action Execution'}
                {activeModal.type === 'COMPLETE' && 'Complete Inspection Action'}
                {activeModal.type === 'CANCEL' && 'Cancel Inspection Action'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Action: <strong className="text-slate-900 dark:text-slate-100">{activeModal.action.title}</strong>
              </div>

              {activeModal.type === 'ASSIGN' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Assigned To (Officer ID / Username) *
                    </label>
                    <input
                      type="text"
                      required
                      value={modalInput}
                      onChange={(e) => setModalInput(e.target.value)}
                      placeholder="e.g. officer_pune_south"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Assignment Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={modalNotes}
                      onChange={(e) => setModalNotes(e.target.value)}
                      placeholder="Special instructions for field inspection..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}

              {activeModal.type === 'START' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Execution Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="Departed for station inspection..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {activeModal.type === 'COMPLETE' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Completion Notes & Verification Findings *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    placeholder="Physical station sensor cleaned and verified. Gauge readings match ground observations within 2mm."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Completion notes must document the physical observation or evidence review findings.
                  </p>
                </div>
              )}

              {activeModal.type === 'CANCEL' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cancellation Reason *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    placeholder="Station telemetry recovered automatically; duplicate action logged."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              {modalError && (
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                  {modalError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={cn(
                    'px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs cursor-pointer flex items-center gap-1',
                    activeModal.type === 'CANCEL'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  )}
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {activeModal.type === 'ASSIGN' && 'Confirm Assignment'}
                  {activeModal.type === 'START' && 'Confirm Start'}
                  {activeModal.type === 'COMPLETE' && 'Mark Completed'}
                  {activeModal.type === 'CANCEL' && 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
