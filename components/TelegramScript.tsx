'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export const TelegramScript = () => {
  useEffect(() => {
    const initTelegram = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      }
    };

    // Проверяем, загружен ли уже скрипт
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      initTelegram();
    }
  }, []);

  return (
    <Script
      src="https://telegram.org/js/telegram-web-app.js"
      strategy="afterInteractive"
    />
  );
}; 