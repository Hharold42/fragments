import { create } from "zustand";
import { Block, GameState, Position, ScoreResult, Matrix, Cell } from "../data/types";
import {
  placeBlock,
  clearLines,
  isGameOver,
  getCellsToClear
} from "../core/engine";
import { calculateValidPositions } from "../core/positions";
import { ScoreCalculator } from "../core/score";
import { BlockGenerator } from "../core/blockGenerator";
import { DifficultyEvaluator } from "../core/difficulty";

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
    const newBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill({ value: 0 }));
    const newBlocks = blockGenerator.generateNextBlocks(newBoard);
    const blocksWithInitialIndex = newBlocks.map((block, index) => ({ ...block, initialIndex: index }));
    set({
      board: newBoard,
      currentPieces: blocksWithInitialIndex,
      previewBlock: blockGenerator.getPreviewBlock(),
      score: 0,
      gameOver: false,
      round: 1,
      piecesPlaced: 0,
      validPositions: [],
      draggedPiece: null,
      dragPosition: null,
      lastScoreResult: null,
      blockEvaluations: blocksWithInitialIndex.map(block => 
        difficultyEvaluator.evaluateBlock(block, newBoard)
      )
    });
    scoreCalculator.resetCombo();
  },

  placePiece: (x: number, y: number) => {
    const { board, currentPieces, piecesPlaced, round, draggedPiece } = get();

    if (!draggedPiece) return;

    // Проверяем, можно ли разместить фигуру
    const canPlace = draggedPiece.matrix.every((row, dy) =>
      row.every((cell, dx) => {
        if (cell.value === 0) return true;
        const boardX = x + dx;
        const boardY = y + dy;
        return (
          boardX >= 0 &&
          boardX < board[0].length &&
          boardY >= 0 &&
          boardY < board.length &&
          board[boardY][boardX].value === 0
        );
      })
    );

    if (!canPlace) return;

    // Размещаем фигуру
    const newBoard = board.map(row => [...row]);
    draggedPiece.matrix.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell.value === 1) {
          newBoard[y + dy][x + dx] = {
            value: 1,
            color: draggedPiece.color
          };
        }
      });
    });

    // Подсчитываем количество размещенных клеток
    const cellsPlaced = draggedPiece.matrix.reduce(
      (sum, row) => sum + row.reduce((rowSum, cell) => rowSum + cell.value, 0),
      0
    );

    // Получаем клетки, которые будут очищены
    const cellsToClear = getCellsToClear(newBoard, draggedPiece, { x, y });
    
    // Подсчитываем количество клеток фигуры в очищаемых линиях
    const cellsInLines = cellsToClear.reduce((sum, row, y) => {
      return sum + row.reduce((rowSum, cell, x) => {
        if (cell.value) {
          const relX = x - x;
          const relY = y - y;
          if (
            relY >= 0 &&
            relY < draggedPiece.matrix.length &&
            relX >= 0 &&
            relX < draggedPiece.matrix[0].length &&
            draggedPiece.matrix[relY][relX].value === 1
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
    const gameOver = isGameOver(clearedBoard);
    
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
      const generatedBlocks = blockGenerator.generateNextBlocks(clearedBoard);
      newCurrentPieces = generatedBlocks.map((block, index) => ({ ...block, initialIndex: index }));
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
      lastScoreResult: scoreResult,
      previewBlock: blockGenerator.getPreviewBlock(),
      blockEvaluations: newCurrentPieces.map(block => 
        difficultyEvaluator.evaluateBlock(block, clearedBoard)
      )
    });
  },

  resetGame: () => {
    set({
      board: Array(8)
        .fill(0)
        .map(() => Array(8).fill({ value: 0 })),
      currentPieces: [],
      score: 0,
      gameOver: false,
      round: 1,
      piecesPlaced: 0,
      validPositions: [],
      draggedPiece: null,
      dragPosition: null,
      lastScoreResult: null,
      previewBlock: null,
      blockEvaluations: []
    });
    scoreCalculator.resetCombo();
  },

  hoverCell: null,
  setHoverCell: (cell: { x: number; y: number } | null) =>
    set({ hoverCell: cell }),
}));
