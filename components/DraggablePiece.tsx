import React from "react";
import { Block } from "../lib/data/types";
import { getEventCoordinates } from "@/utils/events";

interface DraggablePieceProps {
  piece: Block;
  cellSize?: number;
  ghostScale?: number;
  isGhost?: boolean;
  isDragged?: boolean;
  onStart?: (piece: Block, x: number, y: number) => void;
  style?: React.CSSProperties;
}

export const DraggablePiece: React.FC<DraggablePieceProps> = ({
  piece,
  isGhost = false,
  onStart,
  style,
}) => {
  if (!piece || !piece.matrix) {
    console.warn('Invalid piece in DraggablePiece:', piece);
    return null;
  }

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isGhost || !onStart) return;

    const { clientX, clientY } = getEventCoordinates(e);

    onStart(piece, clientX, clientY);
  };

  const baseClasses = `grid gap-0.5 ${isGhost ? "pointer-events-none" : "cursor-pointer"}`;
  const containerClasses = isGhost
    ? "fixed z-[1000] opacity-70 transition-transform duration-200"
    : `p-2 rounded-lg transition-all  opacity-in-animation cursor-pointer `;

  return (
    <div
      className={containerClasses}
      style={style}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      <div className={baseClasses}>
        {piece.matrix.map((row, y) => (
          <div key={y} className="flex gap-0.5">
            {row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`w-4 h-4 rounded-sm  ${
                  cell === 1 ? "bg-blue-500" : "bg-transparent"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

