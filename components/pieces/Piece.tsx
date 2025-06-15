import React from "react";
import { BlockColor } from "@/lib/data/types";

interface PieceProps {
  color: BlockColor;
  size?: number | string;
  inset?: number;
  radius?: number;
  isClearing?: boolean;
}


export const Piece: React.FC<PieceProps> = ({ color, size = 32, isClearing }) => {

  return (
    <div className="relative no-select piece-container" style={{ width: size, height: size }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 113 113"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={isClearing ? "clearing-piece" : ""}
      >
        <use href={`/${color}.svg#${color}`} />
      </svg>
    </div>
  );
};
