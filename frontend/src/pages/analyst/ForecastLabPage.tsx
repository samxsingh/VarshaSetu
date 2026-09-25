import React, { useState, useEffect } from 'react';
import {
  modelService,
  HindcastStatusResponse,
  HindcastGateResponse,
  HindcastFoldsResponse,
  HindcastResultsResponse,
  HindcastStabilityResponse,
  HindcastDriftResponse,
  HindcastCoverageResponse,
} from '../../services/modelService';
import { HindcastSummaryPanel } from '../../components/analyst/HindcastSummaryPanel';
import { Card, CardContent } from '../../components/ui/Card';
import { Loader2, AlertCircle } from 'lucide-react';

export const ForecastLabPage: React.FC = () => {
  const [selectedTarget, setSelectedTarget] = useState<string>('HEAVY_RAIN');
  const [selectedHorizon, setSelectedHorizon] = useState<number>(7);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const [status, setStatus] = useState<HindcastStatusResponse | null>(null);
  const [gate, setGate] = useState<HindcastGateResponse | null>(null);
  const [folds, setFolds] = useState<HindcastFoldsResponse | null>(null);
  const [results, setResults] = useState<HindcastResultsResponse | null>(null);
  const [stability, setStability] = useState<HindcastStabilityResponse | null>(null);
  const [drift, setDrift] = useState<HindcastDriftResponse | null>(null);
  const [coverage, setCoverage] = useState<HindcastCoverageResponse | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        statusRes,
        gateRes,
        foldsRes,
        resultsRes,
        stabilityRes,
        driftRes,
        coverageRes,
      ] = await Promise.all([
        modelService.getHindcastStatus().catch(() => null),
        modelService.getHindcastGate().catch(() => null),
        modelService.getHindcastFolds().catch(() => null),
        modelService.getHindcastResults(selectedTarget, selectedHorizon).catch(() => null),
        modelService.getHindcastStability(selectedTarget, selectedHorizon).catch(() => null),
        modelService.getHindcastDrift().catch(() => null),
        modelService.getHindcastCoverage().catch(() => null),
      ]);

      if (statusRes?.success && statusRes.data) setStatus(statusRes.data);
      if (gateRes?.success && gateRes.data) setGate(gateRes.data);
      if (foldsRes?.success && foldsRes.data) setFolds(foldsRes.data);
      if (resultsRes?.success && resultsRes.data) setResults(resultsRes.data);
      if (stabilityRes?.success && stabilityRes.data) setStability(stabilityRes.data);
      if (driftRes?.success && driftRes.data) setDrift(driftRes.data);
      if (coverageRes?.success && coverageRes.data) setCoverage(coverageRes.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load hindcast evaluation data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTarget, selectedHorizon]);

  const handleRunHindcast = async () => {
    try {
      setIsExecuting(true);
      await modelService.runHindcast({
        target_name: selectedTarget,
        horizon_days: selectedHorizon,
        block_id: 'UP_LKO_BKT',
      });
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to execute hindcast pipeline.');
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading && !status) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
        <span className="text-sm font-medium">Loading Hindcasting & Skill Evaluation Lab...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3 text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      <HindcastSummaryPanel
        status={status}
        gate={gate}
        folds={folds}
        results={results}
        stability={stability}
        drift={drift}
        coverage={coverage}
        selectedTarget={selectedTarget}
        selectedHorizon={selectedHorizon}
        onTargetChange={setSelectedTarget}
        onHorizonChange={setSelectedHorizon}
        onRunHindcast={handleRunHindcast}
        isExecuting={isExecuting}
      />
    </div>
  );
};
