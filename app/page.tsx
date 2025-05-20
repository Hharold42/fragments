'use client';

import GameBoard from '../components/GameBoard';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Block Blast</h1>
        <GameBoard />
      </div>
    </main>
  );
}
