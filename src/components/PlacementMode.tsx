import React, { useState, useMemo } from 'react';
import { GeoElement } from '../types/game';
import { MapPin, HelpCircle, Check, ArrowRight, SkipForward } from 'lucide-react';
import { sound } from '../utils/audio';

interface PlacementModeProps {
  elements: GeoElement[];
  placedElementIds: string[];
  onPlaceSuccess: (element: GeoElement) => void;
  onPlaceError: (targetElement: GeoElement, clickedElement: GeoElement) => void;
  onFinishGame: () => void;
  currentElementToPlace: GeoElement | null;
  onSelectElementToPlace: (element: GeoElement) => void;
}

export const PlacementMode: React.FC<PlacementModeProps> = ({
  elements,
  placedElementIds,
  onPlaceSuccess,
  onPlaceError,
  onFinishGame,
  currentElementToPlace,
  onSelectElementToPlace,
}) => {
  const [showHint, setShowHint] = useState<boolean>(false);
  const [lastAttemptStatus, setLastAttemptStatus] = useState<{
    success: boolean;
    elementName: string;
    message: string;
  } | null>(null);

  // Unplaced elements remaining
  const unplacedElements = useMemo(() => {
    return elements.filter((el) => !placedElementIds.includes(el.id));
  }, [elements, placedElementIds]);

  // Current item target
  const activeTarget = currentElementToPlace || unplacedElements[0] || null;

  const handleSkip = () => {
    if (unplacedElements.length > 1) {
      const currentIndex = unplacedElements.findIndex((el) => el.id === activeTarget?.id);
      const nextIndex = (currentIndex + 1) % unplacedElements.length;
      onSelectElementToPlace(unplacedElements[nextIndex]);
      setShowHint(false);
      setLastAttemptStatus(null);
    }
  };

  if (!activeTarget || unplacedElements.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-stone-200 p-6 text-center shadow-xs">
        <div className="w-12 h-12 mx-auto mb-3 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
          <Check className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-stone-900 mb-1">Has col·locat tots els elements!</h3>
        <p className="text-stone-500 text-sm mb-4">Tots els punts del mapa han estat ubicats correctament.</p>
        <button
          onClick={onFinishGame}
          className="px-6 py-2.5 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-800 transition-colors"
        >
          Veure Puntuació i Informe
        </button>
      </div>
    );
  }

  const isBlue = activeTarget.colorType === 'blue' || activeTarget.colorType === 'blue_caps';

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
      {/* Target prompt */}
      <div>
        <div className="flex items-center justify-between text-xs text-stone-500 font-semibold mb-2">
          <span className="uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            Falten {unplacedElements.length} de {elements.length} elements
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? 'Amagar pista' : 'Pista'}</span>
            </button>
            {unplacedElements.length > 1 && (
              <button
                onClick={handleSkip}
                className="flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors"
                title="Passar a un altre element"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Saltar</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200/80 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                Clica sobre el mapa on està situat:
              </div>
              <div className={`text-xl font-extrabold ${isBlue ? 'text-sky-700' : 'text-stone-900'}`}>
                {activeTarget.name}
              </div>
            </div>
          </div>

          <div className="text-xs text-stone-500 max-w-xs">
            {activeTarget.category === 'hidrografia'
              ? 'Xarxa de rius'
              : activeTarget.category === 'litoral'
              ? 'Litoral i costes'
              : 'Relleu i muntanyes'}
          </div>
        </div>

        {/* Dynamic feedback after attempt */}
        {lastAttemptStatus && (
          <div
            className={`p-3 rounded-xl border text-xs mb-3 transition-all ${
              lastAttemptStatus.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {lastAttemptStatus.message}
          </div>
        )}

        {/* Hint text */}
        {showHint && (
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed mb-3">
            <strong>Pista geogràfica:</strong> {activeTarget.description} {activeTarget.extraInfo ? `(${activeTarget.extraInfo})` : ''}
          </div>
        )}
      </div>

      {/* Available elements drawer to pick manually */}
      <div className="pt-2">
        <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
          O tria quin element vols col·locar ara:
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
          {unplacedElements.map((el) => {
            const isSelected = activeTarget.id === el.id;
            const elBlue = el.colorType === 'blue' || el.colorType === 'blue_caps';

            return (
              <button
                key={el.id}
                onClick={() => {
                  sound.playClick();
                  onSelectElementToPlace(el);
                  setShowHint(false);
                  setLastAttemptStatus(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white ring-2 ring-stone-900/30'
                    : elBlue
                    ? 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
                    : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200'
                }`}
              >
                {el.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
