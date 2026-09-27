import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ShieldCheck,
  Landmark,
  LineChart,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

interface RoleWorkspace {
  id: string;
  role: 'FARMER' | 'OFFICER' | 'GOVERNMENT' | 'ANALYST';
  title: string;
  hindiTitle: string;
  domain: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  imagePosition: string;
  to: string;
  cta: string;
  ariaLabel: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  icon: React.ReactNode;
}

export const RoleGatewaySection: React.FC = () => {
  const { setRole } = useAppStore();

  const workspaces: RoleWorkspace[] = [
    {
      id: '01',
      role: 'FARMER',
      title: 'Farmer',
      hindiTitle: 'किसान',
      domain: 'FIELD / GROUND',
      subtitle: 'Hyperlocal Agro-Advisories',
      description:
        'Panchayat-level 7–30 day rain risk, crop phenology alerts in Hindi & English, and What-If sowing delay simulators.',
      image: '/images/role-farmer.jpg',
      imageAlt: 'Indian farmer in agricultural field reviewing hyperlocal monsoon advisories on tablet',
      imagePosition: 'object-[50%_48%]',
      to: '/farmer',
      cta: 'ENTER FARMER WORKSPACE',
      ariaLabel: 'Enter Farmer Workspace',
      accentColor: 'text-[#3F7D58]',
      accentBg: 'bg-[#E4F0E8]',
      accentBorder: 'border-[#3F7D58]/40',
      icon: <Sprout className="w-3.5 h-3.5 text-[#3F7D58]" />,
    },
    {
      id: '02',
      role: 'OFFICER',
      title: 'Field Officer',
      hindiTitle: 'कृषि अधिकारी',
      domain: 'OPERATIONS / DISTRICT',
      subtitle: 'Block Monitoring & Bulletins',
      description:
        'Spatial GIS choropleth heatmaps across Lucknow blocks, dry-spell hiatus alerts, and verified advisory bulletin broadcasts.',
      image: '/images/role-officer.jpg',
      imageAlt: 'Agricultural extension field officers inspecting crop conditions with monitoring tablet',
      imagePosition: 'object-[50%_45%]',
      to: '/officer',
      cta: 'ENTER OFFICER WORKSPACE',
      ariaLabel: 'Enter Field Officer Workspace',
      accentColor: 'text-[#0E7490]',
      accentBg: 'bg-[#E8F4F6]',
      accentBorder: 'border-[#0E7490]/40',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#0E7490]" />,
    },
    {
      id: '03',
      role: 'GOVERNMENT',
      title: 'Government',
      hindiTitle: 'राज्य योजना',
      domain: 'COMMAND / STATE',
      subtitle: 'Statewide Risk & Coverage',
      description:
        'District rainfall departure overviews, multi-block aggregate monitoring, and state agricultural planning command oversight.',
      image: '/images/role-government.jpg',
      imageAlt: 'Government agricultural command and monitoring control room with operations team',
      imagePosition: 'object-center',
      to: '/government',
      cta: 'ENTER GOVERNMENT WORKSPACE',
      ariaLabel: 'Enter Government Workspace',
      accentColor: 'text-[#D97706]',
      accentBg: 'bg-[#FEF3C7]',
      accentBorder: 'border-[#D97706]/40',
      icon: <Landmark className="w-3.5 h-3.5 text-[#D97706]" />,
    },
    {
      id: '04',
      role: 'ANALYST',
      title: 'Climate Analyst',
      hindiTitle: 'मौसम विश्लेषक',
      domain: 'MODEL / SIGNAL',
      subtitle: 'Forecast Lab & ML Models',
      description:
        'Gradient-boosted ensembles, Platt & Isotonic calibration curves, SHAP explainability, and multi-year hindcast validation.',
      image: '/images/role-analyst.jpg',
      imageAlt: 'Climate data scientist in analysis lab reviewing meteorological downscaling models on multi-monitor workstation',
      imagePosition: 'object-center',
      to: '/analyst',
      cta: 'ENTER ANALYST WORKSPACE',
      ariaLabel: 'Enter Climate Analyst Workspace',
      accentColor: 'text-[#0891B2]',
      accentBg: 'bg-[#E8F4F6]',
      accentBorder: 'border-[#0891B2]/40',
      icon: <LineChart className="w-3.5 h-3.5 text-[#0891B2]" />,
    },
  ];

  return (
    <section
      id="workspaces"
      className="py-16 lg:py-20 border-b border-[#B8C5CC]/60 bg-[#F3F6F7] relative scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION INTRODUCTION (Horizontal Editorial Header) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 lg:pb-10 border-b border-[#102A43]/10 mb-8 lg:mb-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#EAF0F2] border border-[#102A43]/20 text-[#102A43] text-xs font-heading font-bold uppercase tracking-wider">
              <span>CHOOSE YOUR ROLE</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#102A43] tracking-tight leading-tight">
              One scientific layer.{' '}
              <span className="text-[#0E7490] block sm:inline">Four operational perspectives.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#486581] leading-relaxed font-sans">
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
                1 Shared Science
              </div>
            </div>
            <div className="h-9 w-px bg-[#102A43]/20 hidden sm:block" />
            <div className="text-xs text-[#829AB1] font-sans max-w-[160px] hidden sm:block">
              Role-tailored interfaces with shared physical ground truth.
            </div>
          </div>
        </div>

        {/* FOUR EQUAL WORKSPACE CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch">
          {workspaces.map((card) => (
            <article
              key={card.id}
              className="group flex h-full flex-col bg-white rounded-2xl border border-[#102A43]/10 shadow-[0_8px_24px_rgba(16,42,67,0.05)] hover:shadow-[0_12px_32px_rgba(16,42,67,0.08)] transition-all duration-200 overflow-hidden"
            >
              {/* Landscape Photographic Region (16:10 aspect ratio) */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#EAF0F2] border-b border-[#102A43]/10 shrink-0">
                <img
                  src={card.image}
                  alt={card.imageAlt}
                  className={`w-full h-full object-cover ${card.imagePosition} transition-transform duration-300 group-hover:scale-[1.01]`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102A43]/70 via-[#102A43]/10 to-transparent pointer-events-none" />

                {/* Top Overlay Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-[0.12em] uppercase ${card.accentBg} ${card.accentColor} border ${card.accentBorder} shadow-xs backdrop-blur-xs`}
                  >
                    {card.domain}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-[#102A43]/85 backdrop-blur-xs text-white font-mono font-bold text-xs flex items-center justify-center border border-white/20 shadow-xs">
                    {card.id}
                  </span>
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white pointer-events-none">
                  <span className="flex items-center gap-1.5 text-xs font-heading font-bold text-white drop-shadow-xs">
                    {card.icon}
                    <span>{card.title}</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-xs border border-white/10 text-white text-[10px] font-sans font-medium">
                    {card.hindiTitle}
                  </span>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-5 flex flex-1 flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-[10px] font-mono font-bold tracking-[0.12em] uppercase text-[#0E7490]">
                    {card.subtitle}
                  </div>
                  <h3 className="font-heading font-black text-xl text-[#102A43] tracking-tight leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-6 text-[#52667A] font-sans">
                    {card.description}
                  </p>
                </div>

                {/* Direct Accessible Workspace Action Button Anchored at Bottom */}
                <div className="mt-auto pt-4 border-t border-[#102A43]/10">
                  <Link
                    to={card.to}
                    aria-label={card.ariaLabel}
                    onClick={() => setRole(card.role)}
                    className="inline-flex items-center justify-between w-full px-3.5 sm:px-4 py-2.5 min-h-[44px] sm:min-h-[48px] rounded-xl font-heading font-bold text-[11px] uppercase tracking-[0.06em] sm:tracking-[0.08em] bg-[#102A43] hover:bg-[#0E7490] text-[#FAF7F2] border border-[#102A43]/10 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490] group/btn"
                  >
                    <span className="whitespace-nowrap select-none">{card.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 text-[#FAF7F2]/80 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all duration-200 ml-2" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
