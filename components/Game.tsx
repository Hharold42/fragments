import { useEffect } from 'react';
import { useGameStore } from '../lib/state/store';
import { Board } from './Board';
import { PieceSelector } from './PieceSelector';
import { ScoreDisplay } from './ScoreDisplay';
import { GameOver } from './GameOver';

export const Game = () => {
  const { 
    initializeGame, 
    gameOver, 
    loadGameState,
    saveGameState 
  } = useGameStore();

  useEffect(() => {
    // Пытаемся загрузить сохраненное состояние при старте
    loadGameState().then(() => {
      // Если нет сохраненного состояния, инициализируем новую игру
      if (!useGameStore.getState().currentPieces.length) {
        initializeGame();
      }
    });
  }, []);

  // Сохраняем состояние при размонтировании компонента
  useEffect(() => {
    return () => {
      saveGameState();
    };
  }, []);

  return (
    <div className="game-container">
      <ScoreDisplay />
      <Board />
      <PieceSelector />
      {gameOver && <GameOver />}
    </div>
  );
}; 