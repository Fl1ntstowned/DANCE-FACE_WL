export type GameState = 'menu' | 'playing' | 'paused' | 'results';

export type ArrowDirection = 'left' | 'down' | 'up' | 'right';

export type JudgmentType = 'perfect' | 'great' | 'good' | 'miss';

export interface GameScore {
  points: number;
  combo: number;
  maxCombo: number;
  perfect: number;
  great: number;
  good: number;
  miss: number;
  accuracy: number;
}

export interface Arrow {
  id: string;
  direction: ArrowDirection;
  position: number; // Y position
  targetTime: number;
  speed: number;
  hit: boolean;
  judgment?: JudgmentType;
}

export interface PlayerData {
  address: string;
  username?: string;
  highScore: number;
  totalGames: number;
  perfectHits: number;
  whitelistEligible: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  username?: string;
  score: number;
  combo: number;
  accuracy: number;
  grade: string;
  timestamp: number;
}

export interface Song {
  id: string;
  name: string;
  artist: string;
  bpm: number;
  duration: number;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
    extreme: number;
  };
  noteChart: NoteChart;
}

export interface NoteChart {
  [difficulty: string]: Note[];
}

export interface Note {
  time: number; // Time in ms when the note should be hit
  direction: ArrowDirection;
  holdDuration?: number; // For hold notes (future feature)
}