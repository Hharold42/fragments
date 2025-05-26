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
    placedBlocksPoints: number;
    clearedLinesPoints: number;
    clearedBlocksPoints: number;
    comboBonus: number;
    totalPoints: number;
    comboLevel: number;
    clearedLines: number;
    cellsPlaced: number;
    cellsInLines: number;
    isBoardCleared: boolean;
}

export interface GameState {
    board: Matrix;
    currentPieces: Block[];
    score: number;
    gameOver: boolean;
    draggedPiece: Block | null;
    lastScoreResult: ScoreResult | null;
}