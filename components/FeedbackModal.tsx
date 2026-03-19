
import React from 'react';
import Confetti from './Confetti';

interface FeedbackModalProps {
  isCorrect: boolean;
  explanation: string;
  onNext: () => void;
  isLoading: boolean;
}

const CheckIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const XCircleIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isCorrect, explanation, onNext, isLoading }) => {
  const explanationHtml = explanation
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/<incorrect>(.*?)<\/incorrect>/gs, '<div class="explanation-incorrect">$1</div>')
    .replace(/<correct>(.*?)<\/correct>/gs, '<div class="explanation-correct">$1</div>')
    .replace(/\n/g, '<br />');

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {isCorrect && <Confetti />}
        <div className="relative z-20 flex flex-col items-center text-center">
          {isCorrect ? (
            <>
              <CheckIcon className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mb-4 animate-icon-pop" />
              <h2 className="text-3xl sm:text-4xl font-bold text-green-400 animate-slide-in-down" style={{animationDelay: '150ms'}}>Correto!</h2>
            </>
          ) : (
            <>
              <XCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 mb-4 animate-icon-pop" />
              <h2 className="text-3xl sm:text-4xl font-bold text-red-400 animate-slide-in-down" style={{animationDelay: '150ms'}}>Quase lá!</h2>
            </>
          )}
        </div>
        
        <div 
            className="relative z-20 text-slate-300 text-lg leading-relaxed space-y-4 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: explanationHtml }}
        />

        <div className="relative z-20 pt-4">
          <button
            onClick={onNext}
            disabled={isLoading}
            className="w-full text-lg font-bold py-4 px-8 bg-sky-600 hover:bg-sky-500 rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'A gerar o próximo desafio...' : 'Próxima Pergunta'}
          </button>
        </div>
      </div>
    </div>
  );
};
