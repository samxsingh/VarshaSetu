import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  eventService,
  ScientificEventItem,
  EventTransitionItem,
} from '../../services/eventService';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  History,
  Info,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sliders,
  Check,
  X,
} from 'lucide-react';

export const AlertCenterPage: React.FC = () => {
  const [events, setEvents] = useState<ScientificEventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [isExpiring, setIsExpiring] = useState<boolean>(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');

  // Selected event for history inspection
  const [selectedEventHistory, setSelectedEventHistory] = useState<{
    eventId: string;
    history: EventTransitionItem[];
  } | null>(null);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await eventService.listEvents({
        event_type: typeFilter === 'ALL' ? undefined : typeFilter,
        severity: severityFilter === 'ALL' ? undefined : severityFilter,
        state: stateFilter === 'ALL' ? undefined : stateFilter,
      });

      if (res.success && res.data) {
        setEvents(res.data.events);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch event intelligence log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [typeFilter, severityFilter, stateFilter]);

  const handleDetectEvents = async () => {
    try {
      setIsDetecting(true);
      setError(null);
      await eventService.detectEvents({ block_id: 'UP_LKO_BKT', cooldown_hours: 24 });
      await fetchEvents();
    } catch (err: any) {
      setError(err?.message || 'Event detection pass failed.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleProcessExpiry = async () => {
    try {
      setIsExpiring(true);
      await eventService.processForecastExpiry();
      await fetchEvents();
    } catch (err: any) {
      setError(err?.message || 'Expiry sweep failed.');
    } finally {
      setIsExpiring(false);
    }
  };

  const handleAcknowledge = async (eventId: string) => {
    try {
      await eventService.acknowledgeEvent(eventId, 'Duty officer review confirmed');
      await fetchEvents();
    } catch (err: any) {
      setError(err?.message || 'Failed to acknowledge event.');
    }
  };

  const handleResolve = async (eventId: string) => {
    try {
      await eventService.resolveEvent(eventId, 'Event validity period concluded');
      await fetchEvents();
    } catch (err: any) {
      setError(err?.message || 'Failed to resolve event.');
    }
  };

  const handleViewHistory = async (eventId: string) => {
    try {
      setHistoryLoading(true);
      const res = await eventService.getEventHistory(eventId);
      if (res.success && res.data) {
        setSelectedEventHistory({
          eventId,
          history: res.data.history,
        });
      }
    } catch (err: any) {
      // Fallback
    } finally {
      setHistoryLoading(false);
    }
  };

  const getSeverityBadgeVariant = (sev: string): 'amber' | 'emerald' | 'neutral' => {
    switch (sev) {
      case 'CRITICAL':
      case 'WARNING':
        return 'amber';
      case 'WATCH':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6" data-testid="alert-center-page">
      {/* 1. Header & Actions */}
      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading font-bold text-lg text-slate-900">
                Alert Intelligence & Scientific Event Center
              </h2>
              <Badge variant="amber" size="sm">
                DIAGNOSTIC_ONLY
              </Badge>
              <Badge variant="neutral" size="sm">
                Historical Archive (Kharif 2024)
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Deterministic threshold detection and alert lifecycle management for Bakshi Ka Talab (UP_LKO_BKT). Non-operational diagnostic advisory mode.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDetectEvents}
              disabled={isDetecting}
              className="text-xs font-bold py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Detect Events
                </>
              )}
            </button>

            <button
              onClick={handleProcessExpiry}
              disabled={isExpiring}
              className="text-xs font-semibold py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition border border-slate-200 disabled:opacity-50"
            >
              {isExpiring ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              Run Expiry Sweep
            </button>
          </div>
        </div>
      </Card>

      {/* 2. Operational Gating Disclosure */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-900">Scientific Integrity Notice:</strong> Events are detected directly from statistical downscaling outputs using Phase 4A meteorological thresholds (e.g. Heavy Rain ≥ 64.5mm/24h, Dry Spell ≥ 5 days). Because data reflects single-season historical archives, all events are designated <code>DIAGNOSTIC_ONLY</code>. Telecommunication broadcasting (SMS/WhatsApp) is disabled; deliveries operate in internal simulation mode.
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3 text-red-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {/* 3. Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Event Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Event Types</option>
              <option value="HEAVY_RAIN_RISK">Heavy Rain Risk (≥64.5mm)</option>
              <option value="EXTREME_RAIN_RISK">Extreme Rain Risk (≥204.5mm)</option>
              <option value="DRY_SPELL_RISK">Dry Spell Risk (≥5 days)</option>
              <option value="MONSOON_ONSET_RISK">Monsoon Onset Surge</option>
              <option value="FALSE_ONSET_RISK">False Onset Break</option>
              <option value="RAINFALL_ANOMALY">Rainfall Anomaly</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Severity Tier
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="WATCH">Watch</option>
              <option value="INFO">Info</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Lifecycle State
            </label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All States</option>
              <option value="DETECTED">Detected</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="UPDATED">Updated</option>
              <option value="RESOLVED">Resolved</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          <div className="sm:self-end pt-1">
            <span className="text-xs text-slate-500 font-mono">
              Total Events: <strong>{events.length}</strong>
            </span>
          </div>
        </div>
      </Card>

      {/* 4. Events Matrix Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
            <span className="text-sm font-medium">Scanning Alert Intelligence Registry...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center p-12 text-slate-500 space-y-2">
            <Bell className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-700">No active events matching filter criteria</p>
            <p className="text-xs text-slate-500">
              Click &quot;Detect Events&quot; above to run a threshold evaluation pass over current forecast products.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-surface-border font-heading text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Event & Type</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3 text-right">Probability</th>
                  <th className="py-3 px-3">Validity Window</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">State</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border font-mono text-xs">
                {events.map((ev) => (
                  <tr key={ev.event_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-bold text-slate-900">{ev.event_type}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {ev.event_id} • Block: {ev.block_id}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-sans">
                      <Badge variant={getSeverityBadgeVariant(ev.severity)} size="sm">
                        {ev.severity}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                      {(ev.probability * 100).toFixed(1)}%
                    </td>

                    <td className="py-3.5 px-3 font-sans text-slate-600 text-[11px]">
                      {ev.valid_from} to {ev.valid_until}
                    </td>

                    <td className="py-3.5 px-3 font-sans">
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-mono font-medium">
                        {ev.operational_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-sans">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
                          ev.state === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : ev.state === 'ACKNOWLEDGED'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ev.state}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        {ev.state === 'DETECTED' && (
                          <button
                            onClick={() => handleAcknowledge(ev.event_id)}
                            className="px-2 py-1 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded transition"
                          >
                            Acknowledge
                          </button>
                        )}
                        {ev.state === 'ACKNOWLEDGED' && (
                          <button
                            onClick={() => handleResolve(ev.event_id)}
                            className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded transition"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={() => handleViewHistory(ev.event_id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          title="View Transition History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 5. Event History Modal */}
      {selectedEventHistory && (
        <Card className="p-5 border-indigo-200 bg-white shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Audit Trail: {selectedEventHistory.eventId}
              </h3>
            </div>
            <button
              onClick={() => setSelectedEventHistory(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {selectedEventHistory.history.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No state transitions recorded yet.</p>
            ) : (
              selectedEventHistory.history.map((t, idx) => (
                <div
                  key={t.transition_id || idx}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-bold text-slate-900">
                      {t.previous_state} ➔ {t.new_state}
                    </span>
                    <span className="text-slate-500 text-[11px] block">{t.reason}</span>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-400 shrink-0">
                    <div>Actor: {t.actor}</div>
                    <div>{t.timestamp}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
