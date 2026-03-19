import React from 'react';
import { Link } from 'react-router-dom';

const OperatorCard: React.FC<{ title: string; operator: string; description: string; analogy: string; children?: React.ReactNode }> = ({ title, operator, description, analogy, children }) => (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-2xl font-bold mb-3">
            {title} <span className="font-mono text-sky-400 bg-slate-700/50 px-2 py-1 rounded">{operator}</span>
        </h3>
        <p className="text-slate-300 mb-4">{description}</p>
        <div className="border-l-4 border-sky-500 pl-4 py-2 bg-slate-900/50 rounded-r-md">
            <p className="text-slate-400 italic font-medium">Analogia:</p>
            <p className="text-slate-200">{analogy}</p>
        </div>
        {children}
    </div>
);

export const Help: React.FC = () => {
    return (
        <div className="w-full max-w-3xl mx-auto animate-fade-in text-white">
            <header className="text-center mb-8">
                <h2 className="text-4xl font-bold text-sky-400">Guia Rápido de Lógica</h2>
                <p className="text-slate-400 mt-2">Percebe os blocos de construção de toda a programação.</p>
            </header>
            <div className="space-y-6">
                <OperatorCard
                    title="O Operador E"
                    operator="AND"
                    description="Exige que TODAS as condições sejam verdadeiras para o resultado final ser verdadeiro. Se UMA condição for falsa, TUDO é falso."
                    analogy="Para fazer um bolo de chocolate, precisas de chocolate E farinha. Se te faltar um dos ingredientes, não podes fazer o bolo."
                />
                <OperatorCard
                    title="O Operador OU"
                    operator="OR"
                    description="Exige que PELO MENOS UMA condição seja verdadeira. O resultado só é falso se TODAS as condições forem falsas."
                    analogy="Para te divertires num sábado à noite, podes ir ao cinema OU jantar fora. Fazer uma das duas coisas (ou ambas!) é suficiente."
                />
                <OperatorCard
                    title="O Operador NÃO"
                    operator="NOT"
                    description="Inverte o valor de uma condição. O que é verdadeiro torna-se falso, e o que é falso torna-se verdadeiro."
                    analogy="Se a porta NÃO está trancada (ou seja, está destrancada), então podes entrar. O 'NÃO' inverte 'trancada' para o seu oposto."
                />
            </div>
            <div className="text-center mt-10">
                <Link
                    to="/"
                    className="inline-block text-lg font-bold py-3 px-8 bg-sky-600 hover:bg-sky-500 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                >
                    Voltar ao Jogo
                </Link>
            </div>
        </div>
    );
};