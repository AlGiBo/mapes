import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameMode, GameStats, GeoElement } from './types/game';
import { GEO_ELEMENTS } from './data/elements';
import { Header } from './components/Header';
import { ScoreBoard } from './components/ScoreBoard';
import { CataloniaMap } from './components/CataloniaMap';
import { QuizMode } from './components/QuizMode';
import { PlacementMode } from './components/PlacementMode';
import { StudyMode } from './components/StudyMode';
import { ResultsModal } from './components/ResultsModal';
import { InstructionsModal } from './components/InstructionsModal';
import { sound } from './utils/audio';

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('quiz');
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  // Active element tracking
  const [activeTargetElement, setActiveTargetElement] = useState<GeoElement | null>(null);
  const [quizTargetStatus, setQuizTargetStatus] = useState<'unanswered' | 'correct' | 'error'>('unanswered');
  const [selectedStudyElement, setSelectedStudyElement] = useState<GeoElement | null>(null);
  const [pendingPlacementElement, setPendingPlacementElement] = useState<GeoElement | null>(null);
  const [lastFeedback, setLastFeedback] = useState<{ id: string; status: 'correct' | 'error' } | null>(null);

  // Game stats
  const [stats, setStats] = useState<GameStats>({
    encerts: 0,
    errors: 0,
    streak: 0,
    maxStreak: 0,
    totalTimeSeconds: 0,
    completedElementIds: [],
    failedElementIds: [],
  });

  // Filter elements by category
  const filteredElements = useMemo(() => {
    if (currentCategory === 'all') return GEO_ELEMENTS;
    if (currentCategory === 'relleu') {
      return GEO_ELEMENTS.filter(
        (e) => e.category === 'relleu' && (e.subcategory === 'pic' || e.subcategory === 'serralada')
      );
    }
    if (currentCategory === 'depressions') {
      return GEO_ELEMENTS.filter(
        (e) => e.category === 'relleu' && (e.subcategory === 'depressio' || e.subcategory === 'plana')
      );
    }
    if (currentCategory === 'litoral') {
      return GEO_ELEMENTS.filter((e) => e.category === 'litoral');
    }
    if (currentCategory === 'hidrografia') {
      return GEO_ELEMENTS.filter((e) => e.category === 'hidrografia');
    }
    return GEO_ELEMENTS;
  }, [currentCategory]);

  // Categories config for tabs
  const categoryTabs = useMemo(() => {
    return [
      { id: 'all', label: 'Tot el mapa', count: GEO_ELEMENTS.length },
      {
        id: 'relleu',
        label: 'Serralades i Pics',
        count: GEO_ELEMENTS.filter((e) => e.category === 'relleu' && (e.subcategory === 'pic' || e.subcategory === 'serralada')).length,
      },
      {
        id: 'depressions',
        label: 'Depressions i Planes',
        count: GEO_ELEMENTS.filter((e) => e.category === 'relleu' && (e.subcategory === 'depressio' || e.subcategory === 'plana')).length,
      },
      {
        id: 'litoral',
        label: 'Litoral i Costes',
        count: GEO_ELEMENTS.filter((e) => e.category === 'litoral').length,
      },
      {
        id: 'hidrografia',
        label: 'Rius (Hidrografia)',
        count: GEO_ELEMENTS.filter((e) => e.category === 'hidrografia').length,
      },
    ];
  }, []);

  // Timer loop while game is active
  useEffect(() => {
    const timer = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        totalTimeSeconds: prev.totalTimeSeconds + 1,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle Quiz answer
  const handleQuizAnswer = useCallback((isCorrect: boolean, element: GeoElement) => {
    setLastFeedback({ id: element.id, status: isCorrect ? 'correct' : 'error' });
    setTimeout(() => setLastFeedback(null), 1200);

    setStats((prev) => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        ...prev,
        encerts: isCorrect ? prev.encerts + 1 : prev.encerts,
        errors: !isCorrect ? prev.errors + 1 : prev.errors,
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        completedElementIds: isCorrect && !prev.completedElementIds.includes(element.id)
          ? [...prev.completedElementIds, element.id]
          : prev.completedElementIds,
        failedElementIds: !isCorrect && !prev.failedElementIds.includes(element.id)
          ? [...prev.failedElementIds, element.id]
          : prev.failedElementIds,
      };
    });
  }, []);

  // Handle map click in placement mode
  const handleMapTargetClick = (clickedElement: GeoElement) => {
    if (currentMode === 'placement') {
      const target = pendingPlacementElement || filteredElements.find((e) => !stats.completedElementIds.includes(e.id));
      if (!target) return;

      const isCorrect = clickedElement.id === target.id;
      setLastFeedback({ id: clickedElement.id, status: isCorrect ? 'correct' : 'error' });
      setTimeout(() => setLastFeedback(null), 1200);

      if (isCorrect) {
        sound.playSuccess();
        setStats((prev) => {
          const newStreak = prev.streak + 1;
          const newCompleted = [...prev.completedElementIds, target.id];
          return {
            ...prev,
            encerts: prev.encerts + 1,
            streak: newStreak,
            maxStreak: Math.max(prev.maxStreak, newStreak),
            completedElementIds: newCompleted,
          };
        });

        // Pick next unplaced element
        const remaining = filteredElements.filter(
          (e) => !stats.completedElementIds.includes(e.id) && e.id !== target.id
        );
        if (remaining.length > 0) {
          setPendingPlacementElement(remaining[0]);
        } else {
          setPendingPlacementElement(null);
          setShowResults(true);
        }
      } else {
        sound.playError();
        setStats((prev) => ({
          ...prev,
          errors: prev.errors + 1,
          streak: 0,
          failedElementIds: !prev.failedElementIds.includes(target.id)
            ? [...prev.failedElementIds, target.id]
            : prev.failedElementIds,
        }));
      }
    } else if (currentMode === 'study') {
      setSelectedStudyElement(clickedElement);
    }
  };

  const handleFinishGame = useCallback(() => {
    setShowResults(true);
  }, []);

  // Reset entire game round
  const handleResetGame = () => {
    setStats({
      encerts: 0,
      errors: 0,
      streak: 0,
      maxStreak: 0,
      totalTimeSeconds: 0,
      completedElementIds: [],
      failedElementIds: [],
    });
    setPendingPlacementElement(null);
    setQuizTargetStatus('unanswered');
    setShowResults(false);
  };

  // Retry only missed questions
  const handleRetryErrors = () => {
    setStats((prev) => ({
      ...prev,
      encerts: 0,
      errors: 0,
      streak: 0,
      completedElementIds: [],
      // keep failedElementIds to retry
    }));
    setQuizTargetStatus('unanswered');
    setShowResults(false);
  };

  const handleToggleMute = () => {
    const newMuted = sound.toggleMute();
    setIsMuted(newMuted);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          setActiveTargetElement(null);
          setPendingPlacementElement(null);
          setQuizTargetStatus('unanswered');
        }}
        onOpenHelp={() => setShowInstructions(true)}
        onResetGame={handleResetGame}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-4">
        {/* Score & Category Bar */}
        <ScoreBoard
          stats={stats}
          totalQuestions={filteredElements.length}
          currentCategory={currentCategory}
          onSelectCategory={(cat) => {
            sound.playClick();
            setCurrentCategory(cat);
            handleResetGame();
          }}
          categories={categoryTabs}
        />

        {/* 2-Zone Stage Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-stretch min-h-[560px]">
          {/* Left / Center Zone: Interactive Map */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-[480px]">
            <CataloniaMap
              elements={filteredElements}
              activeTargetElement={currentMode === 'quiz' ? activeTargetElement : null}
              targetStatus={currentMode === 'quiz' ? quizTargetStatus : 'unanswered'}
              selectedElementId={selectedStudyElement?.id}
              placedElementIds={stats.completedElementIds}
              pendingPlacementElement={currentMode === 'placement' ? pendingPlacementElement || filteredElements[0] : null}
              onTargetClick={handleMapTargetClick}
              onElementClick={(el) => {
                if (currentMode === 'study') {
                  setSelectedStudyElement(el);
                }
              }}
              showAllLabels={currentMode === 'study'}
              showReliefZones={true}
              highlightedElementId={
                currentMode === 'study'
                  ? selectedStudyElement?.id
                  : null
              }
              lastFeedback={lastFeedback}
              className="flex-1 shadow-sm"
            />
          </div>

          {/* Right Zone: Game Controller Deck */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            {currentMode === 'quiz' && (
              <QuizMode
                elements={filteredElements}
                onAnswer={handleQuizAnswer}
                onFinishGame={handleFinishGame}
                onActiveTargetChange={setActiveTargetElement}
                onTargetStatusChange={setQuizTargetStatus}
                placedElementIds={stats.completedElementIds}
              />
            )}

            {currentMode === 'placement' && (
              <PlacementMode
                elements={filteredElements}
                placedElementIds={stats.completedElementIds}
                onPlaceSuccess={(el) => {
                  sound.playSuccess();
                }}
                onPlaceError={(target, clicked) => {
                  sound.playError();
                }}
                onFinishGame={handleFinishGame}
                currentElementToPlace={pendingPlacementElement || filteredElements.find((e) => !stats.completedElementIds.includes(e.id)) || null}
                onSelectElementToPlace={(el) => setPendingPlacementElement(el)}
              />
            )}

            {currentMode === 'study' && (
              <StudyMode
                elements={filteredElements}
                selectedElement={selectedStudyElement}
                onSelectElement={(el) => setSelectedStudyElement(el)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Results Report Card Modal */}
      <ResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        stats={stats}
        totalQuestions={filteredElements.length}
        allElements={filteredElements}
        onRetryErrors={handleRetryErrors}
        onRestartAll={handleResetGame}
      />

      {/* Instructions & School Guidelines Modal */}
      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </div>
  );
}
