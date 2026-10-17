import React, { useState } from 'react';
import { GeoElement } from '../types/game';
import { ZoomIn, ZoomOut, RotateCcw, Layers } from 'lucide-react';

interface CataloniaMapProps {
  elements: GeoElement[];
  activeTargetElement?: GeoElement | null;
  targetStatus?: 'unanswered' | 'correct' | 'error' | null;
  selectedElementId?: string | null;
  placedElementIds?: string[];
  pendingPlacementElement?: GeoElement | null;
  onElementClick?: (element: GeoElement) => void;
  onTargetClick?: (element: GeoElement) => void;
  showAllLabels?: boolean;
  showReliefZones?: boolean;
  highlightedElementId?: string | null;
  lastFeedback?: { id: string; status: 'correct' | 'error' } | null;
  className?: string;
}

export const CataloniaMap: React.FC<CataloniaMapProps> = ({
  elements,
  activeTargetElement,
  targetStatus = 'unanswered',
  selectedElementId,
  placedElementIds = [],
  pendingPlacementElement,
  onElementClick,
  onTargetClick,
  showAllLabels = false,
  showReliefZones = true,
  highlightedElementId,
  lastFeedback,
  className = '',
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isReliefVisible, setIsReliefVisible] = useState<boolean>(showReliefZones);
  const [hoveredElement, setHoveredElement] = useState<GeoElement | null>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className={`relative w-full h-full min-h-[480px] bg-slate-50/50 rounded-2xl border border-stone-200 overflow-hidden select-none flex flex-col ${className}`}>
      {/* Map floating controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-xl border border-stone-200 shadow-xs">
        <button
          onClick={handleZoomIn}
          title="Apropar el mapa"
          className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Allunyar el mapa"
          className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          title="Restablir vista"
          className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors text-xs font-semibold"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-stone-200 mx-0.5" />
        <button
          onClick={() => setIsReliefVisible((v) => !v)}
          title="Mostrar / Amagar zones de relleu (Pirineu i Sistema Mediterrani)"
          className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
            isReliefVisible ? 'bg-amber-100/80 text-amber-900 border border-amber-300/60' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Relleu</span>
        </button>
      </div>

      {/* Floating element preview tooltip on hover (only for placed items or in study mode) */}
      {hoveredElement && (showAllLabels || placedElementIds.includes(hoveredElement.id)) && (
        <div className="absolute bottom-3 left-3 z-20 max-w-sm bg-stone-900/90 text-white backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-lg border border-stone-700 pointer-events-none transition-all">
          <div className="text-xs uppercase tracking-wider text-amber-300 font-bold mb-0.5">
            {hoveredElement.category === 'relleu' ? 'Relleu' : hoveredElement.category === 'litoral' ? 'Litoral' : 'Hidrografia'} · {hoveredElement.subcategory}
          </div>
          <div className="font-bold text-sm text-white">
            {hoveredElement.fullName || hoveredElement.name}
          </div>
          <div className="text-xs text-stone-300 mt-0.5 line-clamp-2">
            {hoveredElement.description}
          </div>
        </div>
      )}

      {/* Interactive SVG Canvas */}
      <div className="flex-1 w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-hidden cursor-grab active:cursor-grabbing">
        <svg
          viewBox="100 80 860 810"
          className="w-full h-full max-h-[85vh] object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          }}
        >
          <defs>
            {/* Shaded relief gradients and filters */}
            <linearGradient id="pirineuGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FB923C" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="sistemaMedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86EFAC" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.22" />
            </linearGradient>

            <linearGradient id="depressioCentralGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#FDE047" stopOpacity="0.18" />
            </linearGradient>

            <pattern id="crossBorder" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 8 3 L 8 13 M 3 8 L 13 8" stroke="#57534E" strokeWidth="1.5" strokeLinecap="round" />
            </pattern>

            <filter id="glowTarget" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Sea background representation */}
          <rect x="100" y="80" width="860" height="810" fill="#F8FAFC" />

          {/* Mediterranean Sea subtle wave lines */}
          <g opacity="0.45" stroke="#93C5FD" strokeWidth="1" fill="none" strokeDasharray="6 8">
            <path d="M 680 620 Q 750 640 820 620 T 960 610" />
            <path d="M 650 670 Q 730 690 810 670 T 950 660" />
            <path d="M 620 720 Q 710 740 800 720 T 940 710" />
            <path d="M 520 780 Q 640 800 760 780 T 900 770" />
          </g>

          {/* RELIEF SHADED AREAS (Inspired by student's solution map sol·lucions.jpg) */}
          {isReliefVisible && (
            <g id="relief-zones" className="transition-opacity duration-300">
              {/* Pirineu & Prepirineu (Orange tone like student's colored map) */}
              <path
                d="M 180 110 
                   C 220 100, 270 115, 315 125 
                   C 360 140, 420 150, 480 160 
                   C 540 165, 600 170, 670 170 
                   C 730 165, 800 155, 865 170 
                   C 870 195, 840 215, 790 230 
                   C 730 250, 670 235, 620 230 
                   C 570 240, 520 270, 470 260 
                   C 420 255, 360 270, 310 260 
                   C 260 250, 220 230, 205 180 
                   Z"
                fill="url(#pirineuGradient)"
                stroke="#F97316"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />

              {/* Sistema Mediterrani (Green tone like student's colored map) */}
              <path
                d="M 460 540 
                   C 510 510, 570 470, 650 430 
                   C 720 395, 760 360, 780 320 
                   C 800 345, 820 400, 770 460 
                   C 730 500, 680 540, 620 575 
                   C 560 610, 500 645, 450 670 
                   C 420 660, 390 640, 370 610 
                   C 390 580, 420 560, 460 540 
                   Z"
                fill="url(#sistemaMedGradient)"
                stroke="#16A34A"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />

              {/* Depressió Central (Warm subtle plain) */}
              <path
                d="M 220 470 
                   C 260 410, 310 370, 380 340 
                   C 450 320, 520 320, 590 350 
                   C 640 370, 620 420, 560 460 
                   C 500 500, 440 520, 370 540 
                   C 300 550, 250 520, 220 470 
                   Z"
                fill="url(#depressioCentralGrad)"
                stroke="#CA8A04"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </g>
          )}

          {/* MAIN CATALONIA LANDMASS OUTLINE (Matching mapa.jpg) */}
          <path
            id="catalonia-boundary"
            d="M 180 110 
               L 190 120 
               C 195 135, 185 150, 190 165
               C 185 180, 175 190, 170 210
               C 165 230, 175 250, 170 270
               C 160 290, 140 310, 130 330
               C 135 360, 155 380, 160 410
               C 165 440, 150 470, 145 490
               C 130 520, 110 540, 105 560
               L 115 570
               C 125 580, 140 590, 150 610
               C 155 640, 140 670, 135 690
               C 130 710, 145 740, 140 760
               C 135 780, 150 810, 165 830
               L 185 850
               C 215 840, 245 830, 280 820
               C 310 810, 335 835, 360 855
               C 380 870, 395 860, 410 835
               C 425 815, 440 795, 410 780
               C 390 770, 385 750, 400 735
               C 420 715, 445 700, 465 675
               C 490 655, 520 635, 550 620
               C 575 610, 595 605, 610 595
               C 635 580, 650 565, 665 555
               C 690 540, 715 525, 735 505
               C 755 490, 770 475, 785 460
               C 805 440, 830 410, 840 375
               C 850 345, 870 330, 890 310
               C 885 290, 875 275, 875 255
               C 875 240, 895 225, 925 210
               C 915 190, 895 180, 870 175
               C 840 160, 800 165, 765 170
               C 730 175, 690 185, 650 185
               C 610 185, 570 175, 530 170
               C 490 165, 450 155, 410 145
               C 380 135, 345 125, 315 120
               C 280 115, 230 100, 180 110 
               Z"
            fill="#FFFFFF"
            stroke="#1C1917"
            strokeWidth="3.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* NORTH BORDER: FRANCE & ANDORRA CROSS MARKS (+ + + as in mapa.jpg) */}
          <g id="border-crosses" stroke="#44403C" strokeWidth="1.8" strokeLinecap="round">
            <path d="M 200 106 L 200 114 M 196 110 L 204 110" />
            <path d="M 230 108 L 230 116 M 226 112 L 234 112" />
            <path d="M 260 113 L 260 121 M 256 117 L 264 117" />
            <path d="M 290 116 L 290 124 M 286 120 L 294 120" />
            <path d="M 320 122 L 320 130 M 316 126 L 324 126" />
            <path d="M 350 132 L 350 140 M 346 136 L 354 136" />
            {/* Andorra border indentation crosses */}
            <path d="M 365 155 L 365 163 M 361 159 L 369 159" />
            <path d="M 380 180 L 380 188 M 376 184 L 384 184" />
            <path d="M 405 190 L 405 198 M 401 194 L 409 194" />
            <path d="M 430 180 L 430 188 M 426 184 L 434 184" />
            <path d="M 445 160 L 445 168 M 441 164 L 449 164" />
            {/* Rest of Pyrenean border crosses */}
            <path d="M 480 162 L 480 170 M 476 166 L 484 166" />
            <path d="M 520 168 L 520 176 M 516 172 L 524 172" />
            <path d="M 560 173 L 560 181 M 556 177 L 564 177" />
            <path d="M 600 178 L 600 186 M 596 182 L 604 182" />
            <path d="M 640 182 L 640 190 M 636 186 L 644 186" />
            <path d="M 680 180 L 680 188 M 676 184 L 684 184" />
            <path d="M 720 172 L 720 180 M 716 176 L 724 176" />
            <path d="M 760 168 L 760 176 M 756 172 L 764 172" />
            <path d="M 800 165 L 800 173 M 796 169 L 804 169" />
            <path d="M 835 168 L 835 176 M 831 172 L 839 172" />
            <path d="M 860 173 L 860 181 M 856 177 L 864 177" />
          </g>

          {/* WEST BORDER (ARAGÓN) DASHED LINES (as in mapa.jpg) */}
          <path
            d="M 170 210 
               C 165 240, 180 270, 165 310 
               C 150 350, 135 390, 150 440 
               C 155 480, 135 520, 120 560 
               C 135 620, 125 680, 140 760 
               C 145 790, 160 820, 175 845"
            stroke="#78716C"
            strokeWidth="2"
            strokeDasharray="6 6"
            fill="none"
          />

          {/* RIVERS SYSTEM (XARXA HIDROGRÀFICA) */}
          <g id="rivers" stroke="#0284C7" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* R. Noguera Ribagorçana */}
            <path
              d="M 215 165 C 205 210, 210 250, 195 300 C 185 340, 180 380, 220 425"
              strokeWidth="2.4"
              className={highlightedElementId === 'r_noguera_ribagorcana' ? 'stroke-indigo-600 stroke-[4.5]' : ''}
            />

            {/* R. Noguera Pallaresa */}
            <path
              d="M 290 155 C 310 190, 295 240, 305 290 C 310 330, 295 370, 310 405"
              strokeWidth="2.4"
              className={highlightedElementId === 'r_noguera_pallaresa' ? 'stroke-indigo-600 stroke-[4.5]' : ''}
            />

            {/* R. Segre */}
            <path
              d="M 580 210 
                 C 510 230, 440 255, 390 280 
                 C 350 320, 340 370, 310 405 
                 C 270 425, 235 450, 205 485 
                 C 180 515, 165 545, 145 565"
              strokeWidth="3.2"
              className={highlightedElementId === 'r_segre' ? 'stroke-indigo-600 stroke-[4.5]' : ''}
            />

            {/* R. Ebre */}
            <path
              d="M 105 560 
                 C 130 570, 145 565, 175 585 
                 C 205 605, 235 635, 240 670 
                 C 245 710, 265 745, 295 770 
                 C 335 795, 370 815, 410 835"
              strokeWidth="4"
              className={highlightedElementId === 'r_ebre' ? 'stroke-indigo-600 stroke-[5.5]' : ''}
            />

            {/* La Muga */}
            <path
              d="M 785 175 C 810 185, 840 185, 875 235"
              strokeWidth="2.2"
              className={highlightedElementId === 'la_muga' ? 'stroke-indigo-600 stroke-[4.5]' : ''}
            />

            {/* R. Fluvià */}
            <path
              d="M 725 260 C 755 245, 795 250, 875 258"
              strokeWidth="2.5"
              className={highlightedElementId === 'r_fluvia' ? 'stroke-indigo-600 stroke-[4.5]' : ''}
            />

            {/* R. Ter */}
            <path
              d="M 660 185 
                 C 645 220, 630 260, 645 300 
                 C 655 330, 690 340, 735 340 
                 C 780 340, 825 330, 885 315"
              strokeWidth="3"
              className={highlightedElementId === 'r_ter' ? 'stroke-indigo-600 stroke-[4.5]' : ''}
            />

            {/* R. Llobregat */}
            <path
              d="M 570 220 
                 C 555 260, 540 310, 530 360 
                 C 525 410, 520 460, 540 500 
                 C 560 535, 590 570, 610 595"
              strokeWidth="3"
              className={highlightedElementId === 'r_llobregat' ? 'stroke-indigo-600 stroke-[4.5]' : ''}
            />

            {/* R. Tordera */}
            <path
              d="M 685 415 C 710 435, 740 455, 775 475"
              strokeWidth="2.4"
              className={highlightedElementId === 'r_tordera' ? 'stroke-indigo-600 stroke-[4.5]' : ''}
            />

            {/* R. Besòs */}
            <path
              d="M 640 440 C 640 470, 645 500, 660 550"
              strokeWidth="2.4"
              className={highlightedElementId === 'r_besos' ? 'stroke-indigo-600 stroke-[4.5]' : ''}
            />

            {/* R. Francolí */}
            <path
              d="M 380 540 C 405 570, 425 615, 465 675"
              strokeWidth="2.4"
              className={highlightedElementId === 'r_francoli' ? 'stroke-indigo-600 stroke-[4.5]' : ''}
            />
          </g>

          {/* INTERACTIVE TARGET HOTSPOTS & LABELS */}
          {elements.map((el) => {
            const isTarget = activeTargetElement?.id === el.id;
            const isPlaced = placedElementIds.includes(el.id);
            const isSelected = selectedElementId === el.id;
            const isHighlighted = highlightedElementId === el.id;
            const isBlue = el.colorType === 'blue' || el.colorType === 'blue_caps';
            const isCaps = el.colorType === 'black_caps' || el.colorType === 'blue_caps';
            const feedback = lastFeedback?.id === el.id ? lastFeedback.status : null;

            // In placement mode, clickable target hotspots are displayed
            const isPendingPlacementTarget = pendingPlacementElement !== null && !isPlaced;

            return (
              <g
                key={el.id}
                className="cursor-pointer transition-all duration-200"
                onClick={() => {
                  if (onTargetClick) onTargetClick(el);
                  if (onElementClick) onElementClick(el);
                }}
                onMouseEnter={() => setHoveredElement(el)}
                onMouseLeave={() => setHoveredElement(null)}
              >
                {/* Active Question Target Ring: Red when unanswered, Green with checkmark when correct, Red with cross when error */}
                {isTarget && (
                  <g className="animate-pulse">
                    <circle
                      cx={el.x}
                      cy={el.y}
                      r="26"
                      fill={targetStatus === 'correct' ? '#10B981' : '#EF4444'}
                      fillOpacity={targetStatus === 'correct' ? 0.25 : 0.2}
                      stroke={targetStatus === 'correct' ? '#10B981' : '#EF4444'}
                      strokeWidth="2.5"
                      strokeDasharray={targetStatus === 'correct' ? 'none' : '4 3'}
                    />
                    <circle
                      cx={el.x}
                      cy={el.y}
                      r="16"
                      fill={targetStatus === 'correct' ? '#059669' : '#DC2626'}
                      fillOpacity="0.35"
                    />
                    <circle
                      cx={el.x}
                      cy={el.y}
                      r="9"
                      fill={targetStatus === 'correct' ? '#059669' : '#DC2626'}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                    />
                    <text
                      x={el.x}
                      y={el.y - 18}
                      textAnchor="middle"
                      className={`font-extrabold text-[15px] tracking-wide ${
                        targetStatus === 'correct' ? 'fill-emerald-600' : 'fill-red-600'
                      }`}
                      filter="url(#glowTarget)"
                    >
                      {targetStatus === 'correct' ? '✓' : targetStatus === 'error' ? '✗' : '?'}
                    </text>
                  </g>
                )}

                {/* Hotspot indicator in Placement Mode: neutral, anonymous dot for every unplaced candidate spot */}
                {!isTarget && isPendingPlacementTarget && !showAllLabels && !isPlaced && (
                  <g className="group">
                    <circle
                      cx={el.x}
                      cy={el.y}
                      r="16"
                      fill="transparent"
                      className="cursor-pointer"
                    />
                    <circle
                      cx={el.x}
                      cy={el.y}
                      r="5"
                      className="fill-stone-300 stroke-stone-500 stroke-[1.5] group-hover:fill-amber-400 group-hover:scale-125 transition-all"
                    />
                  </g>
                )}

                {/* Feedback glow on click (green for success, red for wrong guess) */}
                {feedback === 'correct' && (
                  <circle cx={el.x} cy={el.y} r="22" fill="#22C55E" fillOpacity="0.4" className="animate-ping" />
                )}
                {feedback === 'error' && (
                  <circle cx={el.x} cy={el.y} r="20" fill="#EF4444" fillOpacity="0.5" className="animate-ping" />
                )}

                {/* Element Pin Marker (Shown if in study mode, already placed, or just correctly answered) */}
                {(showAllLabels || isPlaced || (isTarget && targetStatus === 'correct')) && (
                  <g>

                    {/* Central marker dot */}
                    <circle
                      cx={el.x}
                      cy={el.y}
                      r={isSelected || isHighlighted ? '7' : '4.5'}
                      fill={isBlue ? '#0284C7' : '#1C1917'}
                      stroke="#FFFFFF"
                      strokeWidth="1.8"
                    />

                    {/* Peak / Mountain Icon */}
                    {el.subcategory === 'pic' && (
                      <path
                        d={`M ${el.x - 7} ${el.y - 6} L ${el.x} ${el.y - 17} L ${el.x + 7} ${el.y - 6} Z`}
                        fill="#78350F"
                        stroke="#FFFFFF"
                        strokeWidth="1.2"
                      />
                    )}

                    {/* Teacher-formatted handwritten / typed label */}
                    <g transform={`translate(${el.x}, ${el.y + (el.subcategory === 'pic' ? 14 : -10)})`}>
                      <rect
                        x="-48"
                        y="-10"
                        width="96"
                        height="20"
                        rx="4"
                        fill="#FFFFFF"
                        fillOpacity="0.88"
                        stroke={
                          isSelected || isHighlighted
                            ? '#2563EB'
                            : isBlue
                            ? '#BAE6FD'
                            : '#E7E5E4'
                        }
                        strokeWidth={isSelected || isHighlighted ? '2' : '1'}
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        className={`text-[10px] select-none font-bold ${
                          isBlue ? 'fill-sky-800' : 'fill-stone-900'
                        } ${isCaps ? 'uppercase tracking-wider' : 'capitalize'}`}
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {el.name}
                      </text>
                    </g>
                  </g>
                )}
              </g>
            );
          })}

          {/* Compass Rose / Rosa dels Vents */}
          <g transform="translate(180, 780)" opacity="0.85">
            <circle cx="0" cy="0" r="28" fill="#FFFFFF" stroke="#E7E5E4" strokeWidth="1.5" />
            <path d="M 0 -22 L 4 -4 L 22 0 L 4 4 L 0 22 L -4 4 L -22 0 L -4 -4 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
            <path d="M 0 -22 L 4 -4 L 0 0 Z" fill="#DC2626" />
            <path d="M 0 -22 L -4 -4 L 0 0 Z" fill="#991B1B" />
            <text x="0" y="-25" textAnchor="middle" className="text-[10px] font-bold fill-stone-800">N</text>
            <text x="25" y="4" textAnchor="middle" className="text-[9px] font-bold fill-stone-500">E</text>
            <text x="0" y="32" textAnchor="middle" className="text-[9px] font-bold fill-stone-500">S</text>
            <text x="-25" y="4" textAnchor="middle" className="text-[9px] font-bold fill-stone-500">O</text>
          </g>
        </svg>
      </div>

      {/* Map Footer helper badge */}
      <div className="bg-white/80 border-t border-stone-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
            <span>Rius i Golfs (blau)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-900 inline-block" />
            <span>Relleu i Litoral (negre)</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-800 rotate-45 inline-block" />
            <span>Pics / Cims</span>
          </span>
        </div>
        <div className="text-[11px] text-stone-400">
          Usa la roda o els botons per fer zoom
        </div>
      </div>
    </div>
  );
};
