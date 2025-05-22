import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "../lib/state/store";
import { getCellsToClear } from "@/lib/core/engine";
import { findNearestValidPosition } from "../lib/core/positions";
import { DraggablePiece } from "./DraggablePiece";
import { Block } from "../lib/data/types";

interface GameBoardProps {
  width?: number;
  height?: number;
}

const useGhostPosition = (cellSize: number) => {
  const { draggedPiece, validPositions } = useGameStore();
  const boardRef = useRef<HTMLDivElement>(null);

  const calculatePosition = (e: MouseEvent) => {
    if (!boardRef.current || !draggedPiece) return null;

    const rect = boardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left + cellSize * 0.5;
    const offsetY = e.clientY - rect.top - cellSize * 1.5;

    const gridX = Math.floor(offsetX / cellSize);
    const gridY = Math.floor(offsetY / cellSize);

    return findNearestValidPosition(validPositions, { x: gridX, y: gridY });
  };

  return { boardRef, calculatePosition };
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
  } = useGameStore();
  const CELL_SIZE = 32;

  const { boardRef, calculatePosition } = useGhostPosition(CELL_SIZE);

  const handlePieceStart = (piece: Block, x: number, y: number) => {
    startDrag(piece);
    updateDrag({ x, y });
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!draggedPiece || !boardRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      updateDrag({ x: clientX, y: clientY });
      const rect = boardRef.current.getBoundingClientRect();

      // Позиция призрака (смещена вверх)
      const ghostX = clientX - CELL_SIZE;
      const ghostY = clientY - CELL_SIZE * 2; // Смещаем призрак вверх

      // Calculate base position относительно призрака
      const baseX = Math.floor((ghostX - rect.left) / CELL_SIZE);
      const baseY = Math.floor((ghostY - rect.top) / CELL_SIZE);

      const nearestPosition = findNearestValidPosition(validPositions, {
        x: baseX,
        y: baseY,
      });

      setHoverCell(nearestPosition);
    };
    const handleEnd = (e: MouseEvent | TouchEvent) => {
      if (draggedPiece && hoverCell) {
        placePiece(hoverCell.x, hoverCell.y);
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
                if (
                  draggedPiece &&
                  hoverCell &&
                  validPositions.some(
                    (pos) => pos.x === hoverCell.x && pos.y === hoverCell.y
                  )
                ) {
                  // Calculate relative position from the top-left cell of the block
                  const relX = x - hoverCell.x;
                  const relY = y - hoverCell.y;

                  // Check if this cell is part of the block
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
                return (
                  <div
                    key={`${x}-${y}`}
                    className={`w-8 h-8 rounded-sm cursor-pointer transition-colors ${
                      highlight
                        ? "bg-blue-500/50"
                        : willBeCleared
                        ? "bg-red-500/50 scale-95  shake-animation"
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
            isDragged={draggedPiece?.id === piece.id}
            onStart={handlePieceStart}
          />
        ))}
      </div>
      
      {draggedPiece && dragPosition && (
        <DraggablePiece
          piece={draggedPiece}
          cellSize={4}
          ghostScale={2}
          isGhost={true}
          style={{
            left: dragPosition.x - CELL_SIZE,
            top: dragPosition.y - CELL_SIZE * 2,
            transform: "scale(200%)",
             transition: 'scale 0.2s ease-out'
            
          }}
        />
      )}
    </div>
  );
};

export default GameBoard;
