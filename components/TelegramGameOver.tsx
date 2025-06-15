'use client';

import React from 'react';
import { closeTelegramWebApp } from '../utils/telegram';

interface TelegramGameOverProps {
  score: number;
  onPlayAgain: () => void;
}

export const TelegramGameOver: React.FC<TelegramGameOverProps> = ({ score, onPlayAgain }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-sm w-full mx-4">
        <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
        <p className="text-xl text-gray-300 mb-6">Your score: {score}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onPlayAgain}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full"
          >
            Play Again
          </button>
          <button
            onClick={() => closeTelegramWebApp()}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}; 