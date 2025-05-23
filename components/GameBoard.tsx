import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "../lib/state/store";
import { getCellsToClear } from "@/lib/core/engine";
import { findNearestValidPosition } from "../lib/core/positions";
import { DraggablePiece } from "./DraggablePiece";
import { Block } from "../lib/data/types";
import { getEventCoordinates } from "@/utils/events";

interface GameBoardProps {
  width?: number;
  height?: number;
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

const GameBoard: React.FC<GameBoardProps> = ({ width = 8, height = 8 }) => {
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
  } = useGameStore();
  const CELL_SIZE = 32;

  const { boardRef, calculateGridPosition } = useGridPosition(CELL_SIZE);

  const [clearingCells, setClearingCells] = useState<boolean[][]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

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
      const { clientX, clientY } = getEventCoordinates(e);
      updateDrag({ x: clientX, y: clientY });

      const nearestPosition = calculateGridPosition(e);
      setHoverCell(nearestPosition);
    };
    const handleEnd = (e: MouseEvent | TouchEvent) => {
      if (draggedPiece && hoverCell) {
        handlePiecePlacement(hoverCell.x, hoverCell.y);
      }
      endDrag();
    };
    // click
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    // touch
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
    window.addEventListener("touchcancel", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, [dragPosition, draggedPiece, updateDrag, endDrag, setHoverCell]);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex justify-center items-center p-4">
        <div ref={boardRef} className="grid gap-0.5 bg-gray-800 p-2 rounded-lg">
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
        {currentPieces.map((piece) => (
          <DraggablePiece
            key={piece.id}
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
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
