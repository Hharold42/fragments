export type Matrix = number[][];

export interface Block {
    id: string;
    name: string;
    matrix: Matrix;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface Position {
    x: number;
    y: number;
}

export interface ScoreResult {
    basePoints: number;
    comboMultiplier: number;
    totalPoints: number;
    comboLevel: number;
    clearedLines: number;
    cellsPlaced: number;
}

export interface GameState {
    board: Matrix;
    currentPieces: Block[];
    score: number;
    gameOver: boolean;
    draggedPiece: Block | null;
    lastScoreResult: ScoreResult | null;
}