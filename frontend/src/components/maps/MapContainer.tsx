import React, { useState } from 'react';
import { useOfficerStore } from '../../stores/useOfficerStore';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { ZoomIn, ZoomOut, RotateCcw, MapPin } from 'lucide-react';

interface BlockGeoData {
  id: string;
  name: string;
  hindiName: string;
  panchayatsCount: number;
  drySpellProb: number;
  onsetProb: number;
  heavyRainProb: number;
  anomalyPercent: number;
  d: string; // SVG path representation
  centroid: { x: number; y: number };
}

// Calibrated SVG vector boundaries representing Lucknow District blocks
const LUCKNOW_BLOCKS: BlockGeoData[] = [
  {
    id: 'bkt',
    name: 'Bakshi Ka Talab',
    hindiName: 'बख्शी का तालाब',
    panchayatsCount: 84,
    drySpellProb: 58,
    onsetProb: 88,
    heavyRainProb: 65,
    anomalyPercent: 14,
    d: 'M 180,60 L 290,40 L 360,110 L 320,190 L 220,180 L 160,120 Z',
    centroid: { x: 250, y: 115 },
  },
  {
    id: 'malihabad',
    name: 'Malihabad',
    hindiName: 'मलिहाबाद',
    panchayatsCount: 66,
    drySpellProb: 74,
    onsetProb: 82,
    heavyRainProb: 45,
    anomalyPercent: -8,
    d: 'M 60,110 L 160,120 L 220,180 L 180,270 L 90,260 L 50,180 Z',
    centroid: { x: 130, y: 185 },
  },
  {
    id: 'sarojininagar',
    name: 'Sarojininagar',
    hindiName: 'सरोजिनी नगर',
    panchayatsCount: 78,
    drySpellProb: 42,
    onsetProb: 89,
    heavyRainProb: 55,
    anomalyPercent: 18,
    d: 'M 180,270 L 270,230 L 310,310 L 240,380 L 140,360 Z',
    centroid: { x: 225, y: 310 },
  },
  {
    id: 'mohanlalganj',
    name: 'Mohanlalganj',
    hindiName: 'मोहनलालगंज',
    panchayatsCount: 92,
    drySpellProb: 35,
    onsetProb: 91,
    heavyRainProb: 72,
    anomalyPercent: 24,
    d: 'M 270,230 L 400,210 L 440,320 L 370,410 L 240,380 L 310,310 Z',
    centroid: { x: 345, y: 315 },
  },
  {
    id: 'gosainganj',
    name: 'Gosainganj',
    hindiName: 'गोसाईंगंज',
    panchayatsCount: 72,
    drySpellProb: 38,
    onsetProb: 86,
    heavyRainProb: 68,
    anomalyPercent: 12,
    d: 'M 320,190 L 430,160 L 480,250 L 400,210 L 270,230 Z',
    centroid: { x: 380, y: 205 },
  },
  {
    id: 'chinhat',
    name: 'Chinhat / Urban Periphery',
    hindiName: 'चिनहट',
    panchayatsCount: 48,
    drySpellProb: 45,
    onsetProb: 87,
    heavyRainProb: 58,
    anomalyPercent: 6,
    d: 'M 220,180 L 320,190 L 270,230 L 180,270 Z',
    centroid: { x: 245, y: 215 },
  },
];

export const MapContainer: React.FC = () => {
  const { selectedBlock, setSelectedBlock, activeRiskLayer } = useOfficerStore();
  const [hoveredBlock, setHoveredBlock] = useState<BlockGeoData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  const getFillColor = (block: BlockGeoData) => {
    const isSelected = selectedBlock === block.name;

    if (activeRiskLayer === 'DRY_SPELL') {
      if (block.drySpellProb >= 70) return isSelected ? '#E11D48' : '#F43F5E';
      if (block.drySpellProb >= 50) return isSelected ? '#D97706' : '#F59E0B';
      return isSelected ? '#059669' : '#10B981';
    }
    if (activeRiskLayer === 'ONSET') {
      if (block.onsetProb >= 85) return isSelected ? '#0F766E' : '#14B8A6';
      if (block.onsetProb >= 60) return isSelected ? '#0284C7' : '#38BDF8';
      return isSelected ? '#64748B' : '#94A3B8';
    }
    if (activeRiskLayer === 'HEAVY_RAIN') {
      if (block.heavyRainProb >= 65) return isSelected ? '#1E40AF' : '#3B82F6';
      if (block.heavyRainProb >= 40) return isSelected ? '#0284C7' : '#60A5FA';
      return isSelected ? '#93C5FD' : '#BFDBFE';
    }
    if (activeRiskLayer === 'ANOMALY') {
      if (block.anomalyPercent > 15) return isSelected ? '#0284C7' : '#38BDF8';
      if (block.anomalyPercent < -5) return isSelected ? '#EA580C' : '#F97316';
      return isSelected ? '#059669' : '#10B981';
    }
    return '#CBD5E1';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className="relative w-full h-[520px] bg-slate-900/5 rounded-2xl border border-surface-border overflow-hidden select-none"
      onMouseMove={handleMouseMove}
    >
      {/* Top Overlay Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <Badge variant="demo" size="sm">
          DEMO GEOMETRY: Lucknow District Blocks
        </Badge>
        <span className="hidden sm:inline-block text-xs bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-surface-border text-slate-700 font-medium">
          6 Administrative Blocks • 440 Gram Panchayats
        </span>
      </div>

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-surface-border shadow-md">
        <button
          onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-700"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.15))}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-700"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-700"
          aria-label="Reset zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive SVG Choropleth Canvas */}
      <div className="w-full h-full flex items-center justify-center">
        <svg
          viewBox="0 0 540 460"
          className="w-full h-full max-w-2xl transition-transform duration-300 ease-out cursor-pointer"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Subtle Grid Lines to evoke topographical paper */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" opacity="0.6" />

          {/* Block Polygons */}
          {LUCKNOW_BLOCKS.map((block) => {
            const isSelected = selectedBlock === block.name;
            const isHovered = hoveredBlock?.id === block.id;

            return (
              <g
                key={block.id}
                onClick={() => setSelectedBlock(block.name)}
                onMouseEnter={() => setHoveredBlock(block)}
                onMouseLeave={() => setHoveredBlock(null)}
                className="transition-all duration-200"
              >
                <path
                  d={block.d}
                  fill={getFillColor(block)}
                  fillOpacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.7}
                  stroke={isSelected ? '#0F172A' : '#FFFFFF'}
                  strokeWidth={isSelected ? '3' : '1.5'}
                  strokeLinejoin="round"
                  className="filter drop-shadow-xs hover:brightness-105"
                />

                {/* Centroid Label */}
                <text
                  x={block.centroid.x}
                  y={block.centroid.y}
                  textAnchor="middle"
                  className={cn(
                    'font-heading text-[11px] font-bold pointer-events-none fill-slate-900 select-none drop-shadow-sm',
                    isSelected && 'fill-white'
                  )}
                >
                  {block.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredBlock && (
        <div
          className="absolute z-30 pointer-events-none bg-[#102A43] border-2 border-[#0891B2] text-white text-xs p-3 rounded-xl shadow-[3px_3px_0px_#000000] space-y-1 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
        >
          <div className="font-heading font-extrabold text-sm flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#0891B2]" />
            <span>{hoveredBlock.name}</span>
          </div>
          <p className="text-[#EAF0F2] text-[11px] font-sans">{hoveredBlock.hindiName}</p>
          <div className="pt-1.5 border-t border-[#155E75] space-y-0.5 text-[11px] font-mono">
            <div>Gram Panchayats: <strong className="text-white">{hoveredBlock.panchayatsCount}</strong></div>
            <div>Dry Spell Risk: <strong className="text-[#FEF3C7]">{hoveredBlock.drySpellProb}%</strong></div>
            <div>Onset Likelihood: <strong className="text-[#0891B2]">{hoveredBlock.onsetProb}%</strong></div>
            <div>Heavy Rain Alert: <strong className="text-[#DBEAFE]">{hoveredBlock.heavyRainProb}%</strong></div>
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-4 z-20 text-[11px] text-slate-500 font-medium">
        Click on any block to filter Panchayats & inspect localized agronomic advisories.
      </div>
    </div>
  );
};
