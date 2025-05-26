import { create } from "zustand";
import { Block, GameState, Position, ScoreResult } from "../data/types";
import {
  placeBlock,
  clearLines,
  isGameOver,
  getCellsToClear
} from "../core/engine";
import { calculateValidPositions } from "../core/positions";
import { ScoreCalculator } from "../core/score";
import { BlockGenerator } from "../core/blockGenerator";

interface ExtendedGameState extends GameState {
  round: number;
  piecesPlaced: number;
  validPositions: Position[];
  isAnimating: boolean;
  setAnimating: (isAnimating: boolean) => void;
}

const scoreCalculator = new ScoreCalculator();
const blockGenerator = new BlockGenerator();

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
  }
>((set, get) => ({
  draggedPiece: null,
  dragPosition: null,
  lastScoreResult: null,

  startDrag: (block) => {
    const { board } = get();
    const validPositions = calculateValidPositions(board, block);
    set({ draggedPiece: block, validPositions });
  },
  updateDrag: (position) => set({ dragPosition: position }),
  endDrag: () => set({ draggedPiece: null, dragPosition: null }),

  board: Array(8)
    .fill(0)
    .map(() => Array(8).fill(0)),
  currentPieces: [],
  score: 0,
  gameOver: false,
  round: 1,
  piecesPlaced: 0,
  validPositions: [],
  isAnimating: false,
  setAnimating: (isAnimating) => set({ isAnimating }),

  initializeGame: () => {
    set({
      currentPieces: blockGenerator.generateNextBlocks(Array(8).fill(0).map(() => Array(8).fill(0))),
      board: Array(8)
        .fill(0)
        .map(() => Array(8).fill(0)),
      score: 0,
      gameOver: false,
      round: 1,
      piecesPlaced: 0,
      validPositions: [],
      draggedPiece: null,
      dragPosition: null,
      lastScoreResult: null
    });
    scoreCalculator.resetCombo();
  },

  placePiece: (x: number, y: number) => {
    const { board, currentPieces, piecesPlaced, round, draggedPiece } = get();

    if (!draggedPiece) return;

    const newBoard = placeBlock(board, draggedPiece, { x, y });

    // Если блок не был размещен, выходим
    if (newBoard === board) return;

    // Подсчитываем количество размещенных клеток
    const cellsPlaced = draggedPiece.matrix.reduce(
      (sum, row) => sum + row.reduce((rowSum, cell) => rowSum + cell, 0),
      0
    );

    // Получаем клетки, которые будут очищены
    const cellsToClear = getCellsToClear(newBoard, draggedPiece, { x, y });
    
    // Подсчитываем количество клеток фигуры в очищаемых линиях
    const cellsInLines = cellsToClear.reduce((sum, row, y) => {
      return sum + row.reduce((rowSum, cell, x) => {
        if (cell) {
          const relX = x - x;
          const relY = y - y;
          if (
            relY >= 0 &&
            relY < draggedPiece.matrix.length &&
            relX >= 0 &&
            relX < draggedPiece.matrix[0].length &&
            draggedPiece.matrix[relY][relX] === 1
          ) {
            return rowSum + 1;
          }
        }
        return rowSum;
      }, 0);
    }, 0);

    // Очищаем заполненные линии
    const { newBoard: clearedBoard, clearedLines } = clearLines(newBoard);

    // Проверяем окончание игры
    const gameOver = isGameOver(clearedBoard, currentPieces);
    
    // Рассчитываем очки с учетом новой системы
    const scoreResult = scoreCalculator.calculateScore(
      clearedBoard,
      clearedLines,
      cellsPlaced,
      cellsInLines,
      draggedPiece
    );

    // Обновляем счет
    const newScore = get().score + scoreResult.totalPoints;

    // Обновляем количество размещенных блоков и раунд
    let newPiecesPlaced = piecesPlaced + 1;
    let newRound = round;
    let newCurrentPieces = currentPieces.filter(
      (piece) => piece.id !== draggedPiece.id
    );

    // Если все блоки размещены, начинаем новый раунд
    if (newCurrentPieces.length === 0) {
      newRound = round + 1;
      newPiecesPlaced = 0;
      newCurrentPieces = blockGenerator.generateNextBlocks(clearedBoard);
    }

    set({
      board: clearedBoard,
      score: newScore,
      gameOver,
      round: newRound,
      piecesPlaced: newPiecesPlaced,
      currentPieces: newCurrentPieces,
      validPositions: [],
      draggedPiece: null,
      dragPosition: null,
      lastScoreResult: scoreResult
    });
  },

  resetGame: () => {
    set({
      board: Array(8)
        .fill(0)
        .map(() => Array(8).fill(0)),
      currentPieces: [],
      score: 0,
      gameOver: false,
      round: 1,
      piecesPlaced: 0,
      validPositions: [],
      draggedPiece: null,
      dragPosition: null,
      lastScoreResult: null
    });
    scoreCalculator.resetCombo();
  },

  hoverCell: null,
  setHoverCell: (cell: { x: number; y: number } | null) =>
    set({ hoverCell: cell }),
}));
