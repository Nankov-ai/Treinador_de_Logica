import React from 'react';
import type { ScoreboardData } from '../types';

interface ScoreboardModalProps {
  scoreboardData: ScoreboardData;
  isVisible: boolean;
  onClose: () => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-700/50 rounded-xl text-center shadow-lg h-full">
    <div className="text-sky-400 mb-2 sm:mb-3">{icon}</div>
    <p className="text-3xl sm:text-4xl font-bold text-white">{value}</p>
    <p className="text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider">{label}</p>
  </div>
);

const RocketIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 3 4.5 4.5m-4.5-4.5v13.5m0-13.5L8.25 7.5M12.75 3v13.5m0 0L8.25 21M12.75 16.5l4.5 4.5M12.75 16.5l-4.5 4.5" />
    </svg>
);
const FireIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.362-3.848 8.25 8.25 0 0 0 3-.539Z" />
    </svg>
);
const PuzzleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5v2.25m0-2.25l2.25 1.313M4.5 9.75l2.25 1.313m0 0l2.25-1.313m-2.25 1.313v2.25m0 0l-2.25 1.313m2.25-1.313l2.25 1.313m0 0l2.25-1.313m-2.25 1.313v2.25m0 0l2.25 1.313m-2.25-1.313L9 15m0 0v-2.25m0 2.25l2.25 1.313M12 17.25l2.25-1.313m2.25 1.313l-2.25-1.313m0 0l2.25-1.313m2.25 1.313l-2.25 1.313m0 0v2.25m2.25-2.25l-2.25 1.313" />
    </svg>
);
const CheckBadgeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.745 3.745 0 0 1 3.296-1.043A3.745 3.745 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
);

const levelMap: { [key: number]: string } = {
    1: 'Fácil',
    2: 'Médio',
    3: 'Difícil',
    4: 'Especialista'
};

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({ scoreboardData, isVisible, onClose }) => {
  if (!isVisible) return null;

  const stats = [
    { icon: <RocketIcon />, label: "Nível Mais Alto", value: levelMap[scoreboardData.highestLevel] ?? 'Fácil', delay: '100ms' },
    { icon: <FireIcon />, label: "Melhor Sequência", value: scoreboardData.longestStreak, delay: '200ms' },
    { icon: <PuzzleIcon />, label: "Exercícios Concluídos", value: scoreboardData.totalExercises, delay: '300ms' },
    { icon: <CheckBadgeIcon />, label: "Respostas Certas", value: scoreboardData.totalCorrect, delay: '400ms' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="w-full max-w-md sm:max-w-2xl bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-sky-400">Painel de Desempenho</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700" aria-label="Fechar painel">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            {stats.map((stat, index) => (
                <div key={index} className="animate-slide-in-down" style={{ animationDelay: stat.delay }}>
                    <StatCard icon={stat.icon} label={stat.label} value={stat.value} />
                </div>
            ))}
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full text-lg font-bold py-3 px-8 bg-slate-600 hover:bg-slate-500 rounded-lg shadow-lg transition-transform transform hover:scale-105"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};