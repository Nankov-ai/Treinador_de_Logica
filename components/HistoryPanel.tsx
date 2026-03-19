
import React, { useState } from 'react';
import type { HistoryEntry } from '../types';

interface HistoryPanelProps {
  history: HistoryEntry[];
  isVisible: boolean;
  onClose: () => void;
}

const HistoryItem: React.FC<{ entry: HistoryEntry; index: number }> = ({ entry, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { exercise, userAnswers, userChoice, isCorrect, explanation, hint, hintUsed } = entry;

  const explanationHtml = explanation
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/<incorrect>(.*?)<\/incorrect>/gs, '<div class="explanation-incorrect">$1</div>')
    .replace(/<correct>(.*?)<\/correct>/gs, '<div class="explanation-correct">$1</div>')
    .replace(/\n/g, '<br />');

  return (
    <div className={`bg-slate-800 rounded-lg overflow-hidden transition-all duration-300 ${isCorrect ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-700/50"
        aria-expanded={isExpanded}
      >
        <div>
          <p className="text-sm text-slate-400">Exercício #{index + 1}</p>
          <p className="font-semibold text-slate-200 truncate max-w-xs sm:max-w-sm">{exercise.scenario}</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {isExpanded && (
        <div className="p-4 border-t border-slate-700/50 space-y-4 animate-fade-in-fast">
          <div>
            <h4 className="font-bold text-sky-400 mb-2">Condições:</h4>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              {Object.entries(userAnswers).map(([key, value]) => (
                <li key={key}>{exercise.inputs[key].question}: <span className="font-semibold">{value ? 'Sim' : 'Não'}</span></li>
              ))}
            </ul>
            <p className="mt-2">Para a ação <span className="font-semibold">"{exercise.output}"</span>, a tua resposta foi: <span className="font-semibold">{userChoice ? 'Sim' : 'Não'}</span>.</p>
          </div>
          {hintUsed && hint && (
            <div>
                <h4 className="font-bold text-amber-400 mb-2">Dica Usada:</h4>
                <p className="italic text-slate-400">"{hint}"</p>
            </div>
          )}
          <div>
            <h4 className="font-bold text-sky-400 mb-2">Feedback:</h4>
            <div
              className="text-slate-300 text-base leading-relaxed space-y-4 prose prose-invert max-w-none prose-p:my-1 prose-strong:text-slate-100"
              dangerouslySetInnerHTML={{ __html: explanationHtml }}
            />
          </div>
        </div>
      )}
    </div>
  );
};


export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity animate-fade-in-fast"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 id="history-title" className="text-2xl font-bold text-sky-400">Histórico de Exercícios</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700" aria-label="Fechar histórico">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-65px)] custom-scrollbar">
          {history.length === 0 ? (
            <p className="text-center text-slate-400 pt-8">Ainda não completaste nenhum exercício.</p>
          ) : (
            [...history].reverse().map((entry, index) => (
              <div key={index} className="animate-slide-in-down" style={{ animationDelay: `${index * 80}ms`}}>
                <HistoryItem entry={entry} index={history.length - 1 - index} />
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
};
