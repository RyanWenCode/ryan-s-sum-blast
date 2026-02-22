export enum GameMode {
  CLASSIC = 'CLASSIC',
  TIME = 'TIME'
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export interface BlockData {
  id: string;
  value: number;
  row: number;
  col: number;
  isSelected: boolean;
}

export interface GameState {
  grid: (BlockData | null)[][];
  targetSum: number;
  score: number;
  status: GameStatus;
  mode: GameMode;
  timeLeft: number;
  selectedIds: string[];
}
