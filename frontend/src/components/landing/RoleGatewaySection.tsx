import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ShieldCheck,
  Landmark,
  LineChart,
  ArrowRight,
  Globe2,
  Waves,
  MapPin,
  Calendar,
  Sliders,
  Languages,
  FileCheck2,
  ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const RoleGatewaySection: React.FC = () => {
  const { setRole } = useAppStore();

  const roleCards = [
    {
      id: '01',
      role: 'FARMER',
      title: 'Farmer',
      hindiTitle: 'किसान',
      subtitle: 'Hyperlocal Agro-Advisories',
      description:
        'Panchayat-level 7–30 day rain risk, crop phenology alerts in Hindi & English, and What-If sowing delay simulators.',
      image: '/images/role-farmer.jpg',
      imageAlt: 'Indian farmer reviewing hyperlocal monsoon advisories on tablet',
      imageStyle: 'h-44 object-cover object-center',
      to: '/farmer/dashboard',
      cta: 'Open Farmer Portal',
      accentColor: 'text-[#3F7D58]',
      accentBg: 'bg-[#E4F0E8]',
      accentBorder: 'border-[#3F7D58]/40',
      badge: 'FARMER PERSPECTIVE',
      icon: <Sprout className="w-4 h-4 text-[#3F7D58]" />,
    },
    {
      id: '02',
      role: 'OFFICER',
      title: 'Field Officer',
      hindiTitle: 'कृषि अधिकारी',
      subtitle: 'Block Monitoring & Bulletins',
      description:
        'Spatial GIS choropleth heatmaps across Lucknow blocks, dry-spell hiatus alerts, and verified advisory bulletin broadcasts.',
      image: '/images/role-officer.jpg',
      imageAlt: 'Agricultural extension officers inspecting field crop status',
      imageStyle: 'h-44 object-cover object-top',
      to: '/officer',
      cta: 'Open Officer Center',
      accentColor: 'text-[#0E7490]',
      accentBg: 'bg-[#E8F4F6]',
      accentBorder: 'border-[#0E7490]/40',
      badge: 'FIELD PERSPECTIVE',
      icon: <ShieldCheck className="w-4 h-4 text-[#0E7490]" />,
    },
    {
      id: '03',
      role: 'GOVERNMENT',
      title: 'Government',
      hindiTitle: 'राज्य योजना',
      subtitle: 'Statewide Risk & Coverage',
      description:
        'District rainfall departure overviews, multi-block aggregate monitoring, and state agricultural planning command oversight.',
      image: '/images/role-government.jpg',
      imageAlt: 'Government agricultural command and monitoring control room',
      imageStyle: 'h-44 object-cover object-center',
      to: '/government/command-center',
      cta: 'Open Government Center',
      accentColor: 'text-[#D97706]',
      accentBg: 'bg-[#FEF3C7]',
      accentBorder: 'border-[#D97706]/40',
      badge: 'PLANNER PERSPECTIVE',
      icon: <Landmark className="w-4 h-4 text-[#D97706]" />,
    },
    {
      id: '04',
      role: 'ANALYST',
      title: 'Climate Analyst',
      hindiTitle: 'मौसम विश्लेषक',
      subtitle: 'Forecast Lab & ML Models',
      description:
        'Gradient-boosted ensembles, Platt & Isotonic calibration curves, SHAP explainability, and multi-year hindcast validation.',
      image: '/images/role-analyst.jpg',
      imageAlt: 'Climate data scientist analyzing meteorological downscaling models',
      imageStyle: 'h-44 object-cover object-left-top',
      to: '/analyst',
      cta: 'Open Analyst Lab',
      accentColor: 'text-[#0891B2]',
      accentBg: 'bg-[#E8F4F6]',
      accentBorder: 'border-[#0891B2]/40',
      badge: 'RESEARCH PERSPECTIVE',
      icon: <LineChart className="w-4 h-4 text-[#0891B2]" />,
    },
  ];

  const capabilities = [
    {
      num: '01',
      icon: <Globe2 className="w-4 h-4 text-[#0E7490]" />,
      title: 'Climate Intelligence',
      desc: 'Planetary teleconnections: ENSO, IOD & MJO signals',
    },
    {
      num: '02',
      icon: <Waves className="w-4 h-4 text-[#2563EB]" />,
      title: 'Atmospheric Analysis',
      desc: 'Moisture convergence & boundary layer vorticity',
    },
    {
      num: '03',
      icon: <MapPin className="w-4 h-4 text-[#D97706]" />,
      title: 'Block Downscaling',
      desc: 'Spatial downscaling anchored to block resolution',
    },
    {
      num: '04',
      icon: <Calendar className="w-4 h-4 text-[#3F7D58]" />,
      title: 'Agronomic Advisory',
      desc: 'Crop-sensitive phenological indicators & timing',
    },
    {
      num: '05',
      icon: <Sliders className="w-4 h-4 text-[#0E7490]" />,
      title: 'Scenario Simulator',
      desc: 'Deterministic what-if sensitivity simulations',
    },
    {
      num: '06',
      icon: <Languages className="w-4 h-4 text-[#0891B2]" />,
      title: 'Multilingual Access',
      desc: 'Controlled bilingual English & Hindi delivery',
    },
    {
      num: '07',
      icon: <FileCheck2 className="w-4 h-4 text-[#3F7D58]" />,
      title: 'Scientific Provenance',
      desc: 'Traceable manifests & calibration artifacts',
    },
    {
      num: '08',
      icon: <ShieldAlert className="w-4 h-4 text-[#D97706]" />,
      title: 'Diagnostic Gating',
      desc: 'Non-alarmist safety gates & single-season disclosures',
    },
  ];

  return (
    <section className="py-16 lg:py-20 border-b border-[#102A43]/15 bg-[#F3F6F7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION INTRODUCTION (Horizontal Editorial Header) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-[#102A43]/10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#EAF0F2] border border-[#102A43]/20 text-[#102A43] text-xs font-heading font-bold uppercase tracking-wider">
              <span>CHOOSE YOUR ROLE</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#102A43] tracking-tight leading-tight">
              One platform.{' '}
              <span className="text-[#0E7490] block sm:inline">Different perspectives.</span>
            </h2>
            <p className="text-base text-[#486581] leading-relaxed font-sans">
              VarshaSetu connects farmers, field officers, government teams, and analysts through the same scientific intelligence layer.
            </p>
          </div>

          {/* Right Editorial Metadata Indicator */}
          <div className="flex items-center gap-4 lg:pl-8 lg:border-l border-[#102A43]/15 shrink-0 self-start lg:self-end">
            <div className="text-right sm:text-left">
              <div className="font-heading font-black text-2xl text-[#102A43] tracking-tight leading-none">
                4 ROLES
              </div>
              <div className="text-[11px] font-heading font-semibold text-[#0E7490] uppercase tracking-wider mt-1">
                1 Scientific Layer
              </div>
            </div>
            <div className="h-9 w-px bg-[#102A43]/20 hidden sm:block" />
            <div className="text-xs text-[#829AB1] font-sans max-w-[160px] hidden sm:block">
              Role-tailored interfaces with shared physical ground truth.
            </div>
          </div>
        </div>

        {/* FOUR ROLE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-10">
          {roleCards.map((card) => (
            <Link
              key={card.id}
              to={card.to}
              onClick={() => setRole(card.role as any)}
              className="group flex flex-col bg-white rounded-2xl border-2 border-[#102A43] shadow-[3.5px_3.5px_0px_#102A43] hover:shadow-[5.5px_5.5px_0px_#102A43] hover:-translate-y-1 transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:ring-offset-2"
            >
              {/* Card Image Container with Editorial Photo Frame */}
              <div className="relative overflow-hidden bg-[#EAF0F2] border-b border-[#102A43]/15">
                <img
                  src={card.image}
                  alt={card.imageAlt}
                  className={`w-full ${card.imageStyle} filter saturate-[1.05] transition-transform duration-300 group-hover:scale-[1.03]`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102A43]/60 via-transparent to-transparent pointer-events-none" />

                {/* Top Badge & Number */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-heading font-bold uppercase tracking-wider ${card.accentBg} ${card.accentColor} border ${card.accentBorder} shadow-xs`}>
                    {card.badge}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-[#102A43]/80 backdrop-blur-sm text-white font-mono font-bold text-xs flex items-center justify-center border border-white/20">
                    {card.id}
                  </span>
                </div>

                {/* Bottom Photographic Label */}
                <div className="absolute bottom-2 left-2.5 right-2.5 text-white text-[11px] font-heading font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    {card.icon}
                    <span className="text-white drop-shadow-xs">{card.title}</span>
                  </span>
                  <span className="text-white/80 font-sans text-[10px]">{card.hindiTitle}</span>
                </div>
              </div>

              {/* Card Content Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] font-heading font-bold text-[#829AB1] uppercase tracking-wider">
                    {card.subtitle}
                  </div>
                  <h3 className="font-heading font-bold text-xl text-[#102A43] group-hover:text-[#0E7490] transition-colors leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#486581] leading-relaxed font-sans">
                    {card.description}
                  </p>
                </div>

                {/* Card CTA Footer Button */}
                <div className="pt-2 border-t border-[#102A43]/10 flex items-center justify-between text-xs font-heading font-bold text-[#102A43] group-hover:text-[#0E7490] transition-colors">
                  <span>{card.cta}</span>
                  <span className="w-7 h-7 rounded-lg bg-[#EAF0F2] border border-[#102A43]/20 flex items-center justify-center group-hover:bg-[#0E7490] group-hover:text-white group-hover:border-[#102A43] transition-all duration-200">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* FEATURE CAPABILITY STRIP */}
        <div className="mt-16 bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] overflow-hidden">
          
          {/* Capability Strip Bar Header */}
          <div className="bg-[#EAF0F2] border-b border-[#102A43]/10 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#102A43] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0E7490]" />
              BUILT FOR BETTER MONSOON DECISIONS
            </span>
            <span className="text-[11px] font-sans text-[#829AB1]">
              Deterministic Rules · PostGIS Downscaling · Probabilistic Skill
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#102A43]/10">
            
            {/* Left Special Editorial Anchor Card */}
            <div className="lg:col-span-3 bg-[#0B1F33] text-white p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="inline-block text-[10px] font-heading font-bold uppercase tracking-widest text-[#0891B2]">
                  KEY CAPABILITIES
                </span>
                <h3 className="font-heading font-bold text-lg text-white leading-snug">
                  Scientific intelligence designed for every agricultural tier.
                </h3>
              </div>
              <p className="text-xs text-[#B8C7D1] font-sans leading-relaxed">
                From planetary scale climate models down to Lucknow district gram panchayats, all grounded in Kharif 2024 empirical physics.
              </p>
            </div>

            {/* Right Capabilities Items (Compact Index) */}
            <div className="lg:col-span-9 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {capabilities.map((cap) => (
                <div
                  key={cap.num}
                  className="p-3 rounded-xl bg-[#F3F6F7] border border-[#102A43]/10 hover:border-[#0E7490]/50 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[10px] text-[#829AB1]">
                      {cap.num}
                    </span>
                    <span className="p-1 rounded bg-white border border-[#102A43]/10">
                      {cap.icon}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-xs text-[#102A43]">
                    {cap.title}
                  </h4>
                  <p className="text-[11px] text-[#486581] font-sans leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
