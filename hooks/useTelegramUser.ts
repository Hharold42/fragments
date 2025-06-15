import { useState, useEffect } from 'react';
import { getTelegramUser, isTelegramWebApp } from '../utils/telegram';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export const useTelegramUser = () => {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isWebApp, setIsWebApp] = useState(false);

  useEffect(() => {
    setMounted(true);
    const telegramUser = getTelegramUser();
    setUser(telegramUser);
    setIsWebApp(isTelegramWebApp());
  }, []);

  return {
    user: mounted ? user : null,
    isWebApp: mounted ? isWebApp : false,
    userId: mounted ? user?.id : null,
    userName: mounted ? (user?.username || user?.first_name) : null,
  };
}; 