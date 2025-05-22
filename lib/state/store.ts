import { create } from "zustand";
import { Block, GameState, Position } from "../data/types";
import {
  generateRandomBlocks,
  placeBlock,
  clearLines,
  isGameOver,
} from "../core/engine";
import { calculateValidPositions } from "../core/positions";

interface ExtendedGameState extends GameState {
  round: number;
  piecesPlaced: number;
  validPositions: Position[];
}

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

  initializeGame: () => {
    set({
      currentPieces: generateRandomBlocks(),
      board: Array(8)
        .fill(0)
        .map(() => Array(8).fill(0)),
      score: 0,
      gameOver: false,
      round: 1,
      piecesPlaced: 0,
      validPositions: [],
      draggedPiece: null,
      dragPosition: null
    });
  },

  placePiece: (x: number, y: number) => {
    const { board, currentPieces, piecesPlaced, round, draggedPiece } = get();

    if (!draggedPiece) return;

    const newBoard = placeBlock(board, draggedPiece, { x, y });

    // Если блок не был размещен, выходим
    if (newBoard === board) return;

    // Очищаем заполненные линии
    const { newBoard: clearedBoard, clearedLines } = clearLines(newBoard);

    // Проверяем окончание игры
    const gameOver = isGameOver(clearedBoard);
    
    // Обновляем счет
    const newScore = get().score + clearedLines * 100;

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
      newCurrentPieces = generateRandomBlocks();
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
      dragPosition: null
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
      dragPosition: null
    });
  },

  hoverCell: null,
  setHoverCell: (cell: { x: number; y: number } | null) =>
    set({ hoverCell: cell }),
}));
