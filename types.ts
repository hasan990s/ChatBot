export enum ViewState {
  HOME = 'HOME',
  CHAT = 'CHAT',
  VOICE = 'VOICE',
  GAME = 'GAME'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
}

export interface GameState {
  isPlaying: boolean;
  score: number;
  currentQuestion?: TriviaQuestion | null;
  loading: boolean;
  gameOver: boolean;
}