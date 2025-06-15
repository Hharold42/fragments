import React from 'react';
import { useTelegramUser } from '@/hooks/useTelegramUser';

export const TelegramInfo: React.FC = () => {
  const { isWebApp, user } = useTelegramUser();

  if (!isWebApp) return null;

  return (
    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
      Telegram WebApp
      {user?.id && (
        <div className="text-xs mt-1">
          User ID: {user.id}
        </div>
      )}
    </div>
  );
}; 