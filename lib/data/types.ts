export type Matrix = number[][];

export interface Block {
    id: string;
    name: string;
    matrix: Matrix;
    difficulty: 'easy' | 'medium' | 'hard';
    FIGURE_TO_OFTEN?: number;
}

export interface Position {
    x: number;
    y: number;
}

export interface ScoreResult {
    clearedLines: number;
    cellsPlaced: number;
    placedBlocksPoints: number;
    clearedLinesPoints: number;
    clearedBlocksPoints: number;
    comboLevel: number;
    comboBonus: number;
    isBoardCleared: boolean;
    totalPoints: number;
}

export interface GameState {
    board: Matrix;
    currentPieces: Block[];
    score: number;
    gameOver: boolean;
    draggedPiece: Block | null;
    lastScoreResult: ScoreResult | null;
}