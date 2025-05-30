import React from "react";
import { Block } from "../lib/data/types";
import { getEventCoordinates } from "@/utils/events";
import { Piece } from "./pieces/Piece";

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
  cellSize = 32,
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

  const baseClasses = `grid gap-[1px] ${isGhost ? "pointer-events-none" : "cursor-pointer"}`;
  const containerClasses = isGhost
    ? "fixed z-[1000] opacity-70 transition-transform duration-200"
    : `p-px rounded-sm transition-all opacity-in-animation cursor-pointer`;

  return (
    <div
      className={containerClasses}
      style={style}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      <div className={baseClasses}>
        {piece.matrix.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              cell.value === 1 ? (
                <Piece key={`${x}-${y}`} color={piece.color} size={isGhost ? 32 : cellSize} />
              ) : (
                <div key={`${x}-${y}`} style={{ width: isGhost ? 32 : cellSize, height: isGhost ? 32 : cellSize }} />
              )
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
