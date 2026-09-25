import React, { useState, useEffect, useRef } from 'react';
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
  Volume2,
  VolumeX,
  Play,
  Pause,
  Languages,
  BookOpen,
  Radio,
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
import {
  ScientificAdvisory,
  LanguageCode,
  LocalizedAdvisory,
  TerminologyCatalogItem,
  VoiceStatus,
} from '@shared/types';

// Phase 5A / 5C Default Scientific Advisories (conforming to Diagnostic-Only protocol)
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
      horizon_days: 7,
      probability: 0.584,
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
    headline: 'Extended Dry Spell Risk During Critical Paddy Vegetative Phase',
    advisory_text:
      'Operational models identify an elevated probability (48.0%) of experiencing >= 5 consecutive dry days (< 1.0 mm/day) within the 14-day horizon. Paddy in tillering and vegetative elongation phases requires sustained root-zone saturation. Recommended diagnostic observation: Monitor soil moisture tension in unbunded plots.',
    valid_from: '2024-07-10',
    valid_until: '2024-07-24',
    operational_status: 'DIAGNOSTIC_ONLY',
    scientific_basis:
      'IMD dry spell criteria (>=5 consecutive days with daily rainfall < 1.0 mm) coupled with Kharif 2024 daily rainfall records.',
    uncertainty_caveat:
      'Extended horizon (14 days) displays increased probabilistic variance. Verified on single station (UP_LKO_BKT); regional extrapolation uncertified.',
    confidence_status: 'MODERATE_CONFIDENCE',
    evidence: {
      forecast_id: 'FCST_20240710_H14_UP_LKO_BKT_DS',
      target_name: 'DRY_SPELL',
      calibrated_probability: 0.48,
      threshold_value: 5.0,
      threshold_unit: 'consecutive days < 1mm',
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
      horizon_days: 14,
      probability: 0.48,
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

  // Phase 5C State: Language, Localization, Voice, and Acknowledgement
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('EN');
  const [localizedMap, setLocalizedMap] = useState<Record<string, LocalizedAdvisory>>({});
  const [readAdvisories, setReadAdvisories] = useState<Set<string>>(new Set());
  const [showTerminologyModal, setShowTerminologyModal] = useState<boolean>(false);
  const [terminologyList, setTerminologyList] = useState<TerminologyCatalogItem[]>([]);
  
  // Voice Audio Playback State
  const [playingAdvisoryId, setPlayingAdvisoryId] = useState<string | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadAgronomyData = async () => {
      setLoading(true);
      try {
        const [statusRes, advRes, termRes] = await Promise.all([
          advisoryService.getStatus().catch(() => null),
          advisoryService.listScientificAdvisories({
            crop_type: selectedCrop,
          }).catch(() => null),
          advisoryService.getTerminology().catch(() => null),
        ]);

        if (isMounted) {
          if (statusRes?.success && statusRes.data) {
            setEngineStatus(statusRes.data);
          }
          if (termRes?.success && termRes.data?.terms) {
            setTerminologyList(termRes.data.terms);
          }
          if (advRes?.success && advRes.data?.advisories && advRes.data.advisories.length > 0) {
            setAdvisories(advRes.data.advisories);
          } else {
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

  // Load localization when language switches to Hindi
  useEffect(() => {
    if (selectedLanguage === 'HI') {
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
            // Fallback handled in rendering
          }
        }
      });
    }
  }, [selectedLanguage, advisories]);

  const toggleExpand = (id: string) => {
    setExpandedAdvisoryId(expandedAdvisoryId === id ? null : id);
  };

  const handleMarkAsRead = async (advId: string) => {
    try {
      await advisoryService.markAdvisoryAsRead(advId, selectedLanguage);
    } catch (e) {
      // Offline fallback
    }
    setReadAdvisories((prev) => new Set(prev).add(advId));
  };

  const handleToggleVoice = async (adv: ScientificAdvisory) => {
    // If already playing this advisory, stop it
    if (playingAdvisoryId === adv.advisory_id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingAdvisoryId(null);
      return;
    }

    setAudioLoadingId(adv.advisory_id);

    try {
      const res = await advisoryService.synthesizeVoice(adv.advisory_id, {
        language: selectedLanguage,
        speech_rate: speechRate,
        text: selectedLanguage === 'HI' && localizedMap[`${adv.advisory_id}_HI`]
          ? `${localizedMap[`${adv.advisory_id}_HI`].title}. ${localizedMap[`${adv.advisory_id}_HI`].summary}`
          : `${adv.headline}. ${adv.advisory_text}`,
      });

      if (res.success && res.data) {
        const voiceData = res.data;
        setPlayingAdvisoryId(adv.advisory_id);

        if (voiceData.audio_content_base64) {
          const audio = new Audio(voiceData.audio_content_base64);
          audioPlayerRef.current = audio;
          audio.playbackRate = speechRate;
          audio.onended = () => setPlayingAdvisoryId(null);
          audio.onerror = () => setPlayingAdvisoryId(null);
          audio.play().catch(() => {
            fallbackBrowserSpeech(voiceData.transcript);
          });
        } else {
          fallbackBrowserSpeech(voiceData.transcript);
        }
      } else {
        fallbackBrowserSpeech(adv.advisory_text);
      }
    } catch (e) {
      fallbackBrowserSpeech(adv.advisory_text);
    } finally {
      setAudioLoadingId(null);
    }
  };

  const fallbackBrowserSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'HI' ? 'hi-IN' : 'en-IN';
      utterance.rate = speechRate;
      utterance.onend = () => setPlayingAdvisoryId(null);
      utterance.onerror = () => setPlayingAdvisoryId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingAdvisoryId(null), 3000);
    }
  };

  const getSeverityBadge = (sev: string) => {
    const label = selectedLanguage === 'HI'
      ? sev === 'HIGH' ? 'उच्च जोखिम' : sev === 'ELEVATED' ? 'सतर्कता' : sev === 'WATCH' ? 'निगरानी' : 'सूचना'
      : sev;
    switch (sev) {
      case 'HIGH':
        return <Badge variant="crimson" size="sm">{label}</Badge>;
      case 'ELEVATED':
        return <Badge variant="amber" size="sm">{label}</Badge>;
      case 'WATCH':
        return <Badge variant="amber" size="sm">{label}</Badge>;
      case 'INFO':
      default:
        return <Badge variant="teal" size="sm">{label}</Badge>;
    }
  };

  const getCategoryBadge = (cat: string) => {
    const label = selectedLanguage === 'HI'
      ? cat === 'WEATHER_RISK' ? 'मौसम जोखिम' : cat === 'WATER_STRESS' ? 'जल तनाव' : cat
      : cat.replace('_', ' ');
    return (
      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6" data-testid="farmer-advisory-page">
      {/* 1. Page Header & Language Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-surface-border shadow-card">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading font-bold text-xl text-slate-900 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-brand-teal" />
              <span>
                {selectedLanguage === 'HI' ? 'कृषि-मौसम सलाह एवं निगरानी' : 'Scientific Agronomic Advisories'}
              </span>
            </h1>
            <Badge variant="amber" size="sm">DIAGNOSTIC_ONLY</Badge>
            <Badge variant="teal" size="sm">
              {selectedLanguage === 'HI' ? 'खरीफ 2024 अभिलेख' : 'Kharif 2024 Archive'}
            </Badge>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {selectedLanguage === 'HI'
              ? `बख्शी का तालाब (UP_LKO_BKT) के लिए वैज्ञानिक कृषि-मौसम स्थिति जागरूकता`
              : `Probabilistic agro-meteorological situational awareness for ${location.block || 'Bakshi Ka Talab'} (UP_LKO_BKT)`}
          </p>
        </div>

        {/* Language Selection & Utility Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Controlled Bilingual Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setSelectedLanguage('EN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${
                selectedLanguage === 'EN'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLanguage('HI')}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${
                selectedLanguage === 'HI'
                  ? 'bg-brand-teal text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिन्दी (Hindi)
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowTerminologyModal(!showTerminologyModal)}
            leftIcon={<BookOpen className="w-4 h-4 text-brand-teal" />}
          >
            {selectedLanguage === 'HI' ? 'शब्दावली' : 'Terminology'}
          </Button>

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

      {/* 2. Mandatory Scientific Notices (Bilingual) */}
      <Alert variant="warning" title={selectedLanguage === 'HI' ? 'सूचनात्मक नैदानिक सूचना' : 'Informational Diagnostic Notice'}>
        {selectedLanguage === 'HI' ? (
          <>
            सलाहें पूर्णतः <strong className="font-mono text-slate-900">DIAGNOSTIC_ONLY (केवल नैदानिक)</strong> मोड के अंतर्गत तैयार की गई हैं।
            ये ऐतिहासिक जलवायु संकेतों और आईएमडी के स्थापित मानकों पर आधारित हैं।
            यह केवल एक सूचनात्मक जोखिम सूचक है, <strong className="text-slate-900">कोई अनिवार्य कृषि आदेश या छिड़काव निर्देश नहीं</strong>।
            कृषि कार्यों के लिए सदैव स्थानीय कृषि विज्ञान केंद्र (KVK) अथवा राजकीय प्रसार अधिकारियों के दिशानिर्देशों का पालन करें।
          </>
        ) : (
          <>
            Advisories are generated under strict <strong className="font-mono text-slate-900">DIAGNOSTIC_ONLY</strong> mode.
            Statements reflect statistical associations with historical climate signals and empirical IMD thresholds.
            These are informational risk notifications and situational awareness indicators, <strong className="text-slate-900">not imperative agronomic commands</strong>.
            Field actions must follow local Krishi Vigyan Kendra (KVK) and state agricultural extension guidelines.
          </>
        )}
      </Alert>

      {/* 3. Terminology Explorer Modal / Drawer */}
      {showTerminologyModal && (
        <Card className="p-5 bg-teal-50/50 border-brand-teal/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-brand-teal" />
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Controlled Agro-Meteorological Terminology (Version 1.0.0)
              </h3>
            </div>
            <Badge variant="teal" size="sm">Immutable Glossary</Badge>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            To prevent mistranslation and semantic drift, all meteorological hazards and advisory terms are mapped through an immutable, versioned bilingual vocabulary. Dynamic machine translation is strictly blocked.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 max-h-60 overflow-y-auto">
            {terminologyList.map((t, idx) => (
              <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                <span className="font-mono text-[10px] text-slate-400 block">{t.term_key}</span>
                <span className="font-semibold text-slate-800 block">{t.en}</span>
                <span className="text-brand-teal font-medium block">{t.hi}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 4. Safety Gate Drawer */}
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

      {/* 5. Crop & Growth Stage Filter Selectors */}
      <div className="bg-white p-4 rounded-xl border border-surface-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-heading font-semibold text-slate-700">
              {selectedLanguage === 'HI' ? 'फसल चयन:' : 'Crop Focus:'}
            </label>
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
            <label className="text-xs font-heading font-semibold text-slate-700">
              {selectedLanguage === 'HI' ? 'वृद्धि अवस्था:' : 'Growth Stage:'}
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-1.5 bg-surface-muted rounded-lg text-xs font-semibold text-slate-800 border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-teal"
            >
              <option value="ALL">{selectedLanguage === 'HI' ? 'सभी अवस्थाएं' : 'All Growth Stages'}</option>
              <option value="NURSERY_SOWING">{selectedLanguage === 'HI' ? 'नर्सरी व बोआई' : 'Nursery & Sowing'}</option>
              <option value="VEGETATIVE">{selectedLanguage === 'HI' ? 'वानस्पतिक वृद्धि' : 'Vegetative Tillering'}</option>
              <option value="REPRODUCTIVE">{selectedLanguage === 'HI' ? 'फूल व प्रजनन' : 'Flowering & Reproductive'}</option>
              <option value="MATURITY">{selectedLanguage === 'HI' ? 'दाना भराव व परिपक्वता' : 'Grain Filling & Maturity'}</option>
              <option value="HARVESTING">{selectedLanguage === 'HI' ? 'कटाई व कटाई-उपरांत' : 'Harvesting & Post-Harvest'}</option>
            </select>
          </div>
        </div>

        {/* Speech Speed Setting */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">{selectedLanguage === 'HI' ? 'ध्वनि गति:' : 'Voice Speed:'}</span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {[0.8, 1.0, 1.2].map((rate) => (
              <button
                key={rate}
                onClick={() => setSpeechRate(rate)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                  speechRate === rate ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Advisories Feed */}
      <div className="space-y-4">
        {advisories.length === 0 ? (
          <Card className="p-8 text-center space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-heading font-semibold text-sm text-slate-800">
              {selectedLanguage === 'HI' ? 'चयनित फिल्टर के लिए कोई सक्रिय सलाह नहीं है' : 'No Active Advisories for Selected Filters'}
            </h3>
            <p className="text-xs text-slate-500">
              No meteorological hazard thresholds currently triggered for {selectedCrop} in {selectedStage}.
            </p>
          </Card>
        ) : (
          advisories.map((adv) => {
            const isExpanded = expandedAdvisoryId === adv.advisory_id;
            const isRead = readAdvisories.has(adv.advisory_id);
            const isPlaying = playingAdvisoryId === adv.advisory_id;
            const isLoadingAudio = audioLoadingId === adv.advisory_id;
            
            // Check for localized Hindi version
            const locKey = `${adv.advisory_id}_HI`;
            const localized = selectedLanguage === 'HI' ? localizedMap[locKey] : null;

            const displayTitle = localized ? localized.title : adv.headline;
            const displaySummary = localized ? localized.summary : adv.advisory_text;
            const displayRisk = localized ? localized.risk_indicator : (adv.explanation?.headline || adv.rule_name);
            const displayWhatItMeans = localized ? localized.what_it_means : null;

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
                      {isRead && (
                        <Badge variant="teal" size="sm" className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{selectedLanguage === 'HI' ? 'स्वीकृत' : 'Acknowledged'}</span>
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-base text-slate-900 pt-1">
                      {displayTitle}
                    </h3>
                  </div>

                  {/* Actions & Timings */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-2">
                      <Clock className="w-3.5 h-3.5" />
                      Valid: {adv.valid_from} to {adv.valid_until}
                    </span>

                    {/* Voice Accessibility Button */}
                    <Button
                      variant={isPlaying ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleToggleVoice(adv)}
                      leftIcon={isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-brand-teal" />}
                      className="text-xs"
                    >
                      {isLoadingAudio ? (
                        'Loading...'
                      ) : isPlaying ? (
                        selectedLanguage === 'HI' ? 'रोकें' : 'Stop'
                      ) : (
                        selectedLanguage === 'HI' ? 'सुनें' : 'Listen'
                      )}
                    </Button>

                    {/* Acknowledge / Read Receipt Button */}
                    {!isRead && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleMarkAsRead(adv.advisory_id)}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />}
                        className="text-xs"
                      >
                        {selectedLanguage === 'HI' ? 'पढ़ा हुआ चिह्नित करें' : 'Mark Read'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Voice Playing Status Banner */}
                {isPlaying && (
                  <div className="p-2.5 bg-brand-teal/10 border border-brand-teal/30 rounded-lg flex items-center justify-between text-xs text-brand-teal-dark animate-pulse">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-brand-teal" />
                      <span>
                        {selectedLanguage === 'HI'
                          ? 'ध्वनि वाचन सक्रिय है (प्रोटोटाइप डेमो मोड - कोई टेलीकॉम डिस्पैच नहीं)'
                          : 'Voice readout active (Prototype demo mode - no telecom dispatch)'}
                      </span>
                    </div>
                    <Badge variant="teal" size="sm">DEMO_ONLY</Badge>
                  </div>
                )}

                {/* Primary Advisory Narrative */}
                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-2">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                    {displaySummary}
                  </p>
                  {displayWhatItMeans && (
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                      <strong className="text-slate-800 block mb-0.5">
                        {selectedLanguage === 'HI' ? 'इसका क्या प्रभाव है:' : 'What it means:'}
                      </strong>
                      <p>{displayWhatItMeans}</p>
                    </div>
                  )}
                </div>

                {/* Quick Evidence Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-2.5 bg-surface-muted rounded-lg">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                      {selectedLanguage === 'HI' ? 'अंशांकित संभावना' : 'Calibrated Prob'}
                    </span>
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
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                      {selectedLanguage === 'HI' ? 'मौसम मानक सीमा' : 'Target Threshold'}
                    </span>
                    <strong className="text-slate-800 text-sm font-mono">
                      {adv.evidence.threshold_value} {adv.evidence.threshold_unit}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">
                      IMD Standard Criteria
                    </span>
                  </div>

                  <div className="p-2.5 bg-surface-muted rounded-lg">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                      {selectedLanguage === 'HI' ? 'मॉडल अंशांकन' : 'Model Calibration'}
                    </span>
                    <strong className="text-slate-800 text-sm font-mono">
                      ECE: {adv.evidence.isotonic_ece !== undefined ? adv.evidence.isotonic_ece.toFixed(3) : '0.042'}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">
                      Isotonic Non-Parametric
                    </span>
                  </div>

                  <div className="p-2.5 bg-surface-muted rounded-lg">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                      {selectedLanguage === 'HI' ? 'सत्यापन आधार' : 'Validation Mode'}
                    </span>
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
                    <span>
                      {isExpanded
                        ? (selectedLanguage === 'HI' ? 'वैज्ञानिक साक्ष्य छिपाएं' : 'Hide Scientific Evidence')
                        : (selectedLanguage === 'HI' ? 'वैज्ञानिक साक्ष्य व व्याख्या देखें' : 'Inspect Scientific Evidence & Explainability')}
                    </span>
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
                        {selectedLanguage === 'HI' ? 'वैज्ञानिक पद्धति व आधार' : 'Scientific Basis & Methodology'}
                      </h4>
                      <p className="text-slate-600 leading-relaxed">{adv.scientific_basis}</p>
                    </div>

                    <div>
                      <h4 className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                        {selectedLanguage === 'HI' ? 'मौसम मॉडल संकेत' : 'Model Evidence Signals'}
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

                    {/* Dual Disclosures */}
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        <span>
                          {selectedLanguage === 'HI' ? 'अनिश्चितता व एकल-सत्र ऐतिहासिक सीमा' : 'Uncertainty & Multi-Season Disclaimers'}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        {selectedLanguage === 'HI'
                          ? 'ऐतिहासिक धरातलीय सीमा: बख्शी का तालाब (UP_LKO_BKT, खरीफ 2024 सत्र, 122 दैनिक रिकॉर्ड) के अवलोकनों के आधार पर मूल्यांकित। बहु-वर्षीय परिचालन सत्यापन अभी लंबित है।'
                          : adv.uncertainty_caveat}
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
