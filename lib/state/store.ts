import { create } from "zustand";
import {
  Block,
  GameState,
  Position,
  ScoreResult,
  Matrix,
  Cell,
} from "../data/types";
import {
  placeBlock,
  clearLines,
  isGameOver,
  getCellsToClear,
  checkGameOver,
} from "../core/engine";
import { calculateScore } from "../core/score";
import { calculateValidPositions } from "../core/positions";
import { ScoreCalculator } from "../core/score";
import { BlockGenerator } from "../core/blockGenerator";
import { DifficultyEvaluator } from "../core/difficulty";
import { storageService } from '../services/storage';

interface ExtendedGameState extends GameState {
  round: number;
  piecesPlaced: number;
  validPositions: Position[];
  isAnimating: boolean;
  setAnimating: (isAnimating: boolean) => void;
  previewBlock: Block | null;
  blockEvaluations: Array<{ difficulty: number; scorePotential: number }>;
  setCurrentPieces: (pieces: Block[]) => void;
  setPreviewBlock: (block: Block | null) => void;
}

const scoreCalculator = new ScoreCalculator();
const blockGenerator = new BlockGenerator();
const difficultyEvaluator = new DifficultyEvaluator();

const placePieceOnBoard = (
  board: Matrix,
  piece: Block,
  position: Position
): Matrix => {
  const newBoard = board.map((row) => [...row]);
  piece.matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell.value === 1) {
        const boardY = y + position.y;
        const boardX = x + position.x;
        if (boardY >= 0 && boardY < board.length && boardX >= 0 && boardX < board[0].length) {
          newBoard[boardY][boardX] = { 
            value: 1,
            color: piece.color
          };
        }
      }
    });
  });
  return newBoard;
};

export const useGameStore = create<
  ExtendedGameState & {
    placePiece: (x: number, y: number) => void;
    resetGame: () => void;
    draggedPiece: Block | null;
    dragPosition: { x: number; y: number } | null;
    startDrag: (block: Block) => void;
    updateDrag: (position: { x: number; y: number }) => void;
    endDrag: () => void;
    hoverCell: { x: number; y: number } | null;
    setHoverCell: (cell: { x: number; y: number } | null) => void;
    initializeGame: () => void;
    saveGameState: () => void;
    loadGameState: () => Promise<void>;
  }
>((set, get) => ({
  draggedPiece: null,
  dragPosition: null,
  lastScoreResult: null,
  previewBlock: null,
  blockEvaluations: [],

  startDrag: (block) => {
    const { board } = get();
    const validPositions = calculateValidPositions(board, block);
    set({ draggedPiece: block, validPositions });
  },
  updateDrag: (position) => set({ dragPosition: position }),
  endDrag: () => set({ draggedPiece: null, dragPosition: null }),

  board: Array(8)
    .fill(0)
    .map(() => Array(8).fill({ value: 0 })),
  currentPieces: [],
  score: 0,
  gameOver: false,
  round: 1,
  piecesPlaced: 0,
  validPositions: [],
  isAnimating: false,
  setAnimating: (isAnimating) => set({ isAnimating }),

  setCurrentPieces: (pieces) => set({ currentPieces: pieces }),
  setPreviewBlock: (block) => set({ previewBlock: block }),

  initializeGame: () => {
    const blocksWithInitialIndex = blockGenerator.generateNextBlocks(
      get().board
    );
    set({
      currentPieces: blocksWithInitialIndex,
      previewBlock: blockGenerator.getPreviewBlock(),
      round: 1,
      piecesPlaced: 0,
    });
  },

  placePiece: (x: number, y: number) => {
    const { board, currentPieces, draggedPiece, round, piecesPlaced } = get();

    if (!draggedPiece) return;

    // First, place the piece on the board without clearing lines
    const newBoard = placePieceOnBoard(board, draggedPiece, { x, y });
    const cellsToClear = getCellsToClear(newBoard, draggedPiece, { x, y });
    const hasCellsToClear = cellsToClear.some((row) =>
      row.some((cell) => cell)
    );

    // Calculate score and prepare for line clearing
    const scoreResult = calculateScore(
      newBoard,
      board,
      draggedPiece,
      cellsToClear,
      { x, y }
    );
    const { newBoard: boardAfterClearing } = clearLines(newBoard);

    const newRound = piecesPlaced + 1 >= 3 ? round + 1 : round;
    const newPiecesPlaced = piecesPlaced + 1 >= 3 ? 0 : piecesPlaced + 1;

    const newCurrentPieces = currentPieces.filter(
      (p) => p.uniqueId !== draggedPiece.uniqueId
    );

    // Если все фигуры размещены, выдаем новый набор и не проверяем game over
    if (newPiecesPlaced === 0) {
      const newBlocks = blockGenerator.generateNextBlocks(boardAfterClearing);
      set({
        board: boardAfterClearing,
        currentPieces: newBlocks,
        previewBlock: blockGenerator.getPreviewBlock(),
        round: newRound,
        piecesPlaced: newPiecesPlaced,
        score: get().score + scoreResult.totalPoints,
        lastScoreResult: scoreResult,
        isAnimating: hasCellsToClear,
      });
      get().saveGameState();
      return;
    }

    // Обновляем состояние доски и очищаем линии
    set({
      board: boardAfterClearing,
      currentPieces: newCurrentPieces,
      previewBlock: blockGenerator.getPreviewBlock(),
      round: newRound,
      piecesPlaced: newPiecesPlaced,
      score: get().score + scoreResult.totalPoints,
      lastScoreResult: scoreResult,
      isAnimating: hasCellsToClear,
    });
    get().saveGameState();

    // Проверяем возможность размещения оставшихся фигур
    if (checkGameOver(boardAfterClearing, newCurrentPieces)) {
      set({ gameOver: true });
    }

    // Handle new blocks if needed
    if (newPiecesPlaced === 0) {
      const newBlocks = blockGenerator.generateNextBlocks(boardAfterClearing);
      set({
        currentPieces: newBlocks,
        previewBlock: blockGenerator.getPreviewBlock(),
      });
    }
  },

  saveGameState: () => {
    const { board, currentPieces, score } = get();
    storageService.saveCurrentGame({
      board,
      currentPieces,
      score
    });
    storageService.updateHighScore(score);
  },

  loadGameState: async () => {
    const savedState = await storageService.getCurrentGame();
    if (savedState) {
      set({
        board: savedState.board,
        currentPieces: savedState.currentPieces,
        score: savedState.score,
        gameOver: false
      });
    }
  },

  resetGame: () => {
    storageService.clearSavedGame();
    set({
      board: Array(8)
        .fill(0)
        .map(() => Array(8).fill({ value: 0 })),
      currentPieces: [],
      score: 0,
      gameOver: false,
      round: 1,
      piecesPlaced: 0,
      draggedPiece: null,
      dragPosition: null,
      hoverCell: null,
      lastScoreResult: null,
      isAnimating: false,
    });
  },

  hoverCell: null,
  setHoverCell: (cell: { x: number; y: number } | null) =>
    set({ hoverCell: cell }),
}));
