import React, { useEffect, useState } from 'react';
import { useGameStore } from '../lib/state/store';
import { Block } from '../lib/data/types';

interface GameBoardProps {
  width?: number;
  height?: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  width = 8, 
  height = 8 
}) => {
  const { board, currentPieces, selectedPiece, selectPiece, placePiece } = useGameStore();

  const handleCellClick = (x: number, y: number) => {
    if (selectedPiece) {
      placePiece(x, y);
    }
  };

  const handlePieceClick = (piece: Block) => {
    selectPiece(piece);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex justify-center items-center p-4">
        <div className="grid gap-0.5 bg-gray-800 p-2 rounded-lg">
          {board.map((row, y) => (
            <div key={y} className="flex gap-0.5">
              {row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  onClick={() => handleCellClick(x, y)}
                  className={`w-8 h-8 rounded-sm cursor-pointer transition-colors ${
                    cell === 0 ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {currentPieces.map((piece) => (
          <div
            key={piece.id}
            onClick={() => handlePieceClick(piece)}
            className={`p-2 rounded-lg cursor-pointer transition-all ${
              selectedPiece?.id === piece.id
                ? 'bg-blue-500 scale-110'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <div className="grid gap-0.5">
              {piece.matrix.map((row, y) => (
                <div key={y} className="flex gap-0.5">
                  {row.map((cell, x) => (
                    <div
                      key={`${x}-${y}`}
                      className={`w-4 h-4 rounded-sm ${
                        cell === 1 ? 'bg-blue-500' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard; 