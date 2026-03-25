import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { generateNewExercise, getExplanationForAnswer, evaluateLogic, generateHint } from './services/geminiService';
import type { Exercise, GameState, HistoryEntry, ScoreboardData } from './types';
import { ExerciseCard } from './components/ExerciseCard';
import { FeedbackModal } from './components/FeedbackModal';
import { LevelIndicator } from './components/LevelIndicator';
import { HistoryPanel } from './components/HistoryPanel';
import { HistoryIcon } from './components/HistoryIcon';
import { ScoreboardIcon } from './components/ScoreboardIcon';
import { ScoreboardModal } from './components/ScoreboardModal';
import { Help } from './components/Help';
import { HelpIcon } from './components/HelpIcon';
import { DifficultySelector } from './components/DifficultySelector';
import { ChangeDifficultyIcon } from './components/ChangeDifficultyIcon';

const PROGRESS_STORAGE_KEY = 'logicTrainerProgress';
const SCOREBOARD_STORAGE_KEY = 'logicTrainerScoreboard';

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-sky-500"></div>
    </div>
);

const ErrorDisplay: React.FC<{ message: string, onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="text-center p-8 bg-red-900/50 rounded-lg">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Oops! Algo correu mal.</h2>
        <p className="text-red-200 mb-6">{message}</p>
        <button onClick={onRetry} className="py-2 px-6 bg-sky-600 hover:bg-sky-500 rounded-lg font-semibold">Tentar Novamente</button>
    </div>
);

const loadProgress = (): { streak: number; history: HistoryEntry[] } => {
    try {
        const savedData = localStorage.getItem(PROGRESS_STORAGE_KEY);
        if (savedData) {
            const { correctAnswersStreak, streak, history } = JSON.parse(savedData);
            const currentStreak = streak ?? correctAnswersStreak ?? 0;

            if (typeof currentStreak === 'number' && Array.isArray(history)) {
                
                // Data migration to handle old history entries where `inputs` was an array.
                const migratedHistory = history.map(entry => {
                    // Check if the entry needs migration (inputs is an array)
                    if (entry.exercise && Array.isArray(entry.exercise.inputs)) {
                        const inputsObject: { [key: string]: { question: string; value: boolean } } = {};
                        (entry.exercise.inputs as any[]).forEach(input => {
                            if (input && typeof input.key === 'string' && typeof input.question === 'string' && typeof input.value === 'boolean') {
                                inputsObject[input.key] = { question: input.question, value: input.value };
                            }
                        });
                        
                        // If migration resulted in a valid object, update the entry
                        if (Object.keys(inputsObject).length > 0) {
                            return {
                                ...entry,
                                exercise: {
                                    ...entry.exercise,
                                    inputs: inputsObject,
                                }
                            };
                        }
                        return null; // Mark entry for removal if migration fails
                    }
                    // Also validate existing entries to ensure they are not corrupted
                    if (!entry || !entry.exercise || typeof entry.exercise.inputs !== 'object' || entry.exercise.inputs === null) {
                        return null; // Mark corrupted entries for removal
                    }
                    return entry;
                }).filter((entry): entry is HistoryEntry => entry !== null); // Filter out invalid/corrupted entries

                return { streak: currentStreak, history: migratedHistory };
            }
        }
    } catch (error) {
        console.error("Failed to load progress from localStorage:", error);
        localStorage.removeItem(PROGRESS_STORAGE_KEY);
    }
    return { streak: 0, history: [] };
};

const loadScoreboard = (): ScoreboardData => {
    try {
        const savedData = localStorage.getItem(SCOREBOARD_STORAGE_KEY);
        if (savedData) {
            const data = JSON.parse(savedData);
            if (typeof data.highestLevel === 'number' && typeof data.longestStreak === 'number' && typeof data.totalExercises === 'number' && typeof data.totalCorrect === 'number') {
                return data;
            }
        }
    } catch (error) {
        console.error("Failed to load scoreboard from localStorage:", error);
        localStorage.removeItem(SCOREBOARD_STORAGE_KEY);
    }
    return { highestLevel: 1, longestStreak: 0, totalExercises: 0, totalCorrect: 0 };
};


export default function App() {
  const [initialProgress] = useState(loadProgress);
  
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert' | null>(null);
  const [streak, setStreak] = useState(initialProgress.streak);
  const [history, setHistory] = useState<HistoryEntry[]>(initialProgress.history);
  
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: boolean }>({});
  const [gameState, setGameState] = useState<GameState>('playing');
  const [feedback, setFeedback] = useState({ explanation: '', isCorrect: false });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [hintUsed, setHintUsed] = useState<boolean>(false);
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);

  const [scoreboard, setScoreboard] = useState<ScoreboardData>(loadScoreboard);
  const [isScoreboardVisible, setIsScoreboardVisible] = useState(false);


  const loadExercise = useCallback(async (currentDifficulty: 'easy' | 'medium' | 'hard' | 'expert') => {
    setGameState('loading');
    setError(null);
    setHint(null);
    setHintUsed(false);
    try {
      let targetLevel: number;
      if (currentDifficulty === 'easy') {
          targetLevel = Math.floor(Math.random() * 2) + 1; // Levels 1-2
      } else if (currentDifficulty === 'medium') {
          targetLevel = Math.floor(Math.random() * 2) + 3; // Levels 3-4
      } else if (currentDifficulty === 'hard') {
          targetLevel = Math.floor(Math.random() * 2) + 5; // Levels 5-6
      } else { // expert
          targetLevel = Math.floor(Math.random() * 2) + 7; // Levels 7-8
      }

      const exercise = await generateNewExercise(targetLevel);
      setCurrentExercise(exercise);
      
      const predefinedAnswers: { [key: string]: boolean } = {};
      Object.keys(exercise.inputs).forEach(key => {
        predefinedAnswers[key] = exercise.inputs[key].value;
      });
      setUserAnswers(predefinedAnswers);

      setGameState('playing');
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar o próximo desafio. Verifica a tua ligação ou chave de API.');
      setGameState('error');
    }
  }, []);

  useEffect(() => {
    try {
      const progress = { streak, history };
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error("Failed to save progress to localStorage:", error);
    }
  }, [streak, history]);

  useEffect(() => {
    try {
        localStorage.setItem(SCOREBOARD_STORAGE_KEY, JSON.stringify(scoreboard));
    } catch (error) {
        console.error("Failed to save scoreboard to localStorage:", error);
    }
  }, [scoreboard]);

  const handleRequestHint = async () => {
    if (!currentExercise || hintUsed) return;
    setIsHintLoading(true);
    try {
        const generatedHint = await generateHint(currentExercise);
        setHint(generatedHint);
        setHintUsed(true);
    } catch (err) {
        console.error("Failed to get hint:", err);
        setHint("Desculpa, não foi possível obter uma dica agora.");
    } finally {
        setIsHintLoading(false);
    }
  };

  const handleSubmit = async (userChoice: boolean) => {
    if (!currentExercise) return;
    
    setIsSubmitting(true);
    const correctAnswer = evaluateLogic(currentExercise.logic, userAnswers);
    const isCorrect = userChoice === correctAnswer;

    try {
        const explanation = await getExplanationForAnswer(currentExercise, userAnswers, userChoice, isCorrect, hintUsed);
        setFeedback({ explanation, isCorrect });

        const historyEntry: HistoryEntry = {
          exercise: currentExercise,
          userAnswers,
          userChoice,
          isCorrect,
          explanation,
          hintUsed: hintUsed,
          hint: hint,
        };
        setHistory(prev => [...prev, historyEntry]);

        let newStreak = streak;
        if (isCorrect && !hintUsed) {
            newStreak = streak + 1;
            setStreak(newStreak);
        } else if (!isCorrect) {
            newStreak = 0;
            setStreak(0);
        }

        setScoreboard(prev => ({
            ...prev,
            totalExercises: prev.totalExercises + 1,
            totalCorrect: isCorrect ? prev.totalCorrect + 1 : prev.totalCorrect,
            longestStreak: Math.max(prev.longestStreak, newStreak),
            highestLevel: Math.max(prev.highestLevel, difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : difficulty === 'hard' ? 3 : 4)
        }));

        setGameState('feedback');
    } catch(err) {
        console.error(err);
        setError("Falha ao obter a explicação. Tenta novamente.");
        setGameState('error');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (difficulty) {
        loadExercise(difficulty);
    }
  };

  const handleSelectDifficulty = (selectedDifficulty: 'easy' | 'medium' | 'hard' | 'expert') => {
    setDifficulty(selectedDifficulty);
    setStreak(0);
    loadExercise(selectedDifficulty);
  };
  
  const renderContent = () => {
    switch(gameState) {
        case 'loading':
            return <LoadingSpinner />;
        case 'error':
            return <ErrorDisplay message={error!} onRetry={() => difficulty && loadExercise(difficulty)} />;
        case 'playing':
            return currentExercise && (
                <ExerciseCard 
                    exercise={currentExercise}
                    onSubmit={handleSubmit}
                    isLoading={isSubmitting}
                    onHintRequest={handleRequestHint}
                    hint={hint}
                    isHintLoading={isHintLoading}
                    hintUsed={hintUsed}
                />
            );
        default:
            return null;
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 selection:bg-sky-300 selection:text-sky-900">
      <div className="w-full max-w-4xl mx-auto">
        <header className="relative text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-1">
            <img src={`${import.meta.env.BASE_URL}nodeflow_icon.svg`} alt="Nodeflow" className="h-7 w-7" />
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 pb-2">
              <Link to="/" onClick={() => setDifficulty(null)} className="hover:opacity-80 transition-opacity">Treinador de Lógica</Link>
            </h1>
          </div>
          <p className="text-slate-400 text-base sm:text-lg">Resolve quebra-cabeças em cenários fantásticos e aprende a pensar como um computador.</p>
          <div className="absolute top-0 right-0 flex items-center gap-0 sm:gap-2">
             {difficulty && (
                <button
                onClick={() => setDifficulty(null)}
                className="p-2 sm:p-3 rounded-full text-slate-400 hover:text-sky-400 hover:bg-slate-700/50 transition-colors"
                aria-label="Mudar dificuldade"
                title="Mudar dificuldade"
                >
                <ChangeDifficultyIcon />
                </button>
            )}
            <button
              onClick={() => setIsScoreboardVisible(true)}
              className="p-2 sm:p-3 rounded-full text-slate-400 hover:text-sky-400 hover:bg-slate-700/50 transition-colors"
              aria-label="Ver painel de desempenho"
              title="Ver painel de desempenho"
            >
              <ScoreboardIcon />
            </button>
            <button
              onClick={() => setIsHistoryVisible(true)}
              className="p-2 sm:p-3 rounded-full text-slate-400 hover:text-sky-400 hover:bg-slate-700/50 transition-colors"
              aria-label="Rever histórico"
              title="Rever histórico"
            >
              <HistoryIcon />
            </button>
            <Link
              to="/help"
              className="p-2 sm:p-3 rounded-full text-slate-400 hover:text-sky-400 hover:bg-slate-700/50 transition-colors"
              aria-label="Ajuda e tutorial"
              title="Ajuda e tutorial"
            >
              <HelpIcon />
            </Link>
          </div>
        </header>

        <Routes>
          <Route path="/" element={
            !difficulty ? (
                <DifficultySelector onSelect={handleSelectDifficulty} />
            ) : (
                <>
                {gameState !== 'loading' && gameState !== 'error' && (
                    <LevelIndicator 
                        difficulty={difficulty}
                        streak={streak}
                    />
                )}
                
                <div className="relative">
                    {renderContent()}
                </div>

                {gameState === 'feedback' && (
                    <FeedbackModal 
                        isCorrect={feedback.isCorrect}
                        explanation={feedback.explanation}
                        onNext={handleNextQuestion}
                        isLoading={isSubmitting}
                    />
                )}
                </>
            )
          } />
          <Route path="/help" element={<Help />} />
        </Routes>
      </div>

      <HistoryPanel
        history={history}
        isVisible={isHistoryVisible}
        onClose={() => setIsHistoryVisible(false)}
      />

      <ScoreboardModal
        scoreboardData={scoreboard}
        isVisible={isScoreboardVisible}
        onClose={() => setIsScoreboardVisible(false)}
      />
    </main>
  );
}