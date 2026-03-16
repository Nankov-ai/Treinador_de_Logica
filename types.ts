
export interface Exercise {
  scenario: string;
  inputs: { [key: string]: { question: string; value: boolean } };
  logic: string;
  output: string;
}

export type GameState = 'playing' | 'feedback' | 'loading' | 'error';

export interface HistoryEntry {
  exercise: Exercise;
  userAnswers: { [key: string]: boolean }; // These are the predefined input states
  userChoice: boolean;
  isCorrect: boolean;
  explanation: string;
  hintUsed?: boolean;
  hint?: string | null;
}

export interface ScoreboardData {
  highestLevel: number;
  longestStreak: number;
  totalExercises: number;
  totalCorrect: number;
}
