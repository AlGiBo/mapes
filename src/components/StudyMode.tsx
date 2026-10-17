import React, { useState } from 'react';
import { GeoElement } from '../types/game';
import { BookOpen, Search, Info, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface StudyModeProps {
  elements: GeoElement[];
  selectedElement: GeoElement | null;
  onSelectElement: (element: GeoElement) => void;
}

export const StudyMode: React.FC<StudyModeProps> = ({
  elements,
  selectedElement,
  onSelectElement,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredElements = elements.filter(
    (el) =>
      el.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (el.fullName && el.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      el.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeElement = selectedElement || filteredElements[0] || null;

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col gap-4">
      {/* Search and header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-stone-900 text-base">
            Mode Estudi i Repàs
          </h3>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cercar riu, cim o serralada..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
          />
        </div>
      </div>

      {/* Active element detail card */}
      {activeElement && (
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/80">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {activeElement.category === 'hidrografia'
                  ? 'Hidrografia'
                  : activeElement.category === 'litoral'
                  ? 'Litoral'
                  : 'Relleu'}{' '}
                · {activeElement.subcategory}
              </span>
              <h4 className={`text-lg font-extrabold ${activeElement.colorType.includes('blue') ? 'text-sky-700' : 'text-stone-900'}`}>
                {activeElement.name}
              </h4>
            </div>
            {activeElement.extraInfo && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-200/80 text-stone-700 shrink-0">
                {activeElement.extraInfo}
              </span>
            )}
          </div>

          <p className="text-xs text-stone-600 leading-relaxed mt-1">
            {activeElement.description}
          </p>

          {/* Teacher's homework styling rule note */}
          <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center gap-2 text-[11px] text-stone-500">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>
              <strong>Pauta escolar:</strong>{' '}
              {activeElement.colorType === 'black_caps'
                ? 'Serralades en MAJÚSCULA i color NEGRE.'
                : activeElement.colorType === 'blue_caps'
                ? 'Mar en MAJÚSCULA i color BLAU.'
                : activeElement.colorType === 'blue'
                ? 'Rius i golfs amb primera lletra majúscula i color BLAU.'
                : 'Muntanyes, caps i deltes amb primera lletra majúscula i color NEGRE.'}
            </span>
          </div>
        </div>
      )}

      {/* Grid of quick selector buttons */}
      <div>
        <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
          Llista d'elements ({filteredElements.length}):
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
          {filteredElements.map((el) => {
            const isSelected = activeElement?.id === el.id;
            const isBlue = el.colorType === 'blue' || el.colorType === 'blue_caps';

            return (
              <button
                key={el.id}
                onClick={() => {
                  sound.playClick();
                  onSelectElement(el);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : isBlue
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
