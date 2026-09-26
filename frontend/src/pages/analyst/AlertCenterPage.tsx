import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  eventService,
  ScientificEventItem,
  EventTransitionItem,
} from '../../services/eventService';
import { useRealtimeStore } from '../../stores/useRealtimeStore';
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
  Radio,
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

  const lastEventAt = useRealtimeStore((s) => s.lastEventAt);

  useEffect(() => {
    fetchEvents();
  }, [typeFilter, severityFilter, stateFilter, lastEventAt]);

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
      <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_#102A43]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#102A43] tracking-tight">
                Alert Intelligence & Scientific Event Center
              </h2>
              <span className="px-2.5 py-0.5 rounded-md bg-[#FEF3C7] border border-[#D97706] text-[#B45309] text-[10px] font-mono font-bold">
                DIAGNOSTIC_ONLY
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#F3F6F7] border border-[#102A43]/20 text-[#102A43] text-[10px] font-mono font-bold">
                Historical Archive (Kharif 2024)
              </span>
            </div>
            <p className="text-xs text-[#486581]">
              Deterministic threshold detection and alert lifecycle management for Bakshi Ka Talab (UP_LKO_BKT). Non-operational diagnostic advisory mode.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={handleDetectEvents}
              disabled={isDetecting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-heading font-bold bg-[#0E7490] text-white border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 min-h-[40px]"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Detecting...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Detect Events</span>
                </>
              )}
            </button>

            <button
              onClick={handleProcessExpiry}
              disabled={isExpiring}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-heading font-bold bg-[#F3F6F7] text-[#102A43] border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 min-h-[40px]"
            >
              {isExpiring ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              <span>Run Expiry Sweep</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Operational Gating Disclosure */}
      <div className="p-4 bg-[#F3F6F7] border-2 border-[#102A43] rounded-xl text-xs text-[#486581] shadow-[2px_2px_0px_#102A43] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#0E7490] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#102A43]">Scientific Integrity Notice:</strong> Events are detected directly from statistical downscaling outputs using Phase 4A meteorological thresholds (e.g. Heavy Rain ≥ 64.5mm/24h, Dry Spell ≥ 5 days). Because data reflects single-season historical archives, all events are designated <code>DIAGNOSTIC_ONLY</code>. Telecommunication broadcasting (SMS/WhatsApp) is disabled; deliveries operate in internal simulation mode.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-[#FEF2F2] border-2 border-[#DC2626] rounded-xl text-xs text-[#DC2626] flex items-center justify-between gap-2 shadow-[2px_2px_0px_#102A43]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchEvents()}
            className="px-3 py-1 rounded-lg bg-white border border-[#DC2626] text-[#DC2626] font-mono font-bold hover:bg-[#FEF2F2] transition-colors"
          >
            RETRY
          </button>
        </div>
      )}

      {/* 3. Filters Bar */}
      <div className="bg-white border-2 border-[#102A43] rounded-xl p-4 shadow-[2px_2px_0px_#102A43]">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center">
          <div>
            <label className="text-[11px] font-heading font-bold text-[#102A43] block mb-1">
              Event Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-xs font-medium border-2 border-[#102A43]/20 rounded-lg p-2 bg-[#F3F6F7] text-[#102A43] focus:outline-none focus:border-[#0E7490]"
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
            <label className="text-[11px] font-heading font-bold text-[#102A43] block mb-1">
              Severity Tier
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full text-xs font-medium border-2 border-[#102A43]/20 rounded-lg p-2 bg-[#F3F6F7] text-[#102A43] focus:outline-none focus:border-[#0E7490]"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="WATCH">Watch</option>
              <option value="INFO">Info</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-heading font-bold text-[#102A43] block mb-1">
              Lifecycle State
            </label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full text-xs font-medium border-2 border-[#102A43]/20 rounded-lg p-2 bg-[#F3F6F7] text-[#102A43] focus:outline-none focus:border-[#0E7490]"
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
            <span className="text-xs text-[#829AB1] font-mono">
              Total Events: <strong className="text-[#102A43]">{events.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Events Matrix Table */}
      <div className="bg-white border-2 border-[#102A43] rounded-2xl shadow-[4px_4px_0px_#102A43] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-[#829AB1]">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#0E7490]" />
            <span className="text-xs font-mono font-bold">Scanning Alert Intelligence Registry...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center p-12 text-[#829AB1] space-y-2">
            <Bell className="w-8 h-8 mx-auto text-[#102A43]/30" />
            <p className="text-sm font-heading font-bold text-[#102A43]">No active events matching filter criteria</p>
            <p className="text-xs text-[#486581]">
              Click &quot;Detect Events&quot; above to run a threshold evaluation pass over current forecast products.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F6F7] border-b-2 border-[#102A43]/15 font-heading text-[#102A43] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-extrabold">Event ID & Source</th>
                  <th className="py-3 px-3 font-extrabold">Detected</th>
                  <th className="py-3 px-3 font-extrabold">Severity</th>
                  <th className="py-3 px-3 font-extrabold">Threshold Trigger</th>
                  <th className="py-3 px-3 text-right font-extrabold">Probability</th>
                  <th className="py-3 px-3 font-extrabold">Current State</th>
                  <th className="py-3 px-3 font-extrabold">Expiry Window</th>
                  <th className="py-3 px-4 text-center font-extrabold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#102A43]/10 font-mono text-xs">
                {events.map((ev) => (
                  <tr key={ev.event_id} className="hover:bg-[#FFFFFF] transition-colors">
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-heading font-bold text-[#102A43]">{ev.event_type}</div>
                      <div className="text-[10px] font-mono text-[#829AB1]">
                        {ev.event_id} • Centroid: {ev.block_id}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px] text-[#486581]">
                      {ev.detected_at ? new Date(ev.detected_at).toLocaleDateString() : ev.valid_from}
                    </td>

                    <td className="py-3.5 px-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          ev.severity === 'CRITICAL'
                            ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30'
                            : ev.severity === 'WARNING'
                            ? 'bg-[#FEF3C7] text-[#B45309] border-[#D97706]/40'
                            : 'bg-[#DBEAFE] text-[#1E40AF] border-[#2563EB]/30'
                        }`}
                      >
                        {ev.severity}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-sans text-[#486581] text-[11px] max-w-xs">
                      {ev.description || 'Threshold exceedance evaluated'}
                    </td>

                    <td className="py-3.5 px-3 text-right font-bold text-[#102A43]">
                      {(ev.probability * 100).toFixed(1)}%
                    </td>

                    <td className="py-3.5 px-3 font-sans">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono border ${
                          ev.state === 'RESOLVED'
                            ? 'bg-[#EBF5EE] text-[#3F7D58] border-[#3F7D58]/30'
                            : ev.state === 'ACKNOWLEDGED'
                            ? 'bg-[#DBEAFE] text-[#1E40AF] border-[#2563EB]/30'
                            : 'bg-[#F3F6F7] text-[#102A43] border-[#102A43]/20'
                        }`}
                      >
                        {ev.state}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[#486581] text-[11px]">
                      {ev.valid_until}
                    </td>

                    <td className="py-3.5 px-4 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        {ev.state === 'DETECTED' && (
                          <button
                            onClick={() => handleAcknowledge(ev.event_id)}
                            className="px-2.5 py-1 text-[11px] font-heading font-bold bg-[#EBF5EE] hover:bg-[#3F7D58] hover:text-white text-[#3F7D58] rounded-lg border border-[#3F7D58]/30 active:translate-x-0.5 active:translate-y-0.5 transition"
                          >
                            Acknowledge
                          </button>
                        )}
                        {ev.state === 'ACKNOWLEDGED' && (
                          <button
                            onClick={() => handleResolve(ev.event_id)}
                            className="px-2.5 py-1 text-[11px] font-heading font-bold bg-[#0E7490] hover:bg-[#155E75] text-white rounded-lg border border-[#102A43] active:translate-x-0.5 active:translate-y-0.5 transition"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={() => handleViewHistory(ev.event_id)}
                          className="px-2.5 py-1 text-[11px] font-heading font-bold bg-white text-[#486581] hover:text-[#102A43] rounded-lg border border-[#102A43]/15 active:translate-x-0.5 active:translate-y-0.5 transition"
                        >
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Event History Inspection Drawer */}
      {selectedEventHistory && (
        <div className="bg-white border-2 border-[#102A43] rounded-2xl p-5 shadow-[4px_4px_0px_#102A43] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#102A43]/10">
            <h3 className="font-heading font-extrabold text-sm text-[#102A43]">
              State Transition Audit: {selectedEventHistory.eventId}
            </h3>
            <button
              onClick={() => setSelectedEventHistory(null)}
              className="text-xs font-bold text-[#829AB1] hover:text-[#102A43]"
            >
              Close
            </button>
          </div>

          {selectedEventHistory.history.length === 0 ? (
            <p className="text-xs text-[#829AB1]">No previous transitions recorded.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {selectedEventHistory.history.map((t, idx) => (
                <div key={idx} className="p-3 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#102A43]">{t.previous_state} → {t.new_state}</span>
                    <p className="text-[11px] text-[#486581]">{t.reason}</p>
                  </div>
                  <span className="font-mono text-[10px] text-[#829AB1]">{t.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
