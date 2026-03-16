import React from 'react';

interface LevelIndicatorProps {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  streak: number;
}

const difficultyMap: Record<'easy' | 'medium' | 'hard' | 'expert', string> = {
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil',
    expert: 'Especialista'
};

const FireIcon: React.FC<{className?: string}> = ({className = 'w-5 h-5'}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.362-3.848 8.25 8.25 0 0 0 3-.539Z" />
    </svg>
);


export const LevelIndicator: React.FC<LevelIndicatorProps> = ({ difficulty, streak }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-lg mb-6 sm:mb-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <span className="text-base sm:text-lg font-bold text-sky-400">Dificuldade: {difficultyMap[difficulty]}</span>
        <div className="flex items-center gap-2 text-amber-400">
            <FireIcon />
            <span className="text-sm font-medium text-slate-200">
                <span className="font-bold text-amber-300">{streak}</span> em sequência
            </span>
        </div>
      </div>
    </div>
  );
};