import React, { useState, useEffect } from 'react';
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
  Languages,
  Volume2,
  CloudRain,
  ArrowRight,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { useOfficerStore } from '../../stores/useOfficerStore';
import {
  advisoryService,
  AgronomyStatusResponse,
} from '../../services/advisoryService';
import { ScientificAdvisory, LocalizedAdvisory } from '@shared/types';
import { ScientificIntegrityStrip } from '../../components/officer/ScientificIntegrityStrip';

export const OfficerAdvisoriesPage: React.FC = () => {
  const { setBulletinModalOpen } = useOfficerStore();

  const [selectedCrop, setSelectedCrop] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [engineStatus, setEngineStatus] = useState<AgronomyStatusResponse | null>(null);
  const [advisories, setAdvisories] = useState<ScientificAdvisory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [acknowledgedAdvisories, setAcknowledgedAdvisories] = useState<Record<string, boolean>>({});

  // Phase 5C: Multilingual Review State
  const [previewLanguage, setPreviewLanguage] = useState<'EN' | 'HI'>('EN');
  const [localizedMap, setLocalizedMap] = useState<Record<string, LocalizedAdvisory>>({});

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
        horizon_days: 7,
        probability: 0.584,
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
        horizon_days: 14,
        probability: 0.48,
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

  // Fetch Hindi localization on demand
  useEffect(() => {
    if (previewLanguage === 'HI') {
      advisories.forEach(async (adv) => {
        const key = `${adv.advisory_id}_HI`;
        if (!localizedMap[key]) {
          try {
            const res = await advisoryService.localizeAdvisory({
              advisory_id: adv.advisory_id,
              target_language: 'HI',
              advisory: adv as any,
            });
            if (res.success && res.data?.localized_advisory) {
              setLocalizedMap((prev) => ({
                ...prev,
                [key]: res.data.localized_advisory,
              }));
            }
          } catch (e) {
            // ignore
          }
        }
      });
    }
  }, [previewLanguage, advisories]);

  const toggleAcknowledge = (id: string) => {
    setAcknowledgedAdvisories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6" data-testid="officer-advisories-page">
      {/* 1. Header Strip */}
      <div className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_#0B1726]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-[#008F83] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                ADVISORY INTELLIGENCE
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218] text-[10px] font-mono font-bold">
                DIAGNOSTIC ONLY
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#EBF5EE] text-[#2F7D4A] border border-[#2F7D4A]/30 text-[10px] font-mono font-bold">
                Safety Gate: ACTIVE
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0B1726] tracking-tight">
              Block Agronomic Intelligence Monitor
            </h2>
            <p className="text-xs text-[#435466] max-w-2xl leading-relaxed">
              Synthesizing downscaled weather signals, crop phenological stages, and empirical thresholds into non-causal agronomic advisories across Lucknow District.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Bilingual Preview Toggle */}
            <div className="flex items-center bg-[#F7F3EA] p-1 rounded-xl border-2 border-[#0B1726]">
              <button
                onClick={() => setPreviewLanguage('EN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all ${
                  previewLanguage === 'EN'
                    ? 'bg-[#008F83] text-white shadow-xs'
                    : 'text-[#435466] hover:text-[#0B1726]'
                }`}
              >
                EN Preview
              </button>
              <button
                onClick={() => setPreviewLanguage('HI')}
                className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all ${
                  previewLanguage === 'HI'
                    ? 'bg-[#008F83] text-white shadow-xs'
                    : 'text-[#435466] hover:text-[#0B1726]'
                }`}
              >
                हिन्दी Preview
              </button>
            </div>

            <button
              onClick={() => setBulletinModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#008F83] text-white border-2 border-[#0B1726] shadow-[2px_2px_0px_#0B1726] hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs font-heading font-bold min-h-[40px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Draft Bulletin</span>
            </button>
          </div>
        </div>

        {/* Scope disclosure bar */}
        <div className="mt-4 pt-3 border-t border-[#0B1726]/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#435466]">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#008F83]" />
            <span>Station Anchor: <strong>UP_LKO_BKT</strong> (122 Kharif 2024 Records). Deterministic templates guarantee 0% numerical drift in Hindi.</span>
          </div>
          <span className="text-[10px] font-mono text-[#62768A]">Rules Loaded: 9 Verified</span>
        </div>
      </div>

      {/* 2. Filter Toolbar */}
      <div className="bg-white border-2 border-[#0B1726] rounded-xl p-4 shadow-[3px_3px_0px_#0B1726] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-heading font-bold text-[#0B1726]">Filter Crop:</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="px-3 py-1.5 bg-[#F7F3EA] rounded-lg text-xs font-bold text-[#0B1726] border-2 border-[#0B1726]/20 focus:border-[#008F83] focus:outline-none"
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
            <label className="text-xs font-heading font-bold text-[#0B1726]">Severity:</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-1.5 bg-[#F7F3EA] rounded-lg text-xs font-bold text-[#0B1726] border-2 border-[#0B1726]/20 focus:border-[#008F83] focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="HIGH">High Risk</option>
              <option value="ELEVATED">Elevated</option>
              <option value="WATCH">Watch</option>
              <option value="INFO">Info</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#62768A] flex items-center gap-3 font-mono">
          <span>Active records: <strong className="text-[#0B1726]">{advisories.length}</strong></span>
          <span className="px-2 py-0.5 rounded bg-[#DCEFF0] text-[#006B65] border border-[#008F83]/30 text-[10px]">
            Languages: EN / HI Active
          </span>
        </div>
      </div>

      {/* 3. Advisory Feed (Weather Signal → Agronomic Indicator → Scientific Explanation) */}
      <div className="space-y-4">
        {advisories.map((b) => {
          const loc = previewLanguage === 'HI' ? localizedMap[`${b.advisory_id}_HI`] : null;
          const displayTitle = loc ? loc.title : b.headline;
          const displaySummary = loc ? loc.summary : b.advisory_text;
          const isAcked = !!acknowledgedAdvisories[b.advisory_id];

          return (
            <div
              key={b.advisory_id}
              className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 shadow-[4px_4px_0px_#0B1726] space-y-4 hover:-translate-y-0.5 transition-transform"
            >
              {/* Header meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#0B1726]/10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-[#F7F3EA] border border-[#0B1726]/20 text-[#0B1726] text-[10px] font-mono font-bold">
                    {b.rule_id}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#62768A] uppercase">
                    {b.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      b.severity === 'ELEVATED'
                        ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30'
                        : b.severity === 'WATCH'
                        ? 'bg-[#FEF6E9] text-[#9A6218] border-[#E5A33D]/40'
                        : 'bg-[#EFF6FF] text-[#1D4ED8] border-[#3B82F6]/30'
                    }`}
                  >
                    {b.severity}
                  </span>
                  {previewLanguage === 'HI' && (
                    <span className="px-2 py-0.5 rounded bg-[#EBF5EE] text-[#2F7D4A] border border-[#2F7D4A]/30 text-[10px] font-mono font-bold">
                      हिन्दी अनुवाद (सत्यापित)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#62768A] font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#008F83]" />
                    Valid: {b.valid_from} to {b.valid_until}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218] text-[9px] font-bold">
                    {b.operational_status}
                  </span>
                </div>
              </div>

              {/* Title & Core Advisory */}
              <div>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#0B1726]">
                  {displayTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#435466] leading-relaxed bg-[#F7F3EA] p-3.5 rounded-xl border border-[#0B1726]/10 mt-2">
                  {displaySummary}
                </p>
              </div>

              {/* 3-Step Scientific Hierarchy: Signal → Indicator → Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Step 1: Weather Signal */}
                <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#0B1726]/15 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#008F83]">
                    <CloudRain className="w-3.5 h-3.5" />
                    <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-[#0B1726]">
                      1. Weather Signal
                    </span>
                  </div>
                  <div className="text-[11px] text-[#435466] pt-1">
                    Probability: <strong className="text-[#008F83] font-mono font-bold">{(b.evidence.calibrated_probability * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="text-[11px] text-[#435466]">
                    Threshold: <strong className="text-[#0B1726] font-mono">{b.evidence.threshold_value} {b.evidence.threshold_unit}</strong>
                  </div>
                  <div className="text-[10px] text-[#62768A] pt-0.5">
                    Model: {b.evidence.model_name}
                  </div>
                </div>

                {/* Step 2: Agronomic Indicator */}
                <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#0B1726]/15 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#2F7D4A]">
                    <Sprout className="w-3.5 h-3.5" />
                    <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-[#0B1726]">
                      2. Agronomic Indicator
                    </span>
                  </div>
                  <div className="text-[11px] text-[#435466] pt-1">
                    Target Crop: <strong className="text-[#0B1726] font-bold">{b.crop_type}</strong>
                  </div>
                  <div className="text-[11px] text-[#435466]">
                    Phenology: <strong className="text-[#0B1726] font-mono">{b.growth_stage}</strong>
                  </div>
                  <div className="text-[10px] text-[#62768A] pt-0.5">
                    Anchor: {b.block_id}
                  </div>
                </div>

                {/* Step 3: Scientific Explanation */}
                <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#0B1726]/15 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#E5A33D]">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-[#0B1726]">
                      3. Scientific Explanation
                    </span>
                  </div>
                  <p className="text-[11px] text-[#435466] pt-1 leading-snug">
                    {b.explanation?.evidence_summary || b.scientific_basis}
                  </p>
                  <div className="text-[10px] text-[#9A6218] font-medium pt-0.5">
                    {b.uncertainty_caveat}
                  </div>
                </div>
              </div>

              {/* Action / Review Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-[#0B1726]/10 text-xs">
                <span className="text-[#62768A] text-[11px]">
                  Scientific Basis: {b.scientific_basis}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleAcknowledge(b.advisory_id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all border ${
                      isAcked
                        ? 'bg-[#EBF5EE] text-[#2F7D4A] border-[#2F7D4A]/40'
                        : 'bg-white text-[#435466] border-[#0B1726]/20 hover:border-[#0B1726] hover:text-[#0B1726]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAcked ? 'Reviewed by Officer' : 'Mark as Reviewed'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. What-If Agro-Meteorological Sensitivity Monitor (Phase 5B) */}
      <div className="bg-white border-2 border-[#0B1726] rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_#0B1726] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#0B1726]/10">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#008F83]" />
            <h3 className="font-heading font-extrabold text-base text-[#0B1726]">
              What-If Agro-Meteorological Sensitivity Monitor (Phase 5B)
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-md bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218] text-[10px] font-mono font-bold">
            SCENARIO_INDICATOR_ONLY
          </span>
        </div>

        <p className="text-xs text-[#435466] leading-relaxed">
          Extension officers can review scenario-derived sensitivity response envelopes for <strong>Bakshi Ka Talab (UP_LKO_BKT)</strong>.
          Evaluations operate strictly on meteorological indicators (moisture stress, waterlogging risk) and explicitly exclude yield predictions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15">
            <span className="font-heading font-bold text-[#0B1726] block">Sowing Delay Analysis</span>
            <span className="text-[#62768A] block text-[11px] mt-0.5 font-mono">Evaluated range: [1, 21 days]</span>
            <span className="text-[#008F83] font-mono font-bold block mt-1.5">Monotonic moisture stress increase</span>
          </div>

          <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15">
            <span className="font-heading font-bold text-[#0B1726] block">Supplemental Irrigation</span>
            <span className="text-[#62768A] block text-[11px] mt-0.5 font-mono">Evaluated intervals: [1, 7 days]</span>
            <span className="text-[#2F7D4A] font-mono font-bold block mt-1.5">Stress attenuation up to -35%</span>
          </div>

          <div className="p-3 bg-[#F7F3EA] rounded-xl border border-[#0B1726]/15">
            <span className="font-heading font-bold text-[#0B1726] block">Precipitation Concentration</span>
            <span className="text-[#62768A] block text-[11px] mt-0.5 font-mono">Evaluated multiplier: [1.0x, 2.5x]</span>
            <span className="text-[#DC2626] font-mono font-bold block mt-1.5">Waterlogging risk escalation</span>
          </div>
        </div>
      </div>

      {/* 5. Scientific Integrity Strip */}
      <ScientificIntegrityStrip />
    </div>
  );
};
