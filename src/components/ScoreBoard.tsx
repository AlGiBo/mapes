import React from 'react';
import { CheckCircle2, XCircle, Flame, Clock, Target } from 'lucide-react';
import { GameStats } from '../types/game';

interface ScoreBoardProps {
  stats: GameStats;
  totalQuestions: number;
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  categories: { id: string; label: string; count: number }[];
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  stats,
  totalQuestions,
  currentCategory,
  onSelectCategory,
  categories,
}) => {
  const totalAnswers = stats.encerts + stats.errors;
  const accuracy = totalAnswers > 0 ? Math.round((stats.encerts / totalAnswers) * 100) : 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
      {/* Category Filter Chips / Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-stone-100">
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider mr-1 shrink-0">
          Categoria:
        </span>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
              currentCategory === cat.id
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
        {/* Encerts */}
        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-xl p-2.5 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-left">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Encerts</div>
            <div className="text-xl font-extrabold text-emerald-900 font-mono tabular-nums leading-tight">
              {stats.encerts}
            </div>
          </div>
        </div>

        {/* Errors */}
        <div className="bg-rose-50/70 border border-rose-100/80 rounded-xl p-2.5 flex items-center justify-center gap-2">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-left">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Errors</div>
            <div className="text-xl font-extrabold text-rose-900 font-mono tabular-nums leading-tight">
              {stats.errors}
            </div>
          </div>
        </div>

        {/* Precisió */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-center gap-2">
          <Target className="w-5 h-5 text-slate-600 shrink-0" />
          <div className="text-left">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Precisió</div>
            <div className="text-xl font-extrabold text-slate-800 font-mono tabular-nums leading-tight">
              {accuracy}%
            </div>
          </div>
        </div>

        {/* Ràtxa */}
        <div className="bg-amber-50/70 border border-amber-100/80 rounded-xl p-2.5 flex items-center justify-center gap-2">
          <Flame className={`w-5 h-5 shrink-0 ${stats.streak > 2 ? 'text-amber-500 animate-bounce' : 'text-stone-400'}`} />
          <div className="text-left">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Ràtxa</div>
            <div className="text-xl font-extrabold text-amber-950 font-mono tabular-nums leading-tight">
              {stats.streak}
            </div>
          </div>
        </div>

        {/* Temps */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-2.5 flex items-center justify-center gap-2 col-span-2 sm:col-span-1">
          <Clock className="w-5 h-5 text-stone-500 shrink-0" />
          <div className="text-left">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Temps</div>
            <div className="text-xl font-extrabold text-stone-800 font-mono tabular-nums leading-tight">
              {formatTime(stats.totalTimeSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 pt-2">
        <div className="flex items-center justify-between text-xs text-stone-500 font-medium mb-1">
          <span>Progrés del qüestionari</span>
          <span className="font-mono tabular-nums font-bold text-stone-700">
            {stats.completedElementIds.length} / {totalQuestions}
          </span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{
              width: `${totalQuestions > 0 ? (stats.completedElementIds.length / totalQuestions) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
