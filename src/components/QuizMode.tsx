import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GeoElement } from '../types/game';
import { Check, X, ArrowRight, HelpCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface QuizModeProps {
  elements: GeoElement[];
  onAnswer: (isCorrect: boolean, element: GeoElement) => void;
  onFinishGame: () => void;
  onActiveTargetChange: (element: GeoElement | null) => void;
  onTargetStatusChange?: (status: 'unanswered' | 'correct' | 'error') => void;
  placedElementIds: string[];
}

export const QuizMode: React.FC<QuizModeProps> = ({
  elements,
  onAnswer,
  onFinishGame,
  onActiveTargetChange,
  onTargetStatusChange,
  placedElementIds,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [options, setOptions] = useState<GeoElement[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Store callbacks in refs to decouple them from effect dependencies
  const onAnswerRef = useRef(onAnswer);
  const onFinishGameRef = useRef(onFinishGame);
  const onActiveTargetChangeRef = useRef(onActiveTargetChange);
  const onTargetStatusChangeRef = useRef(onTargetStatusChange);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  useEffect(() => {
    onFinishGameRef.current = onFinishGame;
  }, [onFinishGame]);

  useEffect(() => {
    onActiveTargetChangeRef.current = onActiveTargetChange;
  }, [onActiveTargetChange]);

  useEffect(() => {
    onTargetStatusChangeRef.current = onTargetStatusChange;
  }, [onTargetStatusChange]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  // When elements array changes (e.g. category changed), reset index to 0
  useEffect(() => {
    setCurrentIndex(0);
  }, [elements]);

  const currentElement = elements[currentIndex] || null;

  // Helper to generate 4 multiple-choice options (1 target + 3 distractors)
  const generateOptions = useCallback(
    (target: GeoElement): GeoElement[] => {
      const sameCategory = elements.filter(
        (e) => e.id !== target.id && e.category === target.category
      );
      const otherElements = elements.filter(
        (e) => e.id !== target.id && e.category !== target.category
      );

      const shuffledSame = [...sameCategory].sort(() => 0.5 - Math.random());
      const shuffledOthers = [...otherElements].sort(() => 0.5 - Math.random());

      const distractors = [...shuffledSame, ...shuffledOthers].slice(0, 3);
      const pool = [target, ...distractors];

      return pool.sort(() => 0.5 - Math.random());
    },
    [elements]
  );

  // Setup question when currentIndex or target element changes
  useEffect(() => {
    if (currentElement) {
      onActiveTargetChangeRef.current(currentElement);
      onTargetStatusChangeRef.current?.('unanswered');
      setOptions(generateOptions(currentElement));
      setSelectedOptionId(null);
      setIsAnswered(false);
      setShowHint(false);
    } else if (elements.length > 0 && currentIndex >= elements.length) {
      onActiveTargetChangeRef.current(null);
      onTargetStatusChangeRef.current?.('unanswered');
      onFinishGameRef.current();
    }
  }, [currentIndex, currentElement, elements.length, generateOptions]);

  // Function to move to the next question
  const handleNext = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }

    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex < elements.length) {
        return nextIndex;
      } else {
        onFinishGameRef.current();
        return prev;
      }
    });
  }, [elements.length]);

  const handleSelectOption = (option: GeoElement) => {
    if (isAnswered || !currentElement) return;

    setSelectedOptionId(option.id);
    setIsAnswered(true);

    const isCorrect = option.id === currentElement.id;
    if (isCorrect) {
      sound.playSuccess();
      onTargetStatusChangeRef.current?.('correct');
    } else {
      sound.playError();
      onTargetStatusChangeRef.current?.('error');
    }

    onAnswerRef.current(isCorrect, currentElement);

    // Auto-advance: 1.2s on correct, 2.4s on error so the student can absorb the answer
    const delay = isCorrect ? 1200 : 2400;
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
    }
    advanceTimerRef.current = setTimeout(() => {
      handleNext();
    }, delay);
  };

  if (!currentElement) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-xs">
        <h3 className="text-xl font-bold text-stone-900 mb-2">Partida completada!</h3>
        <p className="text-stone-500 text-sm mb-4">Has contestat totes les preguntes d'aquesta categoria.</p>
        <button
          onClick={() => onFinishGameRef.current()}
          className="px-6 py-2.5 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
        >
          Veure Resultats i Nota Final
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
      {/* Question Header */}
      <div>
        <div className="flex items-center justify-between text-xs text-stone-500 font-semibold mb-2">
          <span className="uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 font-mono">
            Pregunta {currentIndex + 1} de {elements.length}
          </span>
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHint ? 'Amagar pista' : 'Pista'}</span>
          </button>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-stone-900">
          Quin element geogràfic correspon al punt assenyalat al mapa?
        </h3>

        {showHint && (
          <div className="mt-2.5 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            <strong>Pista:</strong> Es tracta d'un element de tipus{' '}
            <span className="font-semibold underline">
              {currentElement.category === 'hidrografia'
                ? 'xarxa hidrogràfica (riu)'
                : currentElement.category === 'litoral'
                ? 'litoral (cap, golf o delta)'
                : 'relleu (serralada, pic o depressió)'}
            </span>
            . {currentElement.extraInfo}
          </div>
        )}
      </div>

      {/* 4 Multiple-Choice Option Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
        {options.map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id;
          const isTarget = opt.id === currentElement.id;

          let btnStyle = 'border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 text-stone-800';
          let icon = null;

          if (isAnswered) {
            if (isTarget) {
              btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30';
              icon = <Check className="w-4 h-4 text-emerald-600 shrink-0" />;
            } else if (isSelected && !isTarget) {
              btnStyle = 'border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-400/30';
              icon = <X className="w-4 h-4 text-rose-600 shrink-0" />;
            } else {
              btnStyle = 'border-stone-100 bg-stone-50 text-stone-400 opacity-60';
            }
          }

          const letter = ['A', 'B', 'C', 'D'][idx];

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt)}
              disabled={isAnswered}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-left font-medium transition-all duration-150 ${btnStyle} cursor-pointer disabled:cursor-default`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {letter}
                </span>
                <span className="font-bold text-sm sm:text-base">
                  {opt.name}
                </span>
              </div>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Answer feedback & Next button */}
      {isAnswered && (
        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="text-xs sm:text-sm">
            {selectedOptionId === currentElement.id ? (
              <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Correcte! {currentElement.fullName || currentElement.name}
              </span>
            ) : (
              <span className="font-medium text-rose-700 flex items-center gap-1.5">
                <X className="w-4 h-4 text-rose-600" />
                Incorrecte. La resposta correcta és: <strong className="font-bold text-stone-900">{currentElement.name}</strong>
              </span>
            )}
            <div className="text-xs text-stone-500 mt-0.5">
              {currentElement.description}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full sm:w-auto px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <span>{currentIndex + 1 < elements.length ? 'Següent pregunta' : 'Finalitzar'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
