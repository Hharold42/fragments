'use client';

import { GameBoard } from '@/components/GameBoard';
import { useState } from 'react';

export default function Home() {
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-blue-900">
      <GameBoard 
        onScoreUpdate={(newScore) => setScore(newScore)}
        onGameOver={() => console.log('Game Over')}
      />
    </div>
  );
}
