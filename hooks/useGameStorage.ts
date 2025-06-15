import { useState, useEffect } from 'react';
import { 
  getHighScore, 
  saveHighScore, 
  getGameState, 
  saveGameState, 
  clearGameState,
  isTelegramWebApp 
} from '../utils/telegram';

interface GameState {
  board: number[][];
  currentPieces: any[]; // Замените any на ваш тип для фигур
  score: number;
}

export const useGameStorage = () => {
  const [highScore, setHighScore] = useState<number>(0);
  const [savedGameState, setSavedGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка сохраненных данных при монтировании
  useEffect(() => {
    const loadSavedData = async () => {
      if (!isTelegramWebApp()) {
        setIsLoading(false);
        return;
      }

      try {
        const [savedHighScore, savedState] = await Promise.all([
          getHighScore(),
          getGameState()
        ]);

        setHighScore(savedHighScore);
        setSavedGameState(savedState);
      } catch (error) {
        console.error('Error loading saved data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, []);

  // Сохранение рекорда
  const updateHighScore = async (score: number) => {
    if (!isTelegramWebApp()) return;
    
    if (score > highScore) {
      await saveHighScore(score);
      setHighScore(score);
    }
  };

  // Сохранение состояния игры
  const saveCurrentGame = async (gameState: GameState) => {
    if (!isTelegramWebApp()) return;
    
    await saveGameState(gameState);
    setSavedGameState(gameState);
  };

  // Очистка сохраненного состояния игры
  const clearSavedGame = async () => {
    if (!isTelegramWebApp()) return;
    
    await clearGameState();
    setSavedGameState(null);
  };

  return {
    highScore,
    savedGameState,
    isLoading,
    updateHighScore,
    saveCurrentGame,
    clearSavedGame,
    isWebApp: isTelegramWebApp()
  };
}; 