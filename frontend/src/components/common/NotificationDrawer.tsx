import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, AlertTriangle, ShieldCheck, Activity, Info } from 'lucide-react';
import { useRealtimeStore, ScientificEventDTO, InAppNotificationDTO, EventSeverity } from '../../stores/useRealtimeStore';
import { cn } from '../../utils/cn';

const SEVERITY_COLORS: Record<EventSeverity, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300' },
  WARNING: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
  WATCH: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
  INFO: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-300' },
};

export const NotificationDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'EVENTS' | 'ALERTS'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    unreadEventCount,
    recentEvents,
    recentNotifications,
    markNotificationsRead,
    clearEvents,
  } = useRealtimeStore();

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadEventCount > 0) {
      markNotificationsRead();
    }
  };

  const hasItems = recentEvents.length > 0 || recentNotifications.length > 0;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={handleOpen}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Operational notifications${unreadEventCount > 0 ? `, ${unreadEventCount} unread` : ''}`}
        className="relative p-2 rounded-lg text-[#486581] hover:text-[#102A43] hover:bg-[#EAF0F2] border border-transparent hover:border-[#B8C5CC] transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490]"
      >
        <Bell className="w-4 h-4" />
        {unreadEventCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-white font-mono text-[10px] font-bold shadow-sm animate-pulse">
            {unreadEventCount > 9 ? '9+' : unreadEventCount}
          </span>
        )}
      </button>

      {/* Flyout Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Operational alerts and scientific events"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-[#B8C5CC] shadow-[0_12px_36px_rgba(16,42,67,0.16)] z-50 overflow-hidden animate-fade-in"
        >
          {/* Header */}
          <div className="p-3 bg-[#F3F6F7] border-b border-[#B8C5CC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0E7490]" />
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#102A43]">
                Operational Telemetry Stream
              </h3>
            </div>
            <div className="flex items-center gap-1">
              {hasItems && (
                <button
                  onClick={clearEvents}
                  className="text-[11px] font-heading font-medium text-[#486581] hover:text-[#102A43] px-1.5 py-0.5 rounded hover:bg-white"
                  title="Clear all alerts from memory"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#486581] hover:text-[#102A43] rounded"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1 p-2 bg-[#EAF0F2] border-b border-[#B8C5CC]/60 text-[11px] font-heading font-semibold">
            <button
              onClick={() => setFilter('ALL')}
              className={cn(
                'px-2 py-0.5 rounded transition-all',
                filter === 'ALL'
                  ? 'bg-[#0E7490] text-white shadow-sm'
                  : 'text-[#486581] hover:text-[#102A43]'
              )}
            >
              All ({recentEvents.length + recentNotifications.length})
            </button>
            <button
              onClick={() => setFilter('EVENTS')}
              className={cn(
                'px-2 py-0.5 rounded transition-all',
                filter === 'EVENTS'
                  ? 'bg-[#0E7490] text-white shadow-sm'
                  : 'text-[#486581] hover:text-[#102A43]'
              )}
            >
              Events ({recentEvents.length})
            </button>
            <button
              onClick={() => setFilter('ALERTS')}
              className={cn(
                'px-2 py-0.5 rounded transition-all',
                filter === 'ALERTS'
                  ? 'bg-[#0E7490] text-white shadow-sm'
                  : 'text-[#486581] hover:text-[#102A43]'
              )}
            >
              Alerts ({recentNotifications.length})
            </button>
          </div>

          {/* Scrollable list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#EAF0F2]">
            {!hasItems ? (
              <div className="p-6 text-center text-[#829AB1]">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-[#0E7490]/50" />
                <p className="text-xs font-heading font-bold text-[#102A43]">
                  All Systems Operational
                </p>
                <p className="text-[11px] text-[#486581] mt-0.5">
                  No active scientific anomalies or operational alerts in memory.
                </p>
              </div>
            ) : (
              <>
                {/* Events */}
                {(filter === 'ALL' || filter === 'EVENTS') &&
                  recentEvents.map((evt: ScientificEventDTO) => {
                    const style = SEVERITY_COLORS[evt.severity] || SEVERITY_COLORS.INFO;
                    return (
                      <div
                        key={`evt-${evt.eventId}`}
                        className="p-3 hover:bg-[#F3F6F7] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span
                            className={cn(
                              'text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border',
                              style.bg,
                              style.text,
                              style.border
                            )}
                          >
                            {evt.severity}: {evt.eventType}
                          </span>
                          <span className="text-[10px] font-mono text-[#829AB1]">
                            {new Date(evt.detectedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-[#102A43] font-medium leading-snug">
                          {evt.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-[#486581]">
                          <span>Block: {evt.blockId}</span>
                          <span>•</span>
                          <span>Prob: {(evt.probability * 100).toFixed(0)}%</span>
                          <span>•</span>
                          <span className="uppercase text-[#0E7490]">{evt.state}</span>
                        </div>
                      </div>
                    );
                  })}

                {/* Notifications */}
                {(filter === 'ALL' || filter === 'ALERTS') &&
                  recentNotifications.map((notif: InAppNotificationDTO) => {
                    const style = SEVERITY_COLORS[notif.severity] || SEVERITY_COLORS.INFO;
                    return (
                      <div
                        key={`notif-${notif.id || notif.deliveryId}`}
                        className="p-3 hover:bg-[#F3F6F7] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span
                            className={cn(
                              'text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border',
                              style.bg,
                              style.text,
                              style.border
                            )}
                          >
                            {notif.severity} ALERT
                          </span>
                          <span className="text-[10px] font-mono text-[#829AB1]">
                            {new Date(notif.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <h4 className="text-xs font-heading font-bold text-[#102A43] leading-snug">
                          {notif.title}
                        </h4>
                        <p className="text-xs text-[#486581] mt-0.5 leading-snug">{notif.body}</p>
                      </div>
                    );
                  })}
              </>
            )}
          </div>

          {/* Footer note */}
          <div className="p-2 bg-[#F3F6F7] border-t border-[#B8C5CC] text-[10px] text-[#829AB1] font-mono text-center flex items-center justify-center gap-1">
            <Info className="w-3 h-3 text-[#0E7490]" />
            <span>SOCKET.IO REAL-TIME TELEMETRY BUS</span>
          </div>
        </div>
      )}
    </div>
  );
};
