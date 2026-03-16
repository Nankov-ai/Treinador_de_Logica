import React from 'react';

interface DifficultySelectorProps {
  onSelect: (difficulty: 'easy' | 'medium' | 'hard' | 'expert') => void;
}

interface DifficultyCardProps {
    title: string;
    description: string;
    onClick: () => void;
}

const DifficultyCard: React.FC<DifficultyCardProps> = ({ title, description, onClick }) => (
    <button
        onClick={onClick}
        className="group w-full h-full text-left bg-slate-800 p-6 rounded-xl shadow-lg border-2 border-transparent hover:border-sky-500 hover:bg-slate-700/50 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
    >
        <h3 className="text-2xl font-bold text-sky-400 mb-2">{title}</h3>
        <p className="text-slate-400 group-hover:text-slate-300 transition-colors">{description}</p>
    </button>
);

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelect }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in text-center">
      <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2 animate-slide-in-down">Escolhe a tua Dificuldade</h2>
      <p className="text-slate-400 mb-8 sm:mb-12 animate-slide-in-down" style={{animationDelay: '100ms'}}>Podes mudar a qualquer momento.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="animate-slide-in-down" style={{animationDelay: '200ms'}}>
            <DifficultyCard 
                title="Fácil" 
                description="2 condições, lógica simples (AND, OR, NOT)." 
                onClick={() => onSelect('easy')}
            />
        </div>
        <div className="animate-slide-in-down" style={{animationDelay: '300ms'}}>
            <DifficultyCard 
                title="Médio" 
                description="3 condições, lógica combinada." 
                onClick={() => onSelect('medium')}
            />
        </div>
        <div className="animate-slide-in-down" style={{animationDelay: '400ms'}}>
            <DifficultyCard 
                title="Difícil" 
                description="Até 4 condições, desafios com parênteses." 
                onClick={() => onSelect('hard')}
            />
        </div>
        <div className="animate-slide-in-down" style={{animationDelay: '500ms'}}>
            <DifficultyCard 
                title="Especialista" 
                description="4 condições, lógica aninhada complexa." 
                onClick={() => onSelect('expert')}
            />
        </div>
      </div>
    </div>
  );
};