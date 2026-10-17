import React from 'react';
import { GameMode } from '../types/game';
import { Volume2, VolumeX, HelpCircle, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onOpenHelp: () => void;
  onResetGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenHelp,
  onResetGame,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="w-full bg-white border-b border-stone-200 sticky top-0 z-40 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand title, one line */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-base shadow-xs">
            CAT
          </div>
          <span className="text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap">
            El Relleu de Catalunya
          </span>
        </div>

        {/* Zone 2: Navigation mode links (4 links, single-line, clean typography) */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-0.5">
          <button
            onClick={() => {
              sound.playClick();
              onSelectMode('quiz');
            }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentMode === 'quiz'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Tria entre 4 opcions
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onSelectMode('placement');
            }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentMode === 'placement'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Col·loca al mapa
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onSelectMode('study');
            }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentMode === 'study'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Mode Estudi
          </button>
        </nav>

        {/* Zone 3: Primary action / utility buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onOpenHelp();
            }}
            title="Veure instruccions i pautes escolars"
            className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onToggleMute();
            }}
            title={isMuted ? 'Activar so' : 'Silenciar so'}
            className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-stone-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-stone-700" />
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onResetGame();
            }}
            title="Reiniciar partida"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
