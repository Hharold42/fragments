'use client';

import { GameBoard } from '@/components/GameBoard';
import { useState } from 'react';

export default function GamePage() {
  const [score, setScore] = useState(0);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <GameBoard 
        onScoreUpdate={(newScore) => setScore(newScore)}
        onGameOver={() => console.log('Game Over')}
      />
    </main>
  );
} 