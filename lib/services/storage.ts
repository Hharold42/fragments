import { Block, Matrix } from "../data/types";

interface GameState {
  board: Matrix;
  currentPieces: Block[];
  score: number;
}

class StorageService {
  private isWebApp: boolean;
  private webApp: any;
  private useLocalStorage: boolean;

  constructor() {
    // Проверяем, что приложение открыто через Telegram
    this.isWebApp = typeof window !== 'undefined' && 
                   'Telegram' in window && 
                   'WebApp' in (window as any).Telegram &&
                   (window as any).Telegram.WebApp.initDataUnsafe?.user;
    
    if (this.isWebApp) {
      this.webApp = (window as any).Telegram.WebApp;
      // Проверяем доступность CloudStorage
      this.useLocalStorage = !this.webApp.CloudStorage;
    } else {
      this.useLocalStorage = true;
    }
  }

  private async invokeStorageMethod(method: string, key: string, value?: string): Promise<any> {
    // Если приложение не открыто через Telegram, не выполняем операции с хранилищем
    if (!this.isWebApp) {
      console.log('Storage operations are only available in Telegram WebApp');
      return null;
    }

    if (this.useLocalStorage) {
      try {
        switch (method) {
          case 'setItem':
            localStorage.setItem(key, value || '');
            return;
          case 'getItem':
            return localStorage.getItem(key);
          case 'removeItem':
            localStorage.removeItem(key);
            return;
        }
      } catch (error) {
        console.error('LocalStorage operation failed:', error);
        return null;
      }
    } else {
      try {
        return await this.webApp.CloudStorage[method](key, value);
      } catch (error) {
        console.error('CloudStorage operation failed:', error);
        // Если CloudStorage недоступен, переключаемся на localStorage
        this.useLocalStorage = true;
        return this.invokeStorageMethod(method, key, value);
      }
    }
  }

  async saveCurrentGame(state: GameState) {
    if (!this.isWebApp) return;
    
    try {
      await this.invokeStorageMethod('setItem', 'currentGame', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  async getCurrentGame(): Promise<GameState | null> {
    if (!this.isWebApp) return null;
    
    try {
      const data = await this.invokeStorageMethod('getItem', 'currentGame');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  }

  async clearSavedGame() {
    if (!this.isWebApp) return;
    
    try {
      await this.invokeStorageMethod('removeItem', 'currentGame');
    } catch (error) {
      console.error('Failed to clear game state:', error);
    }
  }

  async getHighScore(): Promise<number> {
    if (!this.isWebApp) return 0;
    
    try {
      const score = await this.invokeStorageMethod('getItem', 'highScore');
      return score ? parseInt(score) : 0;
    } catch (error) {
      console.error('Failed to get high score:', error);
      return 0;
    }
  }

  async updateHighScore(score: number) {
    if (!this.isWebApp) return;
    
    try {
      const currentHighScore = await this.getHighScore();
      if (score > currentHighScore) {
        await this.invokeStorageMethod('setItem', 'highScore', score.toString());
      }
    } catch (error) {
      console.error('Failed to update high score:', error);
    }
  }

  // Метод для проверки, открыто ли приложение через Telegram
  isTelegramWebApp(): boolean {
    return this.isWebApp;
  }
}

export const storageService = new StorageService(); 