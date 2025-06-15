interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    auth_date?: number;
    hash?: string;
  };
  ready(): void;
  expand(): void;
  close(): void;
  CloudStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText(text: string): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive: boolean): void;
    hideProgress(): void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

// Интерфейсы для данных
interface GameState {
  board: number[][];
  currentPieces: any[]; // Замените any на ваш тип для фигур
  score: number;
}

interface SavedData {
  highScore: number;
  gameState?: GameState;
}

// Ключи для Cloud Storage
const STORAGE_KEYS = {
  HIGH_SCORE: 'high_score',
  GAME_STATE: 'game_state',
} as const;

export const getTelegramUser = (): TelegramUser | null => {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
};

export const isTelegramWebApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!window.Telegram?.WebApp;
};

export const initTelegramWebApp = (): void => {
  if (typeof window === 'undefined') return;
  window.Telegram?.WebApp?.ready();
  window.Telegram?.WebApp?.expand();
};

export const closeTelegramWebApp = (): void => {
  if (typeof window === 'undefined') return;
  window.Telegram?.WebApp?.close();
};

// Функции для работы с Cloud Storage
export const saveHighScore = async (score: number): Promise<void> => {
  if (!isTelegramWebApp()) return;
  
  try {
    const currentHighScore = await getHighScore();
    if (score > currentHighScore) {
      await window.Telegram?.WebApp?.CloudStorage.setItem(
        STORAGE_KEYS.HIGH_SCORE,
        score.toString()
      );
    }
  } catch (error) {
    console.error('Error saving high score:', error);
  }
};

export const getHighScore = async (): Promise<number> => {
  if (!isTelegramWebApp()) return 0;
  
  try {
    const score = await window.Telegram?.WebApp?.CloudStorage.getItem(
      STORAGE_KEYS.HIGH_SCORE
    );
    return score ? parseInt(score, 10) : 0;
  } catch (error) {
    console.error('Error getting high score:', error);
    return 0;
  }
};

export const saveGameState = async (gameState: GameState): Promise<void> => {
  if (!isTelegramWebApp()) return;
  
  try {
    await window.Telegram?.WebApp?.CloudStorage.setItem(
      STORAGE_KEYS.GAME_STATE,
      JSON.stringify(gameState)
    );
  } catch (error) {
    console.error('Error saving game state:', error);
  }
};

export const getGameState = async (): Promise<GameState | null> => {
  if (!isTelegramWebApp()) return null;
  
  try {
    const state = await window.Telegram?.WebApp?.CloudStorage.getItem(
      STORAGE_KEYS.GAME_STATE
    );
    return state ? JSON.parse(state) : null;
  } catch (error) {
    console.error('Error getting game state:', error);
    return null;
  }
};

export const clearGameState = async (): Promise<void> => {
  if (!isTelegramWebApp()) return;
  
  try {
    await window.Telegram?.WebApp?.CloudStorage.removeItem(
      STORAGE_KEYS.GAME_STATE
    );
  } catch (error) {
    console.error('Error clearing game state:', error);
  }
}; 