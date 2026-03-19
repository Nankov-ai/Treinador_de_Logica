import { GoogleGenAI, Type } from "@google/genai";
import type { Exercise } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const exerciseSchema = {
  type: Type.OBJECT,
  properties: {
    scenario: {
      type: Type.STRING,
      description: 'Um cenário breve e envolvente do mundo real. Deve descrever o estado de cada condição de entrada. Em português de Portugal.',
    },
    inputs: {
      type: Type.ARRAY,
      description: 'Uma lista de objetos de entrada, cada um com uma chave, uma pergunta e um valor booleano predefinido.',
      items: {
        type: Type.OBJECT,
        properties: {
          key: {
            type: Type.STRING,
            description: 'O identificador da entrada em camelCase (ex: "isSunny").',
          },
          question: {
            type: Type.STRING,
            description: 'A pergunta que descreve a condição (ex: "Está sol?").',
          },
          value: {
            type: Type.BOOLEAN,
            description: 'O estado predefinido da condição (verdadeiro ou falso).'
          }
        },
        required: ['key', 'question', 'value'],
      },
    },
    logic: {
      type: Type.STRING,
      description: 'Uma expressão lógica usando as chaves de entrada e os operadores AND, OR, NOT. Por exemplo: "(isSunny AND hasSunscreen) OR isIndoors".',
    },
    output: {
      type: Type.STRING,
      description: 'O nome do resultado ou ação final, que o utilizador vai avaliar com sim/não. Em português de Portugal.',
    },
  },
  required: ['scenario', 'inputs', 'logic', 'output'],
};

const fallbackExercise: Exercise = {
    scenario: "Está um dia de sol e tens protetor solar. A regra para ir à praia é: tem de estar sol E ter protetor solar.",
    inputs: { 
        "isSunny": { question: "Está sol?", value: true },
        "hasSunscreen": { question: "Tem protetor solar?", value: true }
    },
    logic: "isSunny AND hasSunscreen",
    output: "Ir à praia"
};

export const generateNewExercise = async (level: number): Promise<Exercise> => {
    let prompt;
    let complexity;
    let numInputs;

    if (level === 1) {
        complexity = "muito simples, com 2 entradas e apenas um operador AND ou OR.";
        numInputs = 2;
    } else if (level === 2) {
        complexity = "simples, com 2 entradas, introduzindo o operador NOT. A lógica deve incluir NOT e outro operador (AND ou OR).";
        numInputs = 2;
    } else if (level === 3) {
        complexity = "intermédio, com 3 entradas e uma combinação de AND e OR.";
        numInputs = 3;
    } else if (level === 4) {
        complexity = "desafiador, com 3 entradas e uma combinação de AND, OR, e NOT.";
        numInputs = 3;
    } else if (level <= 6) {
        complexity = "complexo, com 4 entradas e uma combinação elaborada de operadores, incluindo o uso de parênteses para agrupar condições.";
        numInputs = 4;
    } else {
        complexity = "de especialista, com 4 entradas e lógica aninhada (parênteses dentro de parênteses) para um desafio máximo. Por exemplo: ((inputA AND inputB) OR NOT inputC) AND inputD.";
        numInputs = 4;
    }

    const themes = [
        "Exploração Espacial", "Aventura de Fantasia", "Mistério de Detetives", "Culinária Internacional", "Mundo da Ficção Científica", "Espionagem e Agentes Secretos", "Biologia Marinha", "Gestão de um Parque de Diversões", "Arqueologia e Tesouros Antigos", "Inovações Tecnológicas", "Robótica", "Exploração Submarina", "Gestão de Tráfego Aéreo", "Biologia Genética", "Mitologia", "Construção de Edifícios", "Vida Selvagem", "Equipamento de Desporto", "Inteligência Artificial", "Arte e Música"
    ];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];

    prompt = `Cria um novo quebra-cabeças lógico para ensinar algoritmos. O quebra-cabeças deve ser ${complexity}.
    O idioma deve ser Português de Portugal. As chaves de 'inputs' devem estar em camelCase em inglês.

    **Regras Importantes:**
    1.  O 'scenario' TEM de descrever o estado (verdadeiro/falso) de cada condição de 'inputs'. O utilizador não escolhe os estados, apenas lê o cenário e responde à pergunta final.
    2.  Gera um valor booleano ('value') para cada entrada.
    3.  O utilizador responderá 'sim' ou 'não' à possibilidade de o 'output' acontecer com base nas condições dadas no cenário.

    Exemplo para um quebra-cabeças de 2 entradas com tema de praia:
    {
        "scenario": "Imagina que está um dia de sol, mas esqueceste-te do protetor solar em casa. A regra para ir à praia é clara: tem de estar sol E tens de ter protetor solar.",
        "inputs": [
            { "key": "isSunny", "question": "Está sol?", "value": true },
            { "key": "hasSunscreen", "question": "Tem protetor solar?", "value": false }
        ],
        "logic": "isSunny AND hasSunscreen",
        "output": "Podes ir à praia"
    }

    Cria um novo com ${numInputs} entradas, baseado no tema: "${randomTheme}".
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: exerciseSchema,
            },
        });

        const jsonText = response.text.trim();
        const rawExercise = JSON.parse(jsonText);
        
        // Robust validation to prevent render crashes from malformed AI responses
        if (
            typeof rawExercise.scenario !== 'string' ||
            typeof rawExercise.logic !== 'string' ||
            typeof rawExercise.output !== 'string' ||
            !Array.isArray(rawExercise.inputs)
        ) {
            console.error("Generated exercise from AI has invalid structure or types:", rawExercise);
            throw new Error("Generated exercise from AI has invalid structure or types.");
        }

        const inputsObject: { [key: string]: { question: string; value: boolean } } = {};
        for (const item of rawExercise.inputs) {
            if (item && typeof item.key === 'string' && typeof item.question === 'string' && typeof item.value === 'boolean') {
                inputsObject[item.key] = { question: item.question, value: item.value };
            } else {
                console.warn("Skipping malformed input item from AI:", item);
            }
        }
        
        if (Object.keys(inputsObject).length === 0) {
          throw new Error("Generated exercise has no valid inputs after processing.");
        }
        
        const generatedExercise: Exercise = {
            scenario: rawExercise.scenario,
            inputs: inputsObject,
            logic: rawExercise.logic,
            output: rawExercise.output,
        };

        return generatedExercise;
    } catch (error) {
        console.error("Error generating new exercise:", error);
        return fallbackExercise;
    }
};

export const getExplanationForAnswer = async (exercise: Exercise, userAnswers: { [key: string]: boolean }, userChoice: boolean, isCorrect: boolean, hintUsed?: boolean): Promise<string> => {
    const hintMessage = hintUsed && isCorrect ? "\n\n**Excelente utilização da dica!** Usar uma dica e chegar à resposta correta é uma ótima forma de aprender. Isto mostra que conseguiste ligar os pontos e entender a lógica. Embora a tua sequência de acertos não aumente desta vez, a tua aprendizagem certamente aumentou. Continua assim!" : "";

    const prompt = `
    Um utilizador está a aprender sobre operações lógicas. Ele respondeu a um quebra-cabeças.
    
    Cenário: ${exercise.scenario}
    Lógica: ${exercise.logic}
    
    As condições dadas eram:
    ${Object.entries(userAnswers).map(([key, value]) => `- ${exercise.inputs[key].question}: ${value ? 'Sim (Verdadeiro)' : 'Não (Falso)'}`).join('\n')}
    
    A ação a ser avaliada era: "${exercise.output}"
    
    O resultado correto da lógica era: ${evaluateLogic(exercise.logic, userAnswers) ? 'Sim' : 'Não'}.
    O utilizador respondeu: ${userChoice ? 'Sim' : 'Não'}.
    
    A resposta do utilizador foi ${isCorrect ? 'CORRETA' : 'INCORRETA'}.
    
    **A tua tarefa:**
    ${isCorrect 
        ? `1.  Dá os parabéns ao utilizador de forma calorosa e encorajadora.
    2.  **Explica o porquê passo a passo, decompondo a expressão lógica (${exercise.logic}) de forma clara para reforçar a aprendizagem.**`
        : `1.  Com gentileza, explica que a resposta não está correta.
    2.  **Mostra a avaliação passo a passo da expressão lógica (${exercise.logic}) para encontrar o resultado correto.**
    3.  **A seguir, contrasta o caminho correto com o possível erro do utilizador. Usa as seguintes tags para isso:**
        -   Envolve a explicação do raciocínio **incorreto** com \`<incorrect>...</incorrect>\`.
        -   Envolve a explicação do raciocínio **correto** com \`<correct>...</correct>\`.
    
    **Exemplo de como usar as tags:**
    <incorrect>O teu raciocínio: Provavelmente pensaste que (verdadeiro E falso) era verdadeiro. É um erro comum!</incorrect>
    <correct>O caminho certo: A lógica (verdadeiro E falso) resulta em falso, porque o operador 'E' exige que AMBAS as condições sejam verdadeiras para o resultado ser verdadeiro.</correct>
    4.  Para solidificar a aprendizagem, cria uma **analogia completamente diferente** da vida real para explicar a lógica do exercício. A analogia deve ser simples, visual e fácil de lembrar.
    5.  Termina com uma mensagem motivacional para o utilizador continuar a aprender.`
    }

    **COMO DECOMPOR A LÓGICA (Segue estes passos):**
    1.  **Substituir as variáveis:** Começa por substituir as chaves de entrada pelos seus valores (verdadeiro/falso).
    2.  **Resolver Parênteses Primeiro:** Se houver parênteses, resolve a lógica dentro deles primeiro. Se houver parênteses aninhados, começa pelos mais interiores.
    3.  **Seguir a Ordem dos Operadores:** Depois dos parênteses, a ordem é: primeiro NÃO (NOT), depois E (AND), e por último OU (OR).
    4.  **Mostrar cada passo:** Apresenta cada simplificação como um passo distinto.

    **EXEMPLO DE DECOMPOSIÇÃO PARA A LÓGICA "(isReady AND NOT isRaining) OR hasSpecialPass":**
    - **Valores:** isReady = verdadeiro, isRaining = falso, hasSpecialPass = verdadeiro.
    - **Passo 1 (Substituir):** A expressão torna-se \`(verdadeiro E NÃO falso) OU verdadeiro\`.
    - **Passo 2 (Resolver NÃO):** Dentro do parêntese, \`NÃO falso\` torna-se \`verdadeiro\`. A expressão agora é \`(verdadeiro E verdadeiro) OU verdadeiro\`.
    - **Passo 3 (Resolver Parêntese):** Agora, \`(verdadeiro E verdadeiro)\` torna-se \`verdadeiro\`. A expressão fica \`verdadeiro OU verdadeiro\`.
    - **Passo 4 (Resultado Final):** Finalmente, \`verdadeiro OU verdadeiro\` é \`verdadeiro\`.
    ${hintMessage}
    
    Usa o Português de Portugal. Formata a tua resposta usando markdown (negrito, listas), mas certifica-te de que as tags <incorrect> e <correct> estão presentes quando a resposta estiver incorreta.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating explanation:", error);
        return "Ocorreu um erro ao gerar a explicação. Por favor, tenta novamente.";
    }
};

export const generateHint = async (exercise: Exercise): Promise<string> => {
    const prompt = `
    Um utilizador está preso num quebra-cabeças lógico e pediu uma dica.

    Cenário: ${exercise.scenario}
    Lógica: ${exercise.logic}
    Ação a avaliar: ${exercise.output}
    As condições já estão definidas no cenário.

    **A tua tarefa:**
    Fornece uma dica útil, mas subtil, que ajude o utilizador a pensar na direção certa sem revelar a resposta final. A dica deve ser curta (uma frase).
    
    **Exemplos de boas dicas:**
    - "Concentra-te em como o operador 'OU' funciona na primeira parte da expressão."
    - "O que acontece com o resultado final se a condição '${Object.keys(exercise.inputs)[0]}' for falsa?"
    - "Lembra-te que para 'E' ser verdadeiro, ambas as condições precisam de ser verdadeiras."

    **NÃO DÊS A RESPOSTA.** Apenas guia o pensamento. Mantém a dica em Português de Portugal.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating hint:", error);
        return "Não foi possível gerar uma dica de momento. Tenta resolver sem uma!";
    }
};


export const evaluateLogic = (logic: string, answers: { [key: string]: boolean }): boolean => {
  try {
    let expression = logic;
    for (const key in answers) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      expression = expression.replace(regex, answers[key].toString());
    }
    
    expression = expression
      .replace(/\bAND\b/gi, '&&')
      .replace(/\bOR\b/gi, '||')
      .replace(/\bNOT\b/gi, '!');
      
    if (/[^a-zA-Z0-9&|!().\s]/.test(expression)) {
      console.error("Invalid characters in expression:", expression);
      return false;
    }
    
    return new Function(`return ${expression}`)();
  } catch (error) {
    console.error("Error evaluating logic:", error, {logic, answers});
    return false;
  }
};