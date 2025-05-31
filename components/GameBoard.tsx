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

interface GameBoardProps {
  width?: number;
  height?: number;
  onScoreUpdate: (score: number) => void;
  onGameOver: () => void;
}

const useGridPosition = (cellSize: number) => {
  const { validPositions } = useGameStore();
  const boardRef = useRef<HTMLDivElement>(null);

  const calculateGridPosition = (e: MouseEvent | TouchEvent) => {
    if (!boardRef.current) return null;
    const { clientX, clientY } = getEventCoordinates(e);
    const rect = boardRef.current.getBoundingClientRect();

    // Получаем перетаскиваемую фигуру из стора, так как useGridPosition не зависит от нее напрямую
    const { draggedPiece } = useGameStore.getState();

    if (!draggedPiece) return null;

    // Базовое смещение для призрака (можно уточнить)
    const ghostX = clientX - cellSize * 1.5;
    const ghostY = clientY - cellSize * 4.5;

    const baseX = Math.floor((ghostX - rect.left) / cellSize);
    const baseY = Math.floor((ghostY - rect.top) / cellSize);

    // Вычисляем размеры фигуры в ячейках
    const pieceWidthCells = draggedPiece.matrix[0].length;
    const pieceHeightCells = draggedPiece.matrix.length;

    console.log("calculateGridPosition debug:", {
        clientX, clientY, rectTop: rect.top, rectLeft: rect.left,
        ghostX, ghostY, baseX, baseY,
        pieceWidthCells, pieceHeightCells
    });

    // Проверяем, находится ли фигура полностью в пределах доски
    if (
        baseX < 0 ||
        baseY < 0 ||
        baseX + pieceWidthCells > 8 || // Ширина доски 8 ячеек
        baseY + pieceHeightCells > 8 // Высота доски 8 ячеек
    ) {
        console.log("calculateGridPosition: Figure out of bounds, returning null");
        return null;
    }

    console.log("calculateGridPosition: Figure within bounds");
    return findNearestValidPosition(validPositions, { x: baseX, y: baseY });
  };

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

  const { boardRef, calculateGridPosition } = useGridPosition(32);

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
      <div className="flex justify-center gap-4 mt-4">
        {currentPieces.map((piece) => {
          const isBeingDragged = draggedPiece?.uniqueId === piece.uniqueId;

          return (
            <div
              key={piece.uniqueId}
              className={`flex items-center justify-center ${isBeingDragged ? 'fixed z-[1000] pointer-events-none opacity-70 transition-transform duration-200' : ''}`}
              style={
                isBeingDragged && dragPosition
                  ? {
                      left: dragPosition.x - 32,
                      top: dragPosition.y - 32 * 2,
                    }
                  : {
                      width: '96px',
                      height: '96px',
                  }
              }
            >
              {piece && (
                <DraggablePiece
                  piece={piece}
                  onStart={handlePieceStart}
                  cellSize={32}
                  style={{}}
                  isGhost={isBeingDragged}
                />
              )}
            </div>
          );
        })}
      </div>

      {isGameOver && <GameOver />}
    </div>
  );
};

export default GameBoard;
