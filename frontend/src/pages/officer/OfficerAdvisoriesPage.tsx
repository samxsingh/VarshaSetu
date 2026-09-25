import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import {
  Bell,
  Send,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Sprout,
  Filter,
  Layers,
  Database,
  Info,
} from 'lucide-react';
import { useOfficerStore } from '../../stores/useOfficerStore';
import {
  advisoryService,
  AgronomyStatusResponse,
} from '../../services/advisoryService';
import { ScientificAdvisory } from '@shared/types';

export const OfficerAdvisoriesPage: React.FC = () => {
  const { setBulletinModalOpen } = useOfficerStore();

  const [selectedCrop, setSelectedCrop] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [engineStatus, setEngineStatus] = useState<AgronomyStatusResponse | null>(null);
  const [advisories, setAdvisories] = useState<ScientificAdvisory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Default diagnostic advisory list for demonstration
  const fallbackAdvisories: ScientificAdvisory[] = [
    {
      advisory_id: 'ADV_20240915_UP_LKO_BKT_AGRO_HEAVY_RAIN_001',
      forecast_id: 'FCST_20240915_H7_UP_LKO_BKT_HR',
      block_id: 'UP_LKO_BKT',
      crop_type: 'PADDY',
      growth_stage: 'MATURITY',
      rule_id: 'AGRO_PADDY_HEAVY_RAIN_HARVEST_001',
      rule_name: 'Paddy Maturity Heavy Rain Risk Watch',
      severity: 'WATCH',
      category: 'WEATHER_RISK',
      headline: 'Heavy Rainfall Risk Identified During Paddy Maturity Window',
      advisory_text:
        'Statistical downscaling indicates an elevated probability (58.4%) of rainfall exceeding 64.5 mm within the upcoming 7-day window. In mature stands, sustained wet conditions present risk of grain lodging and delayed harvest drying.',
      valid_from: '2024-09-15',
      valid_until: '2024-09-22',
      operational_status: 'DIAGNOSTIC_ONLY',
      scientific_basis: 'IMD heavy rainfall threshold >= 64.5 mm combined with Kharif 2024 meteorological profile.',
      uncertainty_caveat: 'Single-station validation (UP_LKO_BKT). Multi-year verification pending.',
      confidence_status: 'MODERATE_CONFIDENCE',
      evidence: {
        forecast_id: 'FCST_20240915_H7_UP_LKO_BKT_HR',
        target_name: 'HEAVY_RAIN',
        calibrated_probability: 0.584,
        threshold_value: 64.5,
        threshold_unit: 'mm',
        model_name: 'LightGBM-Isotonic-Calibrated',
        model_version: '1.0.0',
        data_freshness: 'HISTORICAL_ONLY',
        validation_status: 'SINGLE_STATION_VALIDATED',
        operational_status: 'DIAGNOSTIC_ONLY',
        station_coverage: 'Bakshi Ka Talab centroid',
        evaluation_timestamp: '2024-09-15T06:00:00Z',
      },
      explanation: {
        headline: '58.4% Calibrated Probability of Heavy Rainfall Event',
        evidence_summary: 'Calibrated ensemble model estimates 58.4% probability of rainfall >= 64.5 mm.',
        model_signals: ['850 hPa relative humidity anomaly detected'],
        historical_context: 'September 2024 recorded 2 episodic convective events.',
        uncertainty_caveat: 'Informational diagnostic indicator.',
        language_mode: 'NON_CAUSAL_SCIENTIFIC',
      },
      deduplication_hash: 'c827b5e412a88fb0391d79a95f87b32c68a4e1d5',
      status: 'ACTIVE',
      created_at: '2024-09-15T06:00:00Z',
    },
    {
      advisory_id: 'ADV_20240710_UP_LKO_BKT_AGRO_DRY_SPELL_001',
      forecast_id: 'FCST_20240710_H14_UP_LKO_BKT_DS',
      block_id: 'UP_LKO_BKT',
      crop_type: 'PADDY',
      growth_stage: 'VEGETATIVE',
      rule_id: 'AGRO_PADDY_DRY_SPELL_VEGETATIVE_001',
      rule_name: 'Paddy Vegetative Dry Spell Risk Indicator',
      severity: 'WATCH',
      category: 'WATER_STRESS',
      headline: 'Prolonged Dry Spell Risk Indicator in Vegetative Rice',
      advisory_text:
        'Downscaled meteorological indicators project a 48.0% probability of an extended dry hiatus (>= 5 consecutive dry days with < 2.5 mm rainfall). Vegetative tillering paddy requires sustained topsoil moisture.',
      valid_from: '2024-07-10',
      valid_until: '2024-07-24',
      operational_status: 'DIAGNOSTIC_ONLY',
      scientific_basis: 'IMD consecutive dry days criteria (daily rain < 2.5 mm for >= 5 consecutive days).',
      uncertainty_caveat: 'Medium horizon (14-day) forecast carries wider uncertainty.',
      confidence_status: 'MODERATE_CONFIDENCE',
      evidence: {
        forecast_id: 'FCST_20240710_H14_UP_LKO_BKT_DS',
        target_name: 'DRY_SPELL',
        calibrated_probability: 0.48,
        threshold_value: 5.0,
        threshold_unit: 'consecutive days (< 2.5mm)',
        model_name: 'XGBoost-Isotonic-Calibrated',
        model_version: '1.0.0',
        data_freshness: 'HISTORICAL_ONLY',
        validation_status: 'SINGLE_STATION_VALIDATED',
        operational_status: 'DIAGNOSTIC_ONLY',
        station_coverage: 'Bakshi Ka Talab centroid',
        evaluation_timestamp: '2024-07-10T06:00:00Z',
      },
      explanation: {
        headline: '48.0% Calibrated Probability of Dry Spell Hiatus',
        evidence_summary: 'Ensemble model predicts consecutive dry period probability of 48.0%.',
        model_signals: ['Weakening monsoon trough axis'],
        historical_context: 'Mid-July dry spells observed in Kharif 2024.',
        uncertainty_caveat: 'Atmospheric breaks can collapse rapidly.',
        language_mode: 'NON_CAUSAL_SCIENTIFIC',
      },
      deduplication_hash: 'e499d3b718f3a011a43a887b416cb2899478f711',
      status: 'ACTIVE',
      created_at: '2024-07-10T06:00:00Z',
    },
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchOfficerAdvisories = async () => {
      setLoading(true);
      try {
        const [stRes, advRes] = await Promise.all([
          advisoryService.getStatus().catch(() => null),
          advisoryService.listScientificAdvisories({
            crop_type: selectedCrop === 'ALL' ? undefined : selectedCrop,
            severity: selectedSeverity === 'ALL' ? undefined : selectedSeverity,
          }).catch(() => null),
        ]);

        if (isMounted) {
          if (stRes?.success && stRes.data) setEngineStatus(stRes.data);
          if (advRes?.success && advRes.data?.advisories && advRes.data.advisories.length > 0) {
            setAdvisories(advRes.data.advisories);
          } else {
            let filtered = fallbackAdvisories;
            if (selectedCrop !== 'ALL') {
              filtered = filtered.filter((a) => a.crop_type === selectedCrop || a.crop_type === 'GENERAL');
            }
            if (selectedSeverity !== 'ALL') {
              filtered = filtered.filter((a) => a.severity === selectedSeverity);
            }
            setAdvisories(filtered);
          }
        }
      } catch (err) {
        if (isMounted) setAdvisories(fallbackAdvisories);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOfficerAdvisories();
    return () => {
      isMounted = false;
    };
  }, [selectedCrop, selectedSeverity]);

  return (
    <div className="space-y-6" data-testid="officer-advisories-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-surface-border">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-heading font-bold text-xl text-slate-900">
              Block Agronomic Intelligence Monitor
            </h2>
            <Badge variant="teal" size="sm">Phase 5A Engine</Badge>
            <Badge variant="amber" size="sm">DIAGNOSTIC_ONLY</Badge>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Monitor rule evaluations, hazard thresholds, and scientific evidence across agricultural administrative blocks.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Send className="w-4 h-4" />}
          onClick={() => setBulletinModalOpen(true)}
        >
          Draft Advisory Bulletin
        </Button>
      </div>

      {/* Mandatory Scope Disclosure */}
      <Alert variant="info" title="Scientific Scope & Ground Anchor">
        Agronomic rules operate in <strong className="font-mono text-slate-900">DIAGNOSTIC_ONLY</strong> mode.
        Station anchor is Bakshi Ka Talab (<strong className="font-mono text-slate-900">UP_LKO_BKT</strong>) with 122 daily records from Kharif 2024.
        Blocks are presented neutrally without competitive rankings.
      </Alert>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-surface-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-heading font-semibold text-slate-700">Filter Crop:</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="px-3 py-1.5 bg-surface-muted rounded-lg text-xs font-semibold text-slate-800 border border-surface-border"
            >
              <option value="ALL">All Registered Crops</option>
              <option value="PADDY">Paddy (धान)</option>
              <option value="WHEAT">Wheat (गेहूं)</option>
              <option value="MAIZE">Maize (मक्का)</option>
              <option value="PULSES">Pulses (दलहन)</option>
              <option value="MUSTARD">Mustard (सरसों)</option>
              <option value="GENERAL">General Agro-Met</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-heading font-semibold text-slate-700">Severity:</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-1.5 bg-surface-muted rounded-lg text-xs font-semibold text-slate-800 border border-surface-border"
            >
              <option value="ALL">All Severities</option>
              <option value="HIGH">High Risk</option>
              <option value="ELEVATED">Elevated</option>
              <option value="WATCH">Watch</option>
              <option value="INFO">Info</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong className="text-slate-800">{advisories.length}</strong> active advisory record(s)
        </div>
      </div>

      {/* Advisory Feed */}
      <div className="space-y-4">
        {advisories.map((b) => (
          <Card key={b.advisory_id} className="p-5 flex flex-col justify-between gap-4 border-l-4 border-l-brand-teal">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="teal" size="sm">{b.rule_id}</Badge>
                  <span className="text-xs font-mono font-semibold text-slate-700 uppercase">
                    {b.category}
                  </span>
                  <Badge variant={b.severity === 'HIGH' ? 'crimson' : 'amber'} size="sm">
                    {b.severity}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" /> Valid: {b.valid_from} to {b.valid_until}
                  </span>
                  <Badge variant="demo" size="sm">{b.operational_status}</Badge>
                </div>
              </div>

              <h3 className="font-heading font-bold text-base text-slate-900">{b.headline}</h3>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-surface-muted/50 p-3 rounded-lg border border-surface-border/60">
                {b.advisory_text}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">CROP & STAGE</span>
                  <strong className="text-slate-800">{b.crop_type} ({b.growth_stage})</strong>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">CALIBRATED PROB</span>
                  <strong className="text-brand-teal font-mono">{(b.evidence.calibrated_probability * 100).toFixed(1)}%</strong>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">THRESHOLD</span>
                  <strong className="text-slate-800">{b.evidence.threshold_value} {b.evidence.threshold_unit}</strong>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">ANCHOR BLOCK</span>
                  <strong className="text-slate-800 font-mono">{b.block_id}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-border text-xs text-slate-500">
              <span>Scientific Basis: {b.scientific_basis}</span>
              <span className="text-amber-700 font-medium">Informational risk indicator</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
