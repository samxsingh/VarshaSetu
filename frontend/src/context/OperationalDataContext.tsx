import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  weatherService,
  OperationalDataContext as OperationalDataContextType,
  FreshnessClassification,
  OperationalDataMode,
} from '../services/weatherService';

interface OperationalDataContextValue {
  dataContext: OperationalDataContextType | null;
  loading: boolean;
  error: string | null;
  refreshContext: () => Promise<void>;
  // Convenient pre-computed properties for UI components
  currentDate: string; // YYYY-MM-DD
  currentDateLabel: string; // e.g. 28 Sep 2026
  referenceTimeIST: string; // e.g. 17:01 IST
  forecastWindowLabel: string; // e.g. 28 Sep – 05 Oct 2026
  freshnessStatus: FreshnessClassification;
  dataMode: OperationalDataMode;
  sourceAttribution: string;
  isLive: boolean;
  isHistorical: boolean;
  isSimulated: boolean;
}

const OperationalDataContext = createContext<OperationalDataContextValue | undefined>(undefined);

export const OperationalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataContext, setDataContext] = useState<OperationalDataContextType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContext = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await weatherService.getDataContext({ block_id: 'UP_LKO_BKT' });
      if (res.success && res.data) {
        setDataContext(res.data);
      } else {
        const errMsg = 'error' in res && res.error ? res.error.message : 'Failed to fetch operational temporal context';
        setError(errMsg);
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to data context endpoint');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContext();
    // Refresh context periodically every 5 minutes
    const interval = setInterval(fetchContext, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchContext]);

  const value = useMemo<OperationalDataContextValue>(() => {
    const now = new Date();
    const fallbackDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const currentDate = dataContext?.currentDate || fallbackDateStr;

    // Format readable date label (e.g. 28 Sep 2026)
    let currentDateLabel = 'Current Operational Period';
    try {
      const parts = currentDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        currentDateLabel = d.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          timeZone: 'Asia/Kolkata',
        });
      }
    } catch {
      // fallback
    }

    // Format forecast window label
    let forecastWindowLabel = 'Next 7 Days';
    if (dataContext?.forecastWindow) {
      try {
        const s = new Date(dataContext.forecastWindow.start);
        const e = new Date(dataContext.forecastWindow.end);
        const sFmt = s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
        const eFmt = e.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
        forecastWindowLabel = `${sFmt} – ${eFmt}`;
      } catch {
        // fallback
      }
    }

    const referenceTimeIST = dataContext?.referenceTimeIST || now.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' IST';

    const freshnessStatus = dataContext?.freshnessStatus || 'LIVE';
    const dataMode = dataContext?.dataMode || 'OPERATIONAL';

    return {
      dataContext,
      loading,
      error,
      refreshContext: fetchContext,
      currentDate,
      currentDateLabel,
      referenceTimeIST,
      forecastWindowLabel,
      freshnessStatus,
      dataMode,
      sourceAttribution: dataContext?.source || 'Open-Meteo / ECMWF IFS & DWD ICON',
      isLive: freshnessStatus === 'LIVE',
      isHistorical: freshnessStatus === 'HISTORICAL' || dataMode === 'HISTORICAL_ARCHIVE',
      isSimulated: freshnessStatus === 'SIMULATED' || dataMode === 'SIMULATION',
    };
  }, [dataContext, loading, error, fetchContext]);

  return (
    <OperationalDataContext.Provider value={value}>
      {children}
    </OperationalDataContext.Provider>
  );
};

export function useOperationalData(): OperationalDataContextValue {
  const context = useContext(OperationalDataContext);
  if (!context) {
    // Return sensible fallback rather than crashing if rendered outside provider in tests
    const now = new Date();
    const fallbackDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    return {
      dataContext: null,
      loading: false,
      error: null,
      refreshContext: async () => {},
      currentDate: fallbackDateStr,
      currentDateLabel: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }),
      referenceTimeIST: now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) + ' IST',
      forecastWindowLabel: 'Next 7 Days',
      freshnessStatus: 'LIVE',
      dataMode: 'OPERATIONAL',
      sourceAttribution: 'Open-Meteo / ECMWF IFS & DWD ICON',
      isLive: true,
      isHistorical: false,
      isSimulated: false,
    };
  }
  return context;
}
