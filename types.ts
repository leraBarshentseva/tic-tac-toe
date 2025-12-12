export type Player = 'X' | 'O' | null;

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST',
  DRAW = 'DRAW',
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameTheme = 'flowers' | 'hearts' | 'cats';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface AppSettings {
  telegram: TelegramConfig;
  difficulty: Difficulty;
  theme: GameTheme;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface WinResult {
  winner: Player | 'DRAW';
  line?: number[]; // Indices of the winning squares
}

export interface GameState {
  board: Player[];
  status: GameStatus;
  result: WinResult | null;
  promoCode?: string;
}