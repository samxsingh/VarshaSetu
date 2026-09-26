import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, MapPin, Building2, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PathwayCard {
  number: string;
  role: string;
  title: string;
  icon: React.ReactNode;
  accentHex: string;
  accentBg: string;
  accentBorder: string;
  points: string[];
  ctaText: string;
  ctaRoute: string;
}

export const DecisionPathwaysSection: React.FC = () => {
  const pathways: PathwayCard[] = [
    {
      number: '01',
      role: 'FARMER',
      title: 'Plan the next field decision',
      icon: <Sprout className="w-5 h-5 text-[#3F7D58]" />,
      accentHex: '#3F7D58',
      accentBg: 'bg-[#E4F0E8]',
      accentBorder: 'border-[#3F7D58]',
      points: [
        'Weather and rainfall-risk context',
        'Agronomic advisories',
        'English / Hindi access',
        'What-If scenario analysis',
      ],
      ctaText: 'Open Farmer Portal',
      ctaRoute: '/farmer/dashboard',
    },
    {
      number: '02',
      role: 'OFFICER',
      title: 'See what is happening on the ground',
      icon: <MapPin className="w-5 h-5 text-[#0E7490]" />,
      accentHex: '#0E7490',
      accentBg: 'bg-[#E8F4F6]',
      accentBorder: 'border-[#0E7490]',
      points: [
        'Block-level conditions',
        'Advisory monitoring',
        'Spatial intelligence',
        'Field operations',
      ],
      ctaText: 'Open Officer Center',
      ctaRoute: '/officer',
    },
    {
      number: '03',
      role: 'GOVERNMENT',
      title: 'Monitor agricultural risk at scale',
      icon: <Building2 className="w-5 h-5 text-[#D97706]" />,
      accentHex: '#D97706',
      accentBg: 'bg-[#FEF3C7]',
      accentBorder: 'border-[#D97706]',
      points: [
        'District/block overview',
        'System status',
        'Risk monitoring',
        'Operational intelligence',
      ],
      ctaText: 'Open Government Center',
      ctaRoute: '/government/command-center',
    },
    {
      number: '04',
      role: 'ANALYST',
      title: 'Inspect the science behind the signal',
      icon: <Activity className="w-5 h-5 text-[#0891B2]" />,
      accentHex: '#0891B2',
      accentBg: 'bg-[#E8F4F6]',
      accentBorder: 'border-[#0891B2]',
      points: [
        'Model diagnostics',
        'Calibration',
        'Scenario analysis',
        'Scientific provenance',
      ],
      ctaText: 'Open Analyst Lab',
      ctaRoute: '/analyst',
    },
  ];

  return (
    <section id="decision-pathways" className="py-20 lg:py-28 border-b border-[#102A43]/15 bg-[#F3F6F7] relative">
      {/* Background contour texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-subtle-contour" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#102A43]/10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#E8F4F6] border border-[#0E7490]/40 text-[#0E7490] text-xs font-heading font-extrabold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#102A43]">
              DECISION PATHWAYS
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#102A43] tracking-tight leading-tight">
              From signal to action.
            </h2>
            <p className="text-base sm:text-lg text-[#486581] leading-relaxed font-sans">
              One scientific intelligence layer. Different decisions at every level.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono font-semibold text-[#829AB1]">
            <span>ROLES: 4</span>
            <span>•</span>
            <span>TARGETS: BLOCK-SCALE</span>
            <span>•</span>
            <span>DISCLOSED</span>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pathways.map((card, idx) => (
            <div
              key={card.number}
              className="bg-white rounded-2xl border-2 border-[#102A43] shadow-[4px_4px_0px_#102A43] p-6 flex flex-col justify-between group transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[6px_6px_0px_#102A43] relative overflow-hidden"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Expanding Accent Bar on Hover */}
              <div
                className="h-1.5 w-12 rounded-full mb-6 transition-all duration-200 ease-out group-hover:w-full"
                style={{ backgroundColor: card.accentHex }}
              />

              <div className="space-y-4">
                {/* Header with Number, Role Badge, and Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono font-black text-3xl text-[#102A43]/30 tracking-tight group-hover:text-[#102A43] transition-colors duration-200">
                      {card.number}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-heading font-extrabold tracking-wider uppercase border ${card.accentBg} ${card.accentBorder}`}
                      style={{ color: card.accentHex }}
                    >
                      {card.role}
                    </span>
                  </div>
                  <div className={`p-2 rounded-lg ${card.accentBg} border border-[#102A43]/10`}>
                    {card.icon}
                  </div>
                </div>

                {/* Card Title */}
                <h3 className="font-heading font-black text-lg sm:text-xl text-[#102A43] leading-snug">
                  {card.title}
                </h3>

                {/* Capability Points List */}
                <ul className="space-y-2.5 pt-2 border-t border-[#102A43]/10">
                  {card.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2 text-xs text-[#486581] leading-normal font-sans">
                      <CheckCircle2
                        className="w-3.5 h-3.5 shrink-0 mt-0.5"
                        style={{ color: card.accentHex }}
                      />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Action Link */}
              <div className="pt-6 mt-6 border-t border-[#102A43]/10">
                <Link
                  to={card.ctaRoute}
                  className="w-full inline-flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#EAF0F2] border border-[#102A43] text-xs font-heading font-bold text-[#102A43] transition-all duration-200 group-hover:bg-[#102A43] group-hover:text-white shadow-[2px_2px_0px_#102A43] group-hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490]"
                >
                  <span>{card.ctaText}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
