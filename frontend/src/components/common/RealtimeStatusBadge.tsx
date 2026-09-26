import React from 'react';
import { useRealtimeStore, RealtimeConnectionStatus } from '../../stores/useRealtimeStore';
import { socketClient } from '../../services/socketClient';
import { useAuthStore } from '../../stores/useAuthStore';
import { RefreshCw, Radio } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatusConfig {
  label: string;
  dotClass: string;
  badgeClass: string;
  description: string;
}

const STATUS_CONFIGS: Record<RealtimeConnectionStatus, StatusConfig> = {
  CONNECTED: {
    label: 'LIVE',
    dotClass: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse',
    badgeClass: 'border-emerald-300/80 bg-emerald-50 text-emerald-900',
    description: 'Real-time telemetry stream synchronized',
  },
  CONNECTING: {
    label: 'SYNCING',
    dotClass: 'bg-cyan-500 animate-ping',
    badgeClass: 'border-cyan-300/80 bg-cyan-50 text-cyan-900',
    description: 'Establishing WebSocket handshake...',
  },
  RECONNECTING: {
    label: 'RETRYING',
    dotClass: 'bg-amber-500 animate-bounce',
    badgeClass: 'border-amber-300/80 bg-amber-50 text-amber-900',
    description: 'Connection interrupted. Reconnecting with exponential backoff...',
  },
  DISCONNECTED: {
    label: 'OFFLINE',
    dotClass: 'bg-[#829AB1]',
    badgeClass: 'border-[#B8C5CC] bg-[#EAF0F2] text-[#486581]',
    description: 'Real-time socket disconnected',
  },
  ERROR: {
    label: 'ERROR',
    dotClass: 'bg-red-500',
    badgeClass: 'border-red-300/80 bg-red-50 text-red-900',
    description: 'Socket authentication or transport error',
  },
};

export const RealtimeStatusBadge: React.FC<{ className?: string; compact?: boolean }> = ({
  className,
  compact = false,
}) => {
  const { connectionStatus, connectionError, lastConnectedAt } = useRealtimeStore();
  const token = useAuthStore((state) => state.token);
  const config = STATUS_CONFIGS[connectionStatus] || STATUS_CONFIGS.DISCONNECTED;

  const handleReconnect = () => {
    if (connectionStatus !== 'CONNECTED' && connectionStatus !== 'CONNECTING') {
      socketClient.connect(token || undefined);
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Real-time sync status: ${config.label}. ${config.description}`}
      title={`${config.description}${lastConnectedAt ? ` (Connected: ${new Date(lastConnectedAt).toLocaleTimeString()})` : ''}${connectionError ? ` Error: ${connectionError}` : ''}`}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-mono font-semibold transition-all select-none',
        config.badgeClass,
        className
      )}
    >
      <span className={cn('w-2 h-2 rounded-full shrink-0', config.dotClass)} aria-hidden="true" />
      <span className="tracking-wider uppercase">{config.label}</span>
      {!compact && (
        <span className="hidden md:inline-flex items-center text-[10px] opacity-75 font-sans font-normal ml-0.5">
          <Radio className="w-2.5 h-2.5 mr-0.5 opacity-60" />
          SYNC
        </span>
      )}
      {(connectionStatus === 'DISCONNECTED' || connectionStatus === 'ERROR') && (
        <button
          onClick={handleReconnect}
          className="ml-1 p-0.5 rounded hover:bg-black/10 transition-colors"
          title="Attempt manual reconnection"
          aria-label="Retry connection"
        >
          <RefreshCw className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
};
