import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "../lib/state/store";
import { getCellsToClear } from "@/lib/core/engine";
import { findNearestValidPosition } from "../lib/core/positions";
import { DraggablePiece } from "./DraggablePiece";
import { Block, Matrix, Position } from "../lib/data/types";
import { getEventCoordinates } from "@/utils/events";
import { ScoreDisplay } from "./ScoreDisplay";
import { BlockGenerator } from "../lib/core/blockGenerator";
import { DifficultyEvaluator } from "../lib/core/difficulty";
import { GameOver } from "./GameOver";
import { ScoreCalculator } from "../lib/core/scoreCalculator";

interface GameBoardProps {
  width?: number;
  height?: number;
  onScoreUpdate: (score: number) => void;
}

const useGridPosition = (cellSize: number) => {
  const { validPositions } = useGameStore();
  const boardRef = useRef<HTMLDivElement>(null);

  const calculateGridPosition = (e: MouseEvent | TouchEvent) => {
    if (!boardRef.current) return null;
    const { clientX, clientY } = getEventCoordinates(e);
    const rect = boardRef.current.getBoundingClientRect();

    // Базовое смещение для призрака
    const ghostX = clientX - cellSize * 1.5;
    const ghostY = clientY - cellSize * 4.5;

    const baseX = Math.floor((ghostX - rect.left) / cellSize);
    const baseY = Math.floor((ghostY - rect.top) / cellSize);

    return findNearestValidPosition(validPositions, { x: baseX, y: baseY });
  };

  return { boardRef, calculateGridPosition };
};

const GameBoard: React.FC<GameBoardProps> = ({ width = 8, height = 8, onScoreUpdate }) => {
  const {
    board,
    currentPieces,
    placePiece,
    draggedPiece,
    dragPosition,
    startDrag,
    updateDrag,
    endDrag,
    setHoverCell,
    hoverCell,
    validPositions,
    initializeGame,
    score,
    lastScoreResult,
  } = useGameStore();
  const CELL_SIZE = 32;

  const { boardRef, calculateGridPosition } = useGridPosition(CELL_SIZE);

  const [clearingCells, setClearingCells] = useState<boolean[][]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [nextBlocks, setNextBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [blockEvaluations, setBlockEvaluations] = useState<Array<{
    difficulty: number;
    scorePotential: number;
  }>>([]);
  const [pieceEvaluations, setPieceEvaluations] = useState<Array<{
    difficulty: number;
    scorePotential: number;
  }>>([]);

  const blockGenerator = new BlockGenerator();
  const scoreCalculator = new ScoreCalculator();
  const difficultyEvaluator = new DifficultyEvaluator();

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setClearingCells([]);
        setIsAnimating(false);
      }, 300); // Время должно совпадать с длительностью анимации
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  useEffect(() => {
    if (currentPieces.length === 0) {
      initializeGame();
    }
  }, []);

  useEffect(() => {
    generateNewBlocks();
  }, []);

  useEffect(() => {
    if (currentPieces.length > 0) {
      // Оцениваем каждую текущую фигуру
      const evaluations = currentPieces.map(piece => 
        difficultyEvaluator.evaluateBlock(piece, board)
      );
      setPieceEvaluations(evaluations);
    }
  }, [currentPieces, board]);

  const generateNewBlocks = () => {
    try {
      const newBlocks = blockGenerator.generateNextBlocks(board);
      
      // Проверяем, что все блоки имеют валидные матрицы
      const validBlocks = newBlocks.filter(block => 
        block && 
        block.matrix && 
        Array.isArray(block.matrix) && 
        block.matrix.length > 0 && 
        block.matrix[0] && 
        Array.isArray(block.matrix[0])
      );

      if (validBlocks.length < 3) {
        console.warn('Not enough valid blocks generated:', newBlocks);
        // Создаем резервные блоки
        const fallbackBlocks: Block[] = [
          {
            id: 'fallback-1',
            name: 'Fallback Block 1',
            matrix: [[1, 1], [1, 1]],
            difficulty: 'medium'
          },
          {
            id: 'fallback-2',
            name: 'Fallback Block 2',
            matrix: [[1, 1, 1]],
            difficulty: 'medium'
          },
          {
            id: 'fallback-3',
            name: 'Fallback Block 3',
            matrix: [[1], [1], [1]],
            difficulty: 'medium'
          }
        ];
        setNextBlocks(fallbackBlocks);
      } else {
        setNextBlocks(validBlocks);
      }
      
      // Оцениваем каждую фигуру
      const evaluations = validBlocks.map(block => 
        difficultyEvaluator.evaluateBlock(block, board)
      );
      setBlockEvaluations(evaluations);
    } catch (error) {
      console.error('Error generating blocks:', error);
      // Используем резервные блоки в случае ошибки
      const fallbackBlocks: Block[] = [
        {
          id: 'fallback-1',
          name: 'Fallback Block 1',
          matrix: [[1, 1], [1, 1]],
          difficulty: 'medium'
        },
        {
          id: 'fallback-2',
          name: 'Fallback Block 2',
          matrix: [[1, 1, 1]],
          difficulty: 'medium'
        },
        {
          id: 'fallback-3',
          name: 'Fallback Block 3',
          matrix: [[1], [1], [1]],
          difficulty: 'medium'
        }
      ];
      setNextBlocks(fallbackBlocks);
      setBlockEvaluations(fallbackBlocks.map(() => ({ difficulty: 0, scorePotential: 0 })));
    }
  };

  const handlePieceStart = (piece: Block, x: number, y: number) => {
    startDrag(piece);
    updateDrag({ x, y });
  };

  const handlePiecePlacement = (x: number, y: number) => {
    if (draggedPiece && hoverCell) {
      const cellsToClear = getCellsToClear(board, draggedPiece, hoverCell);
      const hasCellsToClear = cellsToClear.some((row) =>
        row.some((cell) => cell)
      );

      if (hasCellsToClear) {
        setClearingCells(cellsToClear);
        setIsAnimating(true);

        placePiece(x, y);

        setTimeout(() => {
          setClearingCells([]);
          setIsAnimating(false);
        }, 500);
      } else {
        placePiece(x, y);
      }
    }
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!draggedPiece || !boardRef.current) return;
      
      // Предотвращаем скролл на мобильных устройствах
      if (e instanceof TouchEvent) {
        e.preventDefault();
      }
      
      const { clientX, clientY } = getEventCoordinates(e);
      updateDrag({ x: clientX, y: clientY });

      const rect = boardRef.current.getBoundingClientRect();
      
      // Вычисляем размеры фигуры в пикселях
      const pieceWidth = draggedPiece.matrix[0].length * CELL_SIZE;
      const pieceHeight = draggedPiece.matrix.length * CELL_SIZE;
      
      // Вычисляем координаты фигуры относительно курсора
      const pieceLeft = clientX - CELL_SIZE;
      const pieceRight = pieceLeft + pieceWidth + CELL_SIZE * 2;
      const pieceTop = clientY - CELL_SIZE * 4;
      const pieceBottom = pieceTop + pieceHeight + CELL_SIZE * 2;

      // Проверяем, находится ли фигура над полем с отступом
      const isPieceOverBoard = 
          pieceRight >= rect.left && 
          pieceLeft <= rect.right && 
          pieceBottom >= rect.top && 
          pieceTop <= rect.bottom;

      if (isPieceOverBoard) {
        const nearestPosition = calculateGridPosition(e);
        setHoverCell(nearestPosition);
      } else {
        setHoverCell(null);
      }
    };

    const handleStart = (e: TouchEvent) => {
      // Предотвращаем скролл при начале перетаскивания
      e.preventDefault();
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      if (draggedPiece && hoverCell) {
        handlePiecePlacement(hoverCell.x, hoverCell.y);
      }
      endDrag();
      setHoverCell(null);
    };

    // Добавляем обработчик для предотвращения скролла при начале перетаскивания
    window.addEventListener("touchstart", handleStart, { passive: false });
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchend", handleEnd);
    window.addEventListener("touchcancel", handleEnd);

    return () => {
      window.removeEventListener("touchstart", handleStart);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, [dragPosition, draggedPiece, updateDrag, endDrag, setHoverCell]);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <div className="text-2xl font-bold">Счет: {score}</div>
        {lastScoreResult && (
          <div className="text-sm text-gray-400">
            <div>Очищено линий: {lastScoreResult.clearedLines}</div>
            <div>Размещено клеток: {lastScoreResult.cellsPlaced}</div>
            <div>Очки за размещение: {lastScoreResult.placedBlocksPoints}</div>
            <div>Очки за линии: {lastScoreResult.clearedLinesPoints}</div>
            <div>Очки за блоки: {lastScoreResult.clearedBlocksPoints}</div>
            <div>Комбо: {lastScoreResult.comboLevel} (×{lastScoreResult.comboBonus})</div>
            {lastScoreResult.isBoardCleared && (
              <div className="text-green-400">+300 бонус за очистку поля!</div>
            )}
            <div className="text-green-400">+{lastScoreResult.totalPoints}</div>
          </div>
        )}
      </div>

      <div className="flex justify-center items-center p-4">
        <div ref={boardRef} className="grid gap-0.5 bg-gray-800 p-2 rounded-lg relative">
          {board.map((row, y) => (
            <div key={y} className="flex gap-0.5">
              {row.map((cell, x) => {
                let highlight = false;
                let willBeCleared = false;
                let isClearing = false;

                if (
                  draggedPiece &&
                  hoverCell &&
                  validPositions.some(
                    (pos) => pos.x === hoverCell.x && pos.y === hoverCell.y
                  )
                ) {
                  const relX = x - hoverCell.x;
                  const relY = y - hoverCell.y;

                  if (
                    relY >= 0 &&
                    relY < draggedPiece.matrix.length &&
                    relX >= 0 &&
                    relX < draggedPiece.matrix[0].length &&
                    draggedPiece.matrix[relY][relX] === 1
                  ) {
                    highlight = true;
                  }
                  const cellsToClear = getCellsToClear(
                    board,
                    draggedPiece,
                    hoverCell
                  );
                  willBeCleared = cellsToClear[y][x];
                }

                // Проверяем, находится ли клетка в процессе удаления
                if (clearingCells.length > 0 && clearingCells[y]?.[x]) {
                  isClearing = true;
                }

                return (
                  <div
                    key={`${x}-${y}`}
                    className={`w-8 h-8 rounded-sm cursor-pointer transition-colors ${
                      highlight
                        ? "bg-blue-500/50"
                        : isClearing
                        ? "bg-red-500/50 clearing"
                        : willBeCleared
                        ? "bg-red-500/50"
                        : cell === 0
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-blue-500"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {currentPieces.map((piece, index) => (
          <div key={piece.id} className="flex flex-col items-center">
            <DraggablePiece
              piece={piece}
              onStart={handlePieceStart}
              style={
                draggedPiece?.id === piece.id && dragPosition
                  ? {
                      left: dragPosition.x - CELL_SIZE,
                      top: dragPosition.y - CELL_SIZE * 4,
                      transform: "scale(200%)",
                    }
                  : {}
              }
              isGhost={draggedPiece?.id === piece.id}
            />
            {pieceEvaluations[index] && (
              <div className="mt-2 text-xs text-gray-400">
                <div>Сложность: {Math.round(pieceEvaluations[index].difficulty)}</div>
                <div>Потенциал: {Math.round(pieceEvaluations[index].scorePotential)}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isGameOver && <GameOver />}
    </div>
  );
};

export default GameBoard;
