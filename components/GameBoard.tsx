import React, { useEffect, useRef, useState, useCallback } from "react";
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
import { Piece } from "./pieces/Piece";

const CELL_SIZE = 43.75
const VERTICAL_OFFSET = 2.5

interface GameBoardProps {
  width?: number;
  height?: number;
  onScoreUpdate: (score: number) => void;
  onGameOver: () => void;
}

const useGridPosition = (cellSize: number) => {
  const { validPositions } = useGameStore();
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardRect, setBoardRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (boardRef.current) {
      setBoardRect(boardRef.current.getBoundingClientRect());
    }
  }, []);

  const calculateGridPosition = useCallback((e: MouseEvent | TouchEvent) => {
    const rect = boardRect;

    if (!rect) {
      console.warn("boardRect not available in calculateGridPosition");
      return null;
    }

    const { clientX, clientY } = getEventCoordinates(e);
    
    const { draggedPiece } = useGameStore.getState();
    if (!draggedPiece) return null;

    const pieceWidthCells = draggedPiece.matrix[0].length;
    const pieceHeightCells = draggedPiece.matrix.length;

    const offsetX = (pieceWidthCells * cellSize) / 2;
    const offsetY = (pieceHeightCells * cellSize) * VERTICAL_OFFSET;

    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    const ghostX = relativeX - offsetX;
    const ghostY = relativeY - offsetY;

    const baseX = Math.floor(ghostX / cellSize);
    const baseY = Math.floor(ghostY / cellSize);

    return findNearestValidPosition(validPositions, { x: baseX, y: baseY });
  }, [validPositions, boardRect, cellSize]);

  return { boardRef, calculateGridPosition };
};

export const GameBoard: React.FC<GameBoardProps> = ({
  width = 8,
  height = 8,
  onScoreUpdate,
  onGameOver,
}) => {
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
    setCurrentPieces,
    previewBlock,
    setPreviewBlock,
    resetGame,
  } = useGameStore();

  const { boardRef, calculateGridPosition } = useGridPosition(CELL_SIZE);

  const [clearingCells, setClearingCells] = useState<boolean[][]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [nextBlocks, setNextBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [blockEvaluations, setBlockEvaluations] = useState<
    Array<{
      difficulty: number;
      scorePotential: number;
    }>
  >([]);
  const [pieceEvaluations, setPieceEvaluations] = useState<
    Array<{
      difficulty: number;
      scorePotential: number;
    }>
  >([]);
  const [potentialClearHighlight, setPotentialClearHighlight] = useState<
    boolean[][]
  >([]);
  const [placedPiecesCount, setPlacedPiecesCount] = useState(0);

  const blockGenerator = new BlockGenerator();
  const scoreCalculator = new ScoreCalculator();
  const difficultyEvaluator = new DifficultyEvaluator();
useEffect(() => {

})

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setClearingCells([]);
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  useEffect(() => {
    if (currentPieces.length === 0) {
      initializeGame();
    }
  }, [currentPieces.length, initializeGame]);

  useEffect(() => {
    if (currentPieces.length > 0) {
      // Оцениваем каждую текущую фигуру
      const evaluations = currentPieces.map((piece) =>
        difficultyEvaluator.evaluateBlock(piece, board)
      );
      setPieceEvaluations(evaluations);
    }
  }, [currentPieces, board]);

  const generateNewBlocks = useCallback(() => {
    const newBlocks = blockGenerator.generateNextBlocks(board);
    setCurrentPieces(newBlocks);
    setPreviewBlock(blockGenerator.getPreviewBlock());
    setPlacedPiecesCount(0); // Reset placed pieces count when generating new blocks
  }, [board, blockGenerator, setCurrentPieces, setPreviewBlock]);

  const handlePieceStart = useCallback((piece: Block, x: number, y: number) => {
    if (boardRef.current) {
      startDrag(piece);
      updateDrag({ x, y });
    }
  }, [startDrag, updateDrag, boardRef]);

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

      if (e instanceof TouchEvent) {
        e.preventDefault();
      }

      const { clientX, clientY } = getEventCoordinates(e);
      updateDrag({ x: clientX, y: clientY });

      const nearestPosition = calculateGridPosition(e);
      setHoverCell(nearestPosition);
    };

    const handleStart = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      if (draggedPiece) {
        if (hoverCell) {
          // Фигура отпущена над допустимой позицией, размещаем ее
          handlePiecePlacement(hoverCell.x, hoverCell.y);
        } else {
          // Фигура отпущена вне допустимой позиции, отменяем перетаскивание
          endDrag();
        }
      }
      // Сбрасываем hoverCell в любом случае после завершения перетаскивания
      setHoverCell(null);
    };

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
  }, [draggedPiece, updateDrag, endDrag, setHoverCell, board, calculateGridPosition, hoverCell]);

  const calculatePotentialClearLines = useCallback((piece: Block, position: Position) => {
    if (!position) return [];

    // Создаем временную копию доски
    const tempBoard = board.map(row => [...row]);
    
    // Размещаем фигуру на временной доске
    piece.matrix.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.value === 1) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0 && boardY < height && boardX >= 0 && boardX < width) {
            tempBoard[boardY][boardX] = { value: 1, color: piece.color };
          }
        }
      });
    });

    // Проверяем горизонтальные линии (строки)
    const horizontalLines = tempBoard.map((row, y) => {
      return row.every(cell => cell.value === 1);
    });

    // Проверяем вертикальные линии (столбцы)
    const verticalLines = Array(width).fill(false).map((_, x) => {
      return tempBoard.every(row => row[x].value === 1);
    });

    // Создаем матрицу подсветки, где true означает, что ячейка входит в линию, которая будет очищена
    const highlightMatrix = tempBoard.map((row, y) => {
      return row.map((_, x) => {
        return horizontalLines[y] || verticalLines[x];
      });
    });

    return highlightMatrix;
  }, [board, width, height]);

  useEffect(() => {
    if (draggedPiece && hoverCell) {
      const potentialLines = calculatePotentialClearLines(draggedPiece, hoverCell);
      setPotentialClearHighlight(potentialLines);
    } else {
      setPotentialClearHighlight([]);
    }
  }, [draggedPiece, hoverCell, calculatePotentialClearLines]);

  return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-blue-900 p-4">
      {/* Top section: Score and Settings (placeholder) */}
      <div className="flex justify-between w-full items-center">
        <div className="text-2xl font-bold text-white">
          500 {/* Placeholder for trophy */}
        </div>
        <div className="text-4xl font-bold text-white">{score}</div>
        <div className="text-2xl font-bold text-white">
          ⚙️ {/* Placeholder for settings icon */}
        </div>
      </div>

      {/* Middle section: Power-ups (placeholder) */}
      {/* <div className="flex justify-around w-full my-4">
        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white">⚡</div>
        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white">↩️</div>
        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white">💥</div>
        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white">🔄</div>
      </div> */}

      {/* Game Board Container - takes full width and maintains aspect ratio */}
      <div className="w-full aspect-square flex justify-center items-center p-1">
        <div
          ref={boardRef}
          className="grid grid-cols-8 grid-rows-8 gap-0.5 w-full h-full bg-gray-800 p-1 rounded-lg relative"
        >
          {board.map((row, y) => (
            <React.Fragment key={y}>
              {row.map((cell, x) => {
                let highlight = false;
                let willBeCleared = false;
                let isClearing = false;
                let isPotentiallyCleared = false;

                if (draggedPiece && hoverCell) {
                  const pieceMatrix = draggedPiece.matrix;
                  const pieceX = x - hoverCell.x;
                  const pieceY = y - hoverCell.y;

                  if (
                    pieceY >= 0 &&
                    pieceY < pieceMatrix.length &&
                    pieceX >= 0 &&
                    pieceX < pieceMatrix[0].length
                  ) {
                    highlight = pieceMatrix[pieceY][pieceX].value === 1;
                  }
                }

                if (clearingCells[y]?.[x]) {
                  willBeCleared = true;
                  isClearing = isAnimating;
                }

                // Check if this cell is marked for potential clearing on hover
                if (potentialClearHighlight[y]?.[x]) {
                  isPotentiallyCleared = true;
                }

                return (
                  <div
                    key={x}
                    className={`rounded-[3px] ${
                      cell.value ? "bg-gray-700" : "bg-gray-900"
                    } ${highlight ? "ring-2 ring-blue-500" : ""} ${
                      willBeCleared ? "clearing-highlight" : ""
                    } ${isClearing ? "shaking" : ""} ${
                      isPotentiallyCleared ? "potential-clear-highlight" : ""
                    }`}
                  >
                    {cell.value === 1 && cell.color && (
                      <Piece color={cell.color} size="100%" />
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Draggable Pieces */}
      <div className="flex justify-center gap-4 mt-4 relative">
        {currentPieces.map((piece) => {
          const isBeingDragged = draggedPiece?.uniqueId === piece.uniqueId;

          return (
            <DraggablePiece
            key={piece.uniqueId}
            piece={piece}
            onStart={handlePieceStart}
            style={
              isBeingDragged && dragPosition
                ? {
                    left: dragPosition.x - (piece.matrix[0].length * CELL_SIZE) / 2,
                    top: dragPosition.y - (piece.matrix.length * CELL_SIZE ) * VERTICAL_OFFSET,
                  }
                : {}
            }
            isGhost={isBeingDragged}
            ghostSize={CELL_SIZE}
          />
          );
        })}
      </div>

      {isGameOver && <GameOver />}
    </div>
  );
};

export default GameBoard;
