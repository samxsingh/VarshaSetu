import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Volume2,
  VolumeX,
  Languages,
  BookOpen,
  Radio,
} from 'lucide-react';
import { useFarmerStore } from '../../stores/useFarmerStore';
import {
  advisoryService,
  AgronomyStatusResponse,
} from '../../services/advisoryService';
import {
  ScientificAdvisory,
  LanguageCode,
  LocalizedAdvisory,
  TerminologyCatalogItem,
} from '@shared/types';
import { ScientificStatusBadge } from '../../components/farmer/ScientificStatusBadge';

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

      if (res?.success && res.data?.audio_url) {
        const audio = new Audio(res.data.audio_url);
        audio.playbackRate = speechRate;
        audio.onended = () => setPlayingAdvisoryId(null);
        audio.onerror = () => {
          fallbackSpeechSynthesis(adv);
        };
        audioPlayerRef.current = audio;
        await audio.play();
        setPlayingAdvisoryId(adv.advisory_id);
      } else {
        fallbackSpeechSynthesis(adv);
      }
    } catch (err) {
      fallbackSpeechSynthesis(adv);
    } finally {
      setAudioLoadingId(null);
    }
  };

  const fallbackSpeechSynthesis = (adv: ScientificAdvisory) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setPlayingAdvisoryId(adv.advisory_id);
      const text = selectedLanguage === 'HI' && localizedMap[`${adv.advisory_id}_HI`]
        ? `${localizedMap[`${adv.advisory_id}_HI`].title}. ${localizedMap[`${adv.advisory_id}_HI`].summary}`
        : `${adv.headline}. ${adv.advisory_text}`;

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
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#FEF2F2] border border-[#E53E3E] text-[#E53E3E]">{label}</span>;
      case 'ELEVATED':
      case 'WATCH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#FEF3C7] border border-[#D97706] text-[#B45309]">{label}</span>;
      case 'INFO':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#E8F4F6] border border-[#0E7490] text-[#155E75]">{label}</span>;
    }
  };

  const getCategoryBadge = (cat: string) => {
    const label = selectedLanguage === 'HI'
      ? cat === 'WEATHER_RISK' ? 'मौसम जोखिम' : cat === 'WATER_STRESS' ? 'जल तनाव' : cat
      : cat.replace('_', ' ');
    return (
      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#F3F6F7] text-[#486581] border border-[#102A43]/15">
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6" data-testid="farmer-advisory-page">
      {/* 1. Page Header & Language Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-heading font-black text-2xl text-[#102A43] flex items-center gap-2">
              <Sprout className="w-5 h-5 text-[#3F7D58]" />
              <span>
                {selectedLanguage === 'HI' ? 'कृषि-मौसम सलाह एवं निगरानी' : 'Scientific Agronomic Advisories'}
              </span>
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#FEF3C7] border border-[#D97706] text-[#B45309]">
              DIAGNOSTIC_ONLY
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#E8F4F6] border border-[#0E7490]/40 text-[#155E75]">
              {selectedLanguage === 'HI' ? 'खरीफ 2024 अभिलेख' : 'Kharif 2024 Archive'}
            </span>
          </div>
          <p className="text-xs text-[#486581] mt-1.5 font-sans">
            {selectedLanguage === 'HI'
              ? `बख्शी का तालाब (UP_LKO_BKT) के लिए वैज्ञानिक कृषि-मौसम स्थिति जागरूकता`
              : `Probabilistic agro-meteorological situational awareness for ${location.block || 'Bakshi Ka Talab'} (UP_LKO_BKT)`}
          </p>
        </div>

        {/* Language Selection & Utility Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Controlled Bilingual Switcher */}
          <div className="flex items-center bg-[#F3F6F7] p-1 rounded-xl border border-[#102A43]/20">
            <button
              onClick={() => setSelectedLanguage('EN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all ${
                selectedLanguage === 'EN'
                  ? 'bg-[#0E7490] text-white shadow-[1.5px_1.5px_0px_#102A43]'
                  : 'text-[#486581] hover:text-[#102A43]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLanguage('HI')}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all ${
                selectedLanguage === 'HI'
                  ? 'bg-[#0E7490] text-white shadow-[1.5px_1.5px_0px_#102A43]'
                  : 'text-[#486581] hover:text-[#102A43]'
              }`}
            >
              हिन्दी (Hindi)
            </button>
          </div>

          <button
            onClick={() => setShowTerminologyModal(!showTerminologyModal)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#102A43] text-xs font-heading font-bold text-[#102A43] shadow-[2px_2px_0px_#102A43] hover:bg-[#F3F6F7] transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0E7490]" />
            <span>{selectedLanguage === 'HI' ? 'शब्दावली' : 'Terminology'}</span>
          </button>

          <button
            onClick={() => setShowBlockedDirectives(!showBlockedDirectives)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#102A43] text-xs font-heading font-bold text-[#102A43] shadow-[2px_2px_0px_#102A43] hover:bg-[#F3F6F7] transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#3F7D58]" />
            <span>{showBlockedDirectives ? 'Hide Safety Gate' : 'Safety Gate Checks'}</span>
          </button>
        </div>
      </div>

      {/* 2. Mandatory Scientific Notices (Bilingual) */}
      <div className="p-4 sm:p-5 bg-[#FEF3C7] border-2 border-[#102A43] rounded-xl shadow-[3px_3px_0px_#102A43] text-xs text-[#7A4B00] space-y-1.5 font-sans leading-relaxed">
        <div className="font-heading font-black text-xs text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-[#D97706]" />
          <span>{selectedLanguage === 'HI' ? 'सूचनात्मक नैदानिक सूचना' : 'Informational Diagnostic Notice'}</span>
        </div>
        {selectedLanguage === 'HI' ? (
          <p>
            सलाहें पूर्णतः <strong className="font-mono text-[#102A43]">DIAGNOSTIC_ONLY (केवल नैदानिक)</strong> मोड के अंतर्गत तैयार की गई हैं।
            ये ऐतिहासिक जलवायु संकेतों और आईएमडी के स्थापित मानकों पर आधारित हैं।
            यह केवल एक सूचनात्मक जोखिम सूचक है, <strong className="text-[#102A43]">कोई अनिवार्य कृषि आदेश या छिड़काव निर्देश नहीं</strong>।
            कृषि कार्यों के लिए सदैव स्थानीय कृषि विज्ञान केंद्र (KVK) अथवा राजकीय प्रसार अधिकारियों के दिशानिर्देशों का पालन करें।
          </p>
        ) : (
          <p>
            Advisories are generated under strict <strong className="font-mono text-[#102A43]">DIAGNOSTIC_ONLY</strong> mode.
            Statements reflect statistical associations with historical climate signals and empirical IMD thresholds.
            These are informational risk notifications and situational awareness indicators, <strong className="text-[#102A43]">not imperative agronomic commands</strong>.
            Field actions must follow local Krishi Vigyan Kendra (KVK) and state agricultural extension guidelines.
          </p>
        )}
      </div>

      {/* 3. Terminology Explorer Modal / Drawer */}
      {showTerminologyModal && (
        <div className="p-5 bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-[#0E7490]" />
              <h3 className="font-heading font-bold text-sm text-[#102A43]">
                Controlled Agro-Meteorological Terminology (Version 1.0.0)
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E8F4F6] text-[#155E75]">
              Immutable Glossary
            </span>
          </div>
          <p className="text-xs text-[#486581] leading-relaxed">
            To prevent mistranslation and semantic drift, all meteorological hazards and advisory terms are mapped through an immutable, versioned bilingual vocabulary. Dynamic machine translation is strictly blocked.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 max-h-60 overflow-y-auto">
            {terminologyList.map((tItem, idx) => (
              <div key={idx} className="p-3 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15 text-xs space-y-1">
                <span className="font-mono text-[10px] text-[#829AB1] block">{tItem.term_key}</span>
                <span className="font-heading font-bold text-[#102A43] block">{tItem.en}</span>
                <span className="text-[#0E7490] font-medium block">{tItem.hi}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Safety Gate Drawer */}
      {showBlockedDirectives && (
        <div className="p-5 bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#0E7490]" />
              <h3 className="font-heading font-bold text-sm text-[#102A43]">
                Deterministic Agronomic Safety Gate (13 Checks Active)
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EBF5EE] text-[#3F7D58]">
              Enforcing
            </span>
          </div>
          <p className="text-xs text-[#486581] leading-relaxed">
            The safety gate evaluates every generated advisory before release. Any rule output containing imperative commands
            (e.g., "Do not sow", "Apply pesticide immediately"), uncalibrated probabilities, missing confidence intervals,
            or fabricated crop yield projections is strictly blocked and audited.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {[
              { check: 'Imperative Command Filter', desc: 'Blocks directive verbs ("do not", "must spray")' },
              { check: 'Yield Model Claims', desc: 'Blocks yield loss percentages and revenue forecasts' },
              { check: 'Calibration Verification', desc: 'Blocks uncalibrated raw model probabilities' },
              { check: 'Confidence Interval Audit', desc: 'Enforces parametric/empirical CI presence' },
              { check: 'Scientific Attribution', desc: 'Ensures non-causal language ("model-associated")' },
              { check: 'Multi-Year Disclosure', desc: 'Enforces single-season Kharif 2024 caveat' },
            ].map((c, i) => (
              <div key={i} className="p-3 bg-[#F3F6F7] rounded-xl border border-[#102A43]/15 text-xs">
                <span className="font-heading font-bold text-[#102A43] block">{c.check}</span>
                <span className="text-[11px] text-[#829AB1]">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Crop & Growth Stage Filter Selectors */}
      <div className="bg-white p-5 rounded-2xl border-2 border-[#102A43] shadow-[3px_3px_0px_#102A43] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-heading font-bold text-[#102A43]">
              {selectedLanguage === 'HI' ? 'फसल चयन:' : 'Crop Focus:'}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="px-3 py-1.5 bg-[#F3F6F7] rounded-xl text-xs font-semibold text-[#102A43] border border-[#102A43]/30 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
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
            <label className="text-xs font-heading font-bold text-[#102A43]">
              {selectedLanguage === 'HI' ? 'वृद्धि अवस्था:' : 'Growth Stage:'}
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-1.5 bg-[#F3F6F7] rounded-xl text-xs font-semibold text-[#102A43] border border-[#102A43]/30 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
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
          <span className="text-[#829AB1] font-medium">{selectedLanguage === 'HI' ? 'ध्वनि गति:' : 'Voice Speed:'}</span>
          <div className="flex bg-[#F3F6F7] p-0.5 rounded-lg border border-[#102A43]/20">
            {[0.8, 1.0, 1.2].map((rate) => (
              <button
                key={rate}
                onClick={() => setSpeechRate(rate)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                  speechRate === rate ? 'bg-white font-bold text-[#102A43] shadow-[1px_1px_0px_#102A43]' : 'text-[#829AB1]'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Advisories Feed */}
      <div className="space-y-5">
        {advisories.length === 0 ? (
          <div className="p-8 text-center space-y-2 bg-white rounded-2xl border-2 border-[#102A43]">
            <Info className="w-8 h-8 text-[#829AB1] mx-auto" />
            <h3 className="font-heading font-bold text-sm text-[#102A43]">
              {selectedLanguage === 'HI' ? 'चयनित फिल्टर के लिए कोई सक्रिय सलाह नहीं है' : 'No Active Advisories for Selected Filters'}
            </h3>
            <p className="text-xs text-[#829AB1]">
              No meteorological hazard thresholds currently triggered for {selectedCrop} in {selectedStage}.
            </p>
          </div>
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
            const displayWhatItMeans = localized ? localized.what_it_means : null;

            return (
              <div
                key={adv.advisory_id}
                className="bg-white rounded-2xl border-2 border-[#102A43] p-6 shadow-[4px_4px_0px_#102A43] space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getSeverityBadge(adv.severity)}
                      {getCategoryBadge(adv.category)}
                      <span className="text-[11px] font-mono text-[#829AB1]">
                        {adv.rule_id}
                      </span>
                      {isRead && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EBF5EE] border border-[#3F7D58] text-[#3F7D58] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{selectedLanguage === 'HI' ? 'स्वीकृत' : 'Acknowledged'}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-black text-lg text-[#102A43] pt-1">
                      {displayTitle}
                    </h3>
                  </div>

                  {/* Actions & Timings */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span className="text-[11px] text-[#829AB1] flex items-center gap-1 mr-2 font-mono">
                      <Clock className="w-3.5 h-3.5 text-[#0E7490]" />
                      Valid: {adv.valid_from} to {adv.valid_until}
                    </span>

                    {/* Voice Accessibility Button */}
                    <button
                      onClick={() => handleToggleVoice(adv)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-heading font-bold transition-all shadow-[1.5px_1.5px_0px_#102A43] ${
                        isPlaying
                          ? 'bg-[#0E7490] text-white border-[#102A43]'
                          : 'bg-[#F3F6F7] text-[#102A43] border-[#102A43]/30 hover:bg-[#E8F4F6]'
                      }`}
                    >
                      {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#0E7490]" />}
                      <span>
                        {isLoadingAudio ? (
                          selectedLanguage === 'HI' ? 'ऑडियो तैयार हो रहा है...' : 'Synthesizing...'
                        ) : isPlaying ? (
                          selectedLanguage === 'HI' ? 'रोकें' : 'Stop'
                        ) : (
                          selectedLanguage === 'HI' ? 'सुनें' : 'Listen'
                        )}
                      </span>
                    </button>

                    {/* Acknowledge / Read Receipt Button */}
                    {!isRead && (
                      <button
                        onClick={() => handleMarkAsRead(adv.advisory_id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#102A43]/30 bg-white text-[#102A43] text-xs font-heading font-bold shadow-[1.5px_1.5px_0px_#102A43] hover:bg-[#F3F6F7] transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3F7D58]" />
                        <span>{selectedLanguage === 'HI' ? 'पढ़ा हुआ चिह्नित करें' : 'Mark Read'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Voice Playing Status Banner */}
                {isPlaying && (
                  <div className="p-3 bg-[#E8F4F6] border border-[#0E7490] rounded-xl flex items-center justify-between text-xs text-[#155E75] animate-pulse">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#0E7490]" />
                      <span>
                        {selectedLanguage === 'HI'
                          ? 'ध्वनि वाचन सक्रिय है (प्रोटोटाइप डेमो मोड - कोई टेलीकॉम डिस्पैच नहीं)'
                          : 'Voice readout active (Prototype demo mode - no telecom dispatch)'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-[#155E75]">DEMO_ONLY</span>
                  </div>
                )}

                {/* Primary Advisory Narrative */}
                <div className="bg-[#F3F6F7] p-4 rounded-xl border border-[#102A43]/15 space-y-2">
                  <p className="text-xs sm:text-sm text-[#486581] leading-relaxed font-sans">
                    {displaySummary}
                  </p>
                  {displayWhatItMeans && (
                    <div className="pt-2 border-t border-[#102A43]/10 text-xs text-[#102A43]">
                      <strong className="block mb-0.5">
                        {selectedLanguage === 'HI' ? 'इसका क्या प्रभाव है:' : 'What it means:'}
                      </strong>
                      <p className="text-[#486581]">{displayWhatItMeans}</p>
                    </div>
                  )}
                </div>

                {/* Quick Evidence Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-3 bg-white rounded-xl border border-[#102A43]/15">
                    <span className="text-[10px] uppercase text-[#829AB1] block font-heading font-bold">
                      {selectedLanguage === 'HI' ? 'अंशांकित संभावना' : 'Calibrated Prob'}
                    </span>
                    <strong className="text-[#0E7490] text-base font-mono">
                      {(adv.evidence.calibrated_probability * 100).toFixed(1)}%
                    </strong>
                    {adv.evidence.confidence_interval_lower !== undefined && (
                      <span className="text-[10px] text-[#829AB1] block font-mono">
                        90% CI: [{(adv.evidence.confidence_interval_lower * 100).toFixed(0)}%-{(adv.evidence.confidence_interval_upper! * 100).toFixed(0)}%]
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#102A43]/15">
                    <span className="text-[10px] uppercase text-[#829AB1] block font-heading font-bold">
                      {selectedLanguage === 'HI' ? 'मौसम मानक सीमा' : 'Target Threshold'}
                    </span>
                    <strong className="text-[#102A43] text-base font-mono">
                      {adv.evidence.threshold_value} {adv.evidence.threshold_unit}
                    </strong>
                    <span className="text-[10px] text-[#829AB1] block">
                      IMD Standard Criteria
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#102A43]/15">
                    <span className="text-[10px] uppercase text-[#829AB1] block font-heading font-bold">
                      {selectedLanguage === 'HI' ? 'मॉडल अंशांकन' : 'Model Calibration'}
                    </span>
                    <strong className="text-[#102A43] text-base font-mono">
                      ECE: {adv.evidence.isotonic_ece !== undefined ? adv.evidence.isotonic_ece.toFixed(3) : '0.042'}
                    </strong>
                    <span className="text-[10px] text-[#829AB1] block">
                      Isotonic Non-Parametric
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#102A43]/15">
                    <span className="text-[10px] uppercase text-[#829AB1] block font-heading font-bold">
                      {selectedLanguage === 'HI' ? 'सत्यापन आधार' : 'Validation Mode'}
                    </span>
                    <strong className="text-[#B45309] text-xs font-mono block mt-0.5">
                      {adv.evidence.data_freshness}
                    </strong>
                    <span className="text-[10px] text-[#829AB1] block">
                      Kharif 2024 Anchor
                    </span>
                  </div>
                </div>

                {/* Expand / Collapse Evidence Drawer Toggle */}
                <div className="pt-2 flex justify-between items-center border-t-2 border-[#102A43]/10">
                  <button
                    onClick={() => toggleExpand(adv.advisory_id)}
                    className="flex items-center gap-1.5 text-xs font-heading font-bold text-[#0E7490] hover:text-[#155E75] transition-colors"
                  >
                    <span>
                      {isExpanded
                        ? (selectedLanguage === 'HI' ? 'वैज्ञानिक साक्ष्य छिपाएं' : 'Hide Scientific Evidence')
                        : (selectedLanguage === 'HI' ? 'वैज्ञानिक साक्ष्य व व्याख्या देखें' : 'Inspect Scientific Evidence & Explainability')}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FEF3C7] border border-[#D97706] text-[#B45309]">
                    {adv.operational_status}
                  </span>
                </div>

                {/* Expanded Scientific Details */}
                {isExpanded && (
                  <div className="mt-3 p-4 bg-[#FFFFFF] rounded-xl border-2 border-[#102A43] space-y-3.5 text-xs text-[#486581]">
                    <div>
                      <h4 className="font-heading font-black text-[#102A43] text-xs uppercase tracking-wider mb-1">
                        {selectedLanguage === 'HI' ? 'वैज्ञानिक पद्धति व आधार' : 'Scientific Basis & Methodology'}
                      </h4>
                      <p className="text-[#486581] leading-relaxed">{adv.scientific_basis}</p>
                    </div>

                    <div>
                      <h4 className="font-heading font-black text-[#102A43] text-xs uppercase tracking-wider mb-1">
                        {selectedLanguage === 'HI' ? 'मौसम मॉडल संकेत' : 'Model Evidence Signals'}
                      </h4>
                      <ul className="space-y-1 list-disc list-inside text-[#486581]">
                        {adv.explanation.model_signals.map((sig, idx) => (
                          <li key={idx}>{sig}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-white rounded-lg border border-[#102A43]/15">
                        <span className="text-[10px] text-[#829AB1] block font-mono">Forecast Record ID</span>
                        <span className="font-mono text-[#102A43] font-bold">{adv.forecast_id}</span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-[#102A43]/15">
                        <span className="text-[10px] text-[#829AB1] block font-mono">Model Engine</span>
                        <span className="font-mono text-[#102A43] font-bold">{adv.evidence.model_name} (v{adv.evidence.model_version})</span>
                      </div>
                    </div>

                    {/* Dual Disclosures */}
                    <div className="p-3.5 bg-[#FEF3C7] rounded-xl border border-[#D97706] text-[#7A4B00] space-y-1">
                      <div className="flex items-center gap-1.5 font-heading font-bold text-xs text-[#102A43]">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>
                          {selectedLanguage === 'HI' ? 'अनिश्चितता व एकल-सत्र ऐतिहासिक सीमा' : 'Uncertainty & Multi-Season Disclaimers'}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-[#7A4B00]">
                        {selectedLanguage === 'HI'
                          ? 'ऐतिहासिक धरातलीय सीमा: बख्शी का तालाब (UP_LKO_BKT, खरीफ 2024 सत्र, 122 दैनिक रिकॉर्ड) के अवलोकनों के आधार पर मूल्यांकित। बहु-वर्षीय परिचालन सत्यापन अभी लंबित है।'
                          : adv.uncertainty_caveat}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
