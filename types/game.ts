export type BlockType = 'I' | 'L' | 'J' | 'O' | 'S' | 'T' | 'Z';

export interface Block {
  type: BlockType;
  shape: number[][];
  color: string;
}

export interface GameState {
  board: number[][];
  currentPieces: Block[];
  score: number;
  combo: number;
  lastScoreResult: {
    score: number;
    combo: number;
    linesCleared: number;
  } | null;
  previewBlock: Block | null;
  placedPiecesCount: number;
}

export interface GameSettings {
  width: number;
  height: number;
  initialPieces: number;
  maxPieces: number;
}

export interface ScoreResult {
  score: number;
  combo: number;
  linesCleared: number;
}

export interface BlockEvaluation {
  difficulty: number;
  scorePotential: number;
}

export interface GameLog {
  timestamp: number;
  event: 'piece_placed' | 'line_cleared' | 'combo' | 'game_over';
  data: {
    piece?: Block;
    position?: { x: number; y: number };
    score?: number;
    combo?: number;
    linesCleared?: number;
  };
} 