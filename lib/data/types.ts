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

export interface GameState{
    board: Matrix;
    currentPieces: Block[];
    // selectedPiece: Block | null;
    score: number;
    gameOver: boolean;
    draggedPiece: Block | null;
}