import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameStats, GeoElement } from '../types/game';
import { CheckCircle2, XCircle, RotateCcw, Trophy, Award, Clock, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  totalQuestions: number;
  allElements: GeoElement[];
  onRetryErrors: () => void;
  onRestartAll: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  stats,
  totalQuestions,
  allElements,
  onRetryErrors,
  onRestartAll,
}) => {
  const totalAnswers = stats.encerts + stats.errors;
  const accuracy = totalAnswers > 0 ? Math.round((stats.encerts / totalAnswers) * 100) : 0;

  // Catalan school qualification rubric
  let grade = 'NA';
  let gradeLabel = 'No Assolit';
  let gradeColor = 'text-rose-600 border-rose-500 bg-rose-50';

  if (accuracy >= 92) {
    grade = 'AE+';
    gradeLabel = 'Assoliment Excel·lent +';
    gradeColor = 'text-emerald-700 border-emerald-600 bg-emerald-50';
  } else if (accuracy >= 80) {
    grade = 'AE';
    gradeLabel = 'Assoliment Excel·lent';
    gradeColor = 'text-emerald-600 border-emerald-500 bg-emerald-50';
  } else if (accuracy >= 65) {
    grade = 'AN';
    gradeLabel = 'Assoliment Notable';
    gradeColor = 'text-blue-600 border-blue-500 bg-blue-50';
  } else if (accuracy >= 50) {
    grade = 'AS';
    gradeLabel = 'Assoliment Satisfactori';
    gradeColor = 'text-amber-600 border-amber-500 bg-amber-50';
  }

  // Trigger celebration on mount if high score
  useEffect(() => {
    if (isOpen) {
      if (accuracy >= 70) {
        sound.playFanfare();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    }
  }, [isOpen, accuracy]);

  if (!isOpen) return null;

  const failedElements = allElements.filter((el) =>
    stats.failedElementIds.includes(el.id)
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with School Stamp */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Avaluació Escolar de Geografia</span>
            </div>
            <h2 className="text-2xl font-extrabold text-stone-900">
              Resultats de la Partida
            </h2>
            <p className="text-stone-500 text-xs mt-0.5">
              Geografia de Catalunya: Relleu, Litoral i Hidrografia
            </p>
          </div>

          {/* School Stamp Badge (as in the AE+ teacher review) */}
          <div className="relative rotate-[-6deg] shrink-0">
            <div
              className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center shadow-md ${gradeColor}`}
              style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
            >
              <span className="text-3xl font-bold leading-none">{grade}</span>
              <span className="text-[10px] font-sans font-bold uppercase tracking-tighter opacity-80 mt-0.5">
                {grade === 'AE+' || grade === 'AE' ? 'Molt bé!' : 'Avaluat'}
              </span>
            </div>
          </div>
        </div>

        {/* Grade summary banner */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 mb-5">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Qualificació obtinguda:
          </div>
          <div className="text-lg font-bold text-stone-900 mt-0.5">
            {gradeLabel} ({accuracy}% d'encert)
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 text-center">
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Encerts</div>
            <div className="text-xl font-extrabold text-emerald-900 font-mono tabular-nums">
              {stats.encerts}
            </div>
          </div>

          <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Errors</div>
            <div className="text-xl font-extrabold text-rose-900 font-mono tabular-nums">
              {stats.errors}
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Millor ràtxa</div>
            <div className="text-xl font-extrabold text-amber-950 font-mono tabular-nums">
              {stats.maxStreak}
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-600">Temps</div>
            <div className="text-sm font-extrabold text-stone-800 font-mono mt-1">
              {formatTime(stats.totalTimeSeconds)}
            </div>
          </div>
        </div>

        {/* Error list for review */}
        {failedElements.length > 0 && (
          <div className="mb-5 max-h-40 overflow-y-auto pr-1">
            <div className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Elements a repassar ({failedElements.length}):</span>
            </div>
            <div className="space-y-1.5">
              {failedElements.map((el) => (
                <div
                  key={el.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-rose-50/60 border border-rose-100 text-xs"
                >
                  <span className="font-semibold text-rose-950">{el.name}</span>
                  <span className="text-[11px] text-stone-500">{el.extraInfo || el.subcategory}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-stone-100">
          {failedElements.length > 0 && (
            <button
              onClick={() => {
                sound.playClick();
                onRetryErrors();
              }}
              className="w-full sm:w-auto flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reintentar fallades ({failedElements.length})</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onRestartAll();
            }}
            className="w-full sm:w-auto flex-1 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>Jugar de nou</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-sm transition-colors"
          >
            Tancar
          </button>
        </div>
      </div>
    </div>
  );
};
