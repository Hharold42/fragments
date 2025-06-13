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
  showPopup(params: { title: string; message: string; buttons?: Array<{ id: string; type: string; text: string }> }): void;
  showAlert(message: string): void;
  showConfirm(message: string): Promise<boolean>;
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

export const showGameOverPopup = (score: number): void => {
  if (typeof window === 'undefined') return;
  window.Telegram?.WebApp?.showPopup({
    title: 'Game Over!',
    message: `Your score: ${score}`,
    buttons: [
      {
        id: 'play_again',
        type: 'default',
        text: 'Play Again'
      },
      {
        id: 'exit',
        type: 'destructive',
        text: 'Exit'
      }
    ]
  });
}; 