
import React from 'react';
import type { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  onSubmit: (userChoice: boolean) => void;
  isLoading: boolean;
  onHintRequest: () => void;
  hint: string | null;
  isHintLoading: boolean;
  hintUsed: boolean;
}

const LightbulbIcon: React.FC<{className?: string}> = ({className = "w-5 h-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-1.835a6.01 6.01 0 0 0 0-3.33c0-1.298-.4-2.496-1.084-3.416a5.98 5.98 0 0 0-5.832 0A5.98 5.98 0 0 0 5.25 9.75c0 1.298.4 2.496 1.084 3.416A6.01 6.01 0 0 0 7.5 12.75m4.5 0v5.25m0 0a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25m0 0v-5.25" />
    </svg>
);

const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75" />
    </svg>
);

const XIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onSubmit, isLoading, onHintRequest, hint, isHintLoading, hintUsed }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-sky-400 mb-2 animate-slide-in-down">Cenário</h2>
        <p className="text-slate-300 text-lg leading-relaxed animate-slide-in-down" style={{animationDelay: '100ms'}}>{exercise.scenario}</p>
      </div>

      <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-300 animate-slide-in-down" style={{animationDelay: '200ms'}}>Condições:</h3>
          <ul className="space-y-3">
              {/* FIX: Use Object.keys to iterate over exercise.inputs for proper type inference. Object.entries was incorrectly inferring the value type as 'unknown'. */}
              {Object.keys(exercise.inputs).map((key, index) => {
                const input = exercise.inputs[key];
                return (
                <li key={key} className="flex items-center p-3 bg-slate-700/50 rounded-lg animate-slide-in-down" style={{ animationDelay: `${300 + index * 100}ms`}}>
                    {input.value ? (
                        <CheckIcon className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                    ) : (
                        <XIcon className="w-6 h-6 text-red-400 mr-3 flex-shrink-0" />
                    )}
                    <span className="text-slate-200">{input.question}</span>
                </li>
              );
            })}
          </ul>
      </div>

      <div className="border-t border-slate-700 pt-6">
        <div className="flex justify-center mb-6">
            <button
                onClick={onHintRequest}
                disabled={isLoading || isHintLoading || hintUsed}
                className="flex items-center gap-2 py-2 px-5 bg-amber-600/80 hover:bg-amber-600 text-white rounded-lg shadow-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
                <LightbulbIcon />
                {isHintLoading ? 'A gerar...' : (hintUsed ? 'Dica Usada' : 'Pedir Dica')}
            </button>
        </div>

        {hint && (
            <div className="mb-6 p-4 bg-slate-700/60 border border-slate-600 rounded-lg text-center animate-slide-in-down">
                <p className="text-amber-300 font-medium">{hint}</p>
            </div>
        )}

        <p className="text-xl sm:text-2xl font-bold text-center text-slate-100 mb-6">{exercise.output}?</p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => onSubmit(true)}
            disabled={isLoading}
            className="w-full text-lg font-bold py-4 px-8 bg-green-600 hover:bg-green-500 rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            Sim
          </button>
          <button
            onClick={() => onSubmit(false)}
            disabled={isLoading}
            className="w-full text-lg font-bold py-4 px-8 bg-red-600 hover:bg-red-500 rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            Não
          </button>
        </div>
      </div>
    </div>
  );
};
