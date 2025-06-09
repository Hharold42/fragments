import { create } from 'zustand';
import { Block, GameState, GameSettings } from '../types/game';
import { BlockGenerator } from '../utils/BlockGenerator';
import { ScoreCalculator } from '../utils/ScoreCalculator';
import { DifficultyEvaluator } from '../utils/DifficultyEvaluator';
import { useGameLogger } from '../hooks/useGameLogger';

const DEFAULT_SETTINGS: GameSettings = {
  width: 8,
  height: 8,
  initialPieces: 3,
  maxPieces: 3,
};

interface GameStore extends GameState {
  placePiece: (x: number, y: number) => void;
  startDrag: (piece: Block) => void;
  updateDrag: (x: number, y: number) => void;
  endDrag: () => void;
  setHoverCell: (x: number | null, y: number | null) => void;
  initializeGame: () => void;
  resetGame: () => void;
  setCurrentPieces: (pieces: Block[]) => void;
  setPreviewBlock: (block: Block | null) => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  const blockGenerator = new BlockGenerator();
  const scoreCalculator = new ScoreCalculator();
  const difficultyEvaluator = new DifficultyEvaluator();
  const { logEvent } = useGameLogger();

  const initializeGame = () => {
    const { width, height, initialPieces } = DEFAULT_SETTINGS;
    const board = Array(height)
      .fill(0)
      .map(() => Array(width).fill(0));
    const currentPieces = blockGenerator.generateNextBlocks(board);

    set({
      board,
      currentPieces,
      score: 0,
      combo: 0,
      lastScoreResult: null,
      previewBlock: blockGenerator.getPreviewBlock(),
      placedPiecesCount: 0,
    });
  };

  const placePiece = (x: number, y: number) => {
    const { board, draggedPiece, currentPieces, placedPiecesCount } = get();
    
    if (!draggedPiece) return;

    // Проверяем валидность размещения
    if (!isValidPlacement(board, draggedPiece, x, y)) {
      return;
    }

    // Размещаем фигуру
    const newBoard = placeBlockOnBoard(board, draggedPiece, x, y);
    
    // Проверяем линии для очистки
    const linesToClear = getLinesToClear(newBoard);
    let newScore = get().score;
    let newCombo = get().combo;
    let clearedLines = 0;

    if (linesToClear.length > 0) {
      const clearedBoard = clearLines(newBoard, linesToClear);
      clearedLines = linesToClear.length;
      const scoreResult = scoreCalculator.calculateScore(clearedLines, newCombo, clearedBoard);
      newScore += scoreResult.score;
      newCombo = scoreResult.combo;
      
      set({ 
        board: clearedBoard,
        score: newScore,
        combo: newCombo,
        lastScoreResult: scoreResult
      });
    } else {
      set({ 
        board: newBoard,
        combo: 0,
        lastScoreResult: null
      });
    }

    // Обновляем текущие фигуры
    const newPlacedCount = placedPiecesCount + 1;
    const newCurrentPieces = currentPieces.filter(p => p.uniqueId !== draggedPiece.uniqueId);
    
    set({ 
      currentPieces: newCurrentPieces,
      placedPiecesCount: newPlacedCount,
      draggedPiece: null,
      dragPosition: null,
      hoverCell: null
    });

    // Генерируем новые фигуры только если разместили все 3 и это не повторная генерация
    if (newPlacedCount === 3 && newCurrentPieces.length === 0) {
      const blockGenerator = new BlockGenerator();
      const newBlocks = blockGenerator.generateNextBlocks(newBoard);
      set({ 
        currentPieces: newBlocks,
        previewBlock: blockGenerator.getPreviewBlock(),
        placedPiecesCount: 0
      });
    }
  };

  const getLinesToClear = (board: number[][]): number[] => {
    const lines: number[] = [];

    // Проверяем горизонтальные линии
    for (let row = 0; row < board.length; row++) {
      let isLineComplete = true;
      for (let col = 0; col < board[0].length; col++) {
        if (board[row][col] === 0) {
          isLineComplete = false;
          break;
        }
      }
      if (isLineComplete) lines.push(row);
    }

    // Проверяем вертикальные линии
    for (let col = 0; col < board[0].length; col++) {
      let isLineComplete = true;
      for (let row = 0; row < board.length; row++) {
        if (board[row][col] === 0) {
          isLineComplete = false;
          break;
        }
      }
      if (isLineComplete) lines.push(board.length + col);
    }

    return lines;
  };

  const clearLines = (board: number[][], lines: number[]) => {
    // Очищаем горизонтальные линии
    lines
      .filter(line => line < board.length)
      .forEach(row => {
        for (let col = 0; col < board[0].length; col++) {
          board[row][col] = 0;
        }
      });

    // Очищаем вертикальные линии
    lines
      .filter(line => line >= board.length)
      .forEach(line => {
        const col = line - board.length;
        for (let row = 0; row < board.length; row++) {
          board[row][col] = 0;
        }
      });

    return board;
  };

  return {
    board: [],
    currentPieces: [],
    score: 0,
    combo: 0,
    lastScoreResult: null,
    previewBlock: null,
    placedPiecesCount: 0,
    draggedPiece: null,
    dragPosition: { x: 0, y: 0 },
    hoverCell: null,
    validPositions: [],

    placePiece,
    startDrag: (piece: Block) => set({ draggedPiece: piece }),
    updateDrag: (x: number, y: number) =>
      set({ dragPosition: { x, y } }),
    endDrag: () => set({ draggedPiece: null }),
    setHoverCell: (x: number | null, y: number | null) =>
      set({ hoverCell: x !== null && y !== null ? { x, y } : null }),
    initializeGame,
    resetGame: () => {
      set({
        board: [],
        currentPieces: [],
        score: 0,
        combo: 0,
        lastScoreResult: null,
        previewBlock: null,
        placedPiecesCount: 0,
        draggedPiece: null,
        dragPosition: { x: 0, y: 0 },
        hoverCell: null,
        validPositions: [],
      });
      initializeGame();
    },
    setCurrentPieces: (pieces: Block[]) => set({ currentPieces: pieces }),
    setPreviewBlock: (block: Block | null) => set({ previewBlock: block }),
  };
}); 