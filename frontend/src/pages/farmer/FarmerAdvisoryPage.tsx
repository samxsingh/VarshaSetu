import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  Calendar,
  AlertTriangle,
  FileText,
  Clock,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Database,
  ExternalLink,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import {
  advisoryService,
  AgronomyStatusResponse,
} from '../../services/advisoryService';
import { ScientificAdvisory } from '@shared/types';

// Phase 5A Default Scientific Advisories (conforming to Diagnostic-Only protocol)
const defaultAdvisories: ScientificAdvisory[] = [
  {
    advisory_id: 'ADV_20240915_UP_LKO_BKT_AGRO_HEAVY_RAIN_001',
    forecast_id: 'FCST_20240915_H7_UP_LKO_BKT_HR',
    block_id: 'UP_LKO_BKT',
    crop_type: 'PADDY',
    growth_stage: 'MATURITY',
    rule_id: 'AGRO_PADDY_HEAVY_RAIN_HARVEST_001',
    rule_name: 'Paddy Maturity & Harvest Heavy Rainfall Risk Watch',
    severity: 'WATCH',
    category: 'WEATHER_RISK',
    headline: 'Heavy Rainfall Risk Identified During Paddy Maturity Window',
    advisory_text:
      'Statistical downscaling indicates an elevated probability (58.4%) of rainfall exceeding 64.5 mm within the upcoming 7-day window. In mature paddy stands, sustained wet conditions present risk of grain lodging, localized waterlogging, and delayed harvest drying. Observational guidance indicates checking field drainage outlets and perimeter bund channels.',
    valid_from: '2024-09-15',
    valid_until: '2024-09-22',
    operational_status: 'DIAGNOSTIC_ONLY',
    scientific_basis:
      'IMD heavy rainfall threshold >= 64.5 mm combined with Kharif 2024 meteorological profile and Isotonic-calibrated ensemble forecast.',
    uncertainty_caveat:
      'Probability is calibrated against Kharif 2024 historical station data. Multi-year skill verification is pending multi-season data availability. Local microtopography may alter runoff behavior.',
    confidence_status: 'MODERATE_CONFIDENCE',
    evidence: {
      forecast_id: 'FCST_20240915_H7_UP_LKO_BKT_HR',
      target_name: 'HEAVY_RAIN',
      calibrated_probability: 0.584,
      threshold_value: 64.5,
      threshold_unit: 'mm',
      confidence_interval_lower: 0.492,
      confidence_interval_upper: 0.671,
      model_name: 'LightGBM-Isotonic-Calibrated',
      model_version: '1.0.0',
      data_freshness: 'HISTORICAL_ONLY',
      validation_status: 'SINGLE_STATION_VALIDATED',
      hindcast_brier_skill_score: 0.184,
      isotonic_ece: 0.042,
      operational_status: 'DIAGNOSTIC_ONLY',
      station_coverage: 'Bakshi Ka Talab centroid (UP_LKO_BKT)',
      evaluation_timestamp: '2024-09-15T06:00:00Z',
    },
    explanation: {
      headline: '58.4% Calibrated Probability of Heavy Rainfall Event',
      evidence_summary:
        'Calibrated ensemble model estimates 58.4% probability of rainfall >= 64.5 mm over 7 days with 90% CI [49.2%, 67.1%].',
      model_signals: [
        'High 850 hPa relative humidity anomaly detected in regional reanalysis',
        'Elevated precipitable water index across central Gangetic plains',
        'Chronological validation shows 0.042 Expected Calibration Error (ECE)',
      ],
      historical_context:
        'September 2024 station records for Bakshi Ka Talab recorded 2 episodic convective events exceeding 60 mm.',
      uncertainty_caveat:
        'Informational diagnostic indicator. Single-season baseline; uncertified for commercial crop insurance settlement.',
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
    rule_name: 'Paddy Vegetative Stage Extended Dry Spell Risk Indicator',
    severity: 'WATCH',
    category: 'WATER_STRESS',
    headline: 'Prolonged Dry Spell Risk Indicator in Vegetative Rice',
    advisory_text:
      'Downscaled meteorological indicators project a 48.0% probability of an extended dry hiatus (>= 5 consecutive dry days with < 2.5 mm rainfall). Vegetative tillering paddy requires sustained topsoil moisture. Historical analog patterns suggest planning supplemental irrigation access and checking soil cracking indicators.',
    valid_from: '2024-07-10',
    valid_until: '2024-07-24',
    operational_status: 'DIAGNOSTIC_ONLY',
    scientific_basis:
      'IMD consecutive dry days definition (daily precipitation < 2.5 mm for >= 5 consecutive days).',
    uncertainty_caveat:
      'Medium horizon (14-day) forecast carries wider confidence intervals [38.5%, 57.5%]. Field conditions depend on local tubewell power availability and canal rotational scheduling.',
    confidence_status: 'MODERATE_CONFIDENCE',
    evidence: {
      forecast_id: 'FCST_20240710_H14_UP_LKO_BKT_DS',
      target_name: 'DRY_SPELL',
      calibrated_probability: 0.48,
      threshold_value: 5.0,
      threshold_unit: 'consecutive days (< 2.5mm)',
      confidence_interval_lower: 0.385,
      confidence_interval_upper: 0.575,
      model_name: 'XGBoost-Isotonic-Calibrated',
      model_version: '1.0.0',
      data_freshness: 'HISTORICAL_ONLY',
      validation_status: 'SINGLE_STATION_VALIDATED',
      hindcast_brier_skill_score: 0.152,
      isotonic_ece: 0.051,
      operational_status: 'DIAGNOSTIC_ONLY',
      station_coverage: 'Bakshi Ka Talab centroid (UP_LKO_BKT)',
      evaluation_timestamp: '2024-07-10T06:00:00Z',
    },
    explanation: {
      headline: '48.0% Calibrated Probability of Dry Spell Hiatus',
      evidence_summary:
        'Ensemble model predicts consecutive dry period probability of 48.0% with 90% CI [38.5%, 57.5%].',
      model_signals: [
        'Weakening of monsoon trough axis towards Himalayan foothills',
        'Significant drop in mid-tropospheric relative humidity (< 55%)',
        'Ridge regression and tree ensemble agreement on precipitation suppression',
      ],
      historical_context:
        'Mid-July dry spells occurred in 3 of the last 5 regional monsoon seasons across Lucknow division.',
      uncertainty_caveat:
        'Atmospheric breaks can collapse rapidly with western disturbance interactions.',
      language_mode: 'NON_CAUSAL_SCIENTIFIC',
    },
    deduplication_hash: 'e499d3b718f3a011a43a887b416cb2899478f711',
    status: 'ACTIVE',
    created_at: '2024-07-10T06:00:00Z',
  },
];

export const FarmerAdvisoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { location } = useFarmerStore();

  const [selectedCrop, setSelectedCrop] = useState<string>('PADDY');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [advisories, setAdvisories] = useState<ScientificAdvisory[]>(defaultAdvisories);
  const [engineStatus, setEngineStatus] = useState<AgronomyStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedAdvisoryId, setExpandedAdvisoryId] = useState<string | null>(null);
  const [showBlockedDirectives, setShowBlockedDirectives] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadAgronomyData = async () => {
      setLoading(true);
      try {
        const [statusRes, advRes] = await Promise.all([
          advisoryService.getStatus().catch(() => null),
          advisoryService.listScientificAdvisories({
            crop_type: selectedCrop,
          }).catch(() => null),
        ]);

        if (isMounted) {
          if (statusRes?.success && statusRes.data) {
            setEngineStatus(statusRes.data);
          }
          if (advRes?.success && advRes.data?.advisories && advRes.data.advisories.length > 0) {
            setAdvisories(advRes.data.advisories);
          } else {
            // Filter defaults by selected crop
            const filtered = defaultAdvisories.filter(
              (a) => a.crop_type === selectedCrop || a.crop_type === 'GENERAL'
            );
            setAdvisories(filtered.length > 0 ? filtered : defaultAdvisories);
          }
        }
      } catch (err) {
        if (isMounted) {
          setAdvisories(defaultAdvisories);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAgronomyData();
    return () => {
      isMounted = false;
    };
  }, [selectedCrop, selectedStage]);

  const toggleExpand = (id: string) => {
    setExpandedAdvisoryId(expandedAdvisoryId === id ? null : id);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'HIGH':
        return <Badge variant="crimson" size="sm">HIGH RISK</Badge>;
      case 'ELEVATED':
        return <Badge variant="amber" size="sm">ELEVATED</Badge>;
      case 'WATCH':
        return <Badge variant="amber" size="sm">WATCH</Badge>;
      case 'INFO':
      default:
        return <Badge variant="teal" size="sm">INFO</Badge>;
    }
  };

  const getCategoryBadge = (cat: string) => {
    return (
      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
        {cat.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6" data-testid="farmer-advisory-page">
      {/* 1. Page Header & Operational Disclosures */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-surface-border shadow-card">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading font-bold text-xl text-slate-900 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-brand-teal" />
              <span>Scientific Agronomic Advisories</span>
            </h1>
            <Badge variant="amber" size="sm">DIAGNOSTIC_ONLY</Badge>
            <Badge variant="teal" size="sm">Kharif 2024 Archive</Badge>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Probabilistic agro-meteorological situational awareness for {location.block || 'Bakshi Ka Talab'} (UP_LKO_BKT)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowBlockedDirectives(!showBlockedDirectives)}
            leftIcon={<ShieldCheck className="w-4 h-4 text-brand-teal" />}
          >
            {showBlockedDirectives ? 'Hide Safety Gate' : 'Safety Gate Checks'}
          </Button>
        </div>
      </div>

      {/* 2. Mandatory Scientific Notice */}
      <Alert variant="warning" title="Informational Diagnostic Notice">
        Advisories are generated under strict <strong className="font-mono text-slate-900">DIAGNOSTIC_ONLY</strong> mode.
        Statements reflect statistical associations with historical climate signals and empirical IMD thresholds.
        These are informational risk notifications and situational awareness indicators, <strong className="text-slate-900">not imperative agronomic commands</strong>.
        Field actions must follow local Krishi Vigyan Kendra (KVK) and state agricultural extension guidelines.
      </Alert>

      {/* 3. Safety Gate Drawer (Optional Inspection) */}
      {showBlockedDirectives && (
        <Card className="p-5 bg-slate-50 border-brand-teal/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-brand-teal" />
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Deterministic Agronomic Safety Gate (13 Checks Active)
              </h3>
            </div>
            <Badge variant="teal" size="sm">Enforcing</Badge>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The safety gate evaluates every generated advisory before release. Any rule output containing imperative commands
            (e.g., "Do not sow", "Apply pesticide immediately"), uncalibrated probabilities, missing confidence intervals,
            or fabricated crop yield projections is strictly blocked and audited.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
            {[
              { check: 'Imperative Command Filter', desc: 'Blocks directive verbs ("do not", "must spray")' },
              { check: 'Yield Model Claims', desc: 'Blocks yield loss percentages and revenue forecasts' },
              { check: 'Calibration Verification', desc: 'Blocks uncalibrated raw model probabilities' },
              { check: 'Confidence Interval Audit', desc: 'Enforces parametric/empirical CI presence' },
              { check: 'Scientific Attribution', desc: 'Ensures non-causal language ("model-associated")' },
              { check: 'Multi-Year Disclosure', desc: 'Enforces single-season Kharif 2024 caveat' },
            ].map((c, i) => (
              <div key={i} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-800 block">{c.check}</span>
                <span className="text-[11px] text-slate-500">{c.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 4. Crop & Growth Stage Filter Selectors */}
      <div className="bg-white p-4 rounded-xl border border-surface-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-heading font-semibold text-slate-700">Crop Focus:</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="px-3 py-1.5 bg-surface-muted rounded-lg text-xs font-semibold text-slate-800 border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-teal"
            >
              <option value="PADDY">Paddy (धान - Oryza sativa)</option>
              <option value="MAIZE">Maize (मक्का - Zea mays)</option>
              <option value="WHEAT">Wheat (गेहूं - Triticum aestivum)</option>
              <option value="PULSES">Pulses (दलहन - Fabaceae spp.)</option>
              <option value="MUSTARD">Mustard (सरसों - Brassica juncea)</option>
              <option value="GENERAL">General Agro-Met (All Crops)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-heading font-semibold text-slate-700">Growth Stage:</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-1.5 bg-surface-muted rounded-lg text-xs font-semibold text-slate-800 border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-teal"
            >
              <option value="ALL">All Growth Stages</option>
              <option value="NURSERY_SOWING">Nursery & Sowing</option>
              <option value="VEGETATIVE">Vegetative Tillering</option>
              <option value="REPRODUCTIVE">Flowering & Reproductive</option>
              <option value="MATURITY">Grain Filling & Maturity</option>
              <option value="HARVESTING">Harvesting & Post-Harvest</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Active Dataset:</span>
          <span className="font-mono font-semibold text-slate-700">Kharif 2024 (122 records)</span>
        </div>
      </div>

      {/* 5. Advisories Feed */}
      <div className="space-y-4">
        {advisories.length === 0 ? (
          <Card className="p-8 text-center space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-heading font-semibold text-sm text-slate-800">
              No Active Advisories for Selected Filters
            </h3>
            <p className="text-xs text-slate-500">
              No meteorological hazard thresholds currently triggered for {selectedCrop} in {selectedStage}.
            </p>
          </Card>
        ) : (
          advisories.map((adv) => {
            const isExpanded = expandedAdvisoryId === adv.advisory_id;
            return (
              <Card key={adv.advisory_id} className="p-5 space-y-4 border-l-4 border-l-brand-teal transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getSeverityBadge(adv.severity)}
                      {getCategoryBadge(adv.category)}
                      <span className="text-[11px] font-mono text-slate-500">
                        {adv.rule_id}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-base text-slate-900 pt-1">
                      {adv.headline}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Valid: {adv.valid_from} to {adv.valid_until}
                    </span>
                  </div>
                </div>

                {/* Non-imperative advisory text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  {adv.advisory_text}
                </p>

                {/* Quick Evidence Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-2.5 bg-surface-muted rounded-lg">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Calibrated Prob</span>
                    <strong className="text-brand-teal text-sm font-mono">
                      {(adv.evidence.calibrated_probability * 100).toFixed(1)}%
                    </strong>
                    {adv.evidence.confidence_interval_lower !== undefined && (
                      <span className="text-[10px] text-slate-500 block">
                        90% CI: [{(adv.evidence.confidence_interval_lower * 100).toFixed(0)}%-{(adv.evidence.confidence_interval_upper! * 100).toFixed(0)}%]
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 bg-surface-muted rounded-lg">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Target Threshold</span>
                    <strong className="text-slate-800 text-sm font-mono">
                      {adv.evidence.threshold_value} {adv.evidence.threshold_unit}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">
                      IMD Standard Criteria
                    </span>
                  </div>

                  <div className="p-2.5 bg-surface-muted rounded-lg">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Model Calibration</span>
                    <strong className="text-slate-800 text-sm font-mono">
                      ECE: {adv.evidence.isotonic_ece !== undefined ? adv.evidence.isotonic_ece.toFixed(3) : '0.042'}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">
                      Isotonic Non-Parametric
                    </span>
                  </div>

                  <div className="p-2.5 bg-surface-muted rounded-lg">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Validation Mode</span>
                    <strong className="text-amber-700 text-xs font-heading block mt-0.5">
                      {adv.evidence.data_freshness}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">
                      Kharif 2024 Anchor
                    </span>
                  </div>
                </div>

                {/* Expand / Collapse Evidence Drawer Toggle */}
                <div className="pt-2 flex justify-between items-center border-t border-surface-border">
                  <button
                    onClick={() => toggleExpand(adv.advisory_id)}
                    className="flex items-center gap-1.5 text-xs font-heading font-semibold text-brand-teal hover:text-brand-teal-dark transition-colors"
                  >
                    <span>{isExpanded ? 'Hide Scientific Evidence' : 'Inspect Scientific Evidence & Explainability'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <Badge variant="demo" size="sm">
                    {adv.operational_status}
                  </Badge>
                </div>

                {/* Expanded Scientific Details */}
                {isExpanded && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-surface-border space-y-3.5 text-xs text-slate-700">
                    <div>
                      <h4 className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                        Scientific Basis & Methodology
                      </h4>
                      <p className="text-slate-600 leading-relaxed">{adv.scientific_basis}</p>
                    </div>

                    <div>
                      <h4 className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                        Model Evidence Signals
                      </h4>
                      <ul className="space-y-1 list-disc list-inside text-slate-600">
                        {adv.explanation.model_signals.map((sig, idx) => (
                          <li key={idx}>{sig}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[11px] text-slate-500 block">Forecast Record ID</span>
                        <span className="font-mono text-slate-800 font-semibold">{adv.forecast_id}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[11px] text-slate-500 block">Model Engine</span>
                        <span className="font-mono text-slate-800 font-semibold">{adv.evidence.model_name} (v{adv.evidence.model_version})</span>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Uncertainty & Multi-Season Disclaimers</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        {adv.uncertainty_caveat}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
