// fragments/components/UI/MenuButton.tsx
import React, { FC, ReactNode } from "react";
import Image, { StaticImageData } from "next/image";

interface MenuButtonProps {
  text?: string | ReactNode; // Текст или любой React узел для содержимого кнопки
  leftIcon?: StaticImageData | string; // Иконка слева (Next.js Image StaticImageData or string src)
  rightIcon?: StaticImageData | string; // Иконка справа
  gradientClass: string; // Класс для градиентного фона (например, 'orange-gradient', 'green-gradient')
  notificationCount?: number; // Необязательное количество уведомлений для отображения
  className?: string; // Дополнительные классы для кнопки
  onClick?: () => void; // Обработчик клика
  textClasses?: string;
  imageClasses?: string;
}

const MenuButton: FC<MenuButtonProps> = ({
  text,
  leftIcon,
  rightIcon,
  gradientClass,
  notificationCount,
  className = "",
  onClick,
  textClasses = "",
  imageClasses,
}) => {
  return (
    <button
      className={`menu-button ${gradientClass} ${className}`}
      onClick={onClick}
    >
      <span className="flex flex-row items-center gap-2 w-full justify-center">
        {/* Левая иконка */}
        {leftIcon && (
          <span className="menu-shadow flex items-center justify-center h-[3rem] min-w-[3rem]">
            <Image
              src={leftIcon}
              alt="left icon"
              className="w-auto max-h-[100%] object-contain"
              width={0}
              height={0}
            />
          </span>
        )}

        {/* Текст или содержимое */}
        {text && (
          <span
            className={`${textClasses} flex flex-col items-start  justify-center text-white font-figtree   menu-shadow min-h-[44px]`}
          >
            {text}
          </span>
        )}

        {/* Правая иконка */}
        {rightIcon && (
          <span className={`${imageClasses} flex items-center justify-center `}>
            <Image
              src={rightIcon}
              alt="right icon"
              className={` w-auto h-full object-contain max-h-[6vh]`}
              width={0}
              height={0}
            />
          </span>
        )}
      </span>

      {/* Счетчик уведомлений */}
      {notificationCount !== undefined && notificationCount > 0 && (
        <span
          className="absolute -top-4 -right-4 notif-gradient text-white text-md w-8 h-8
         flex items-center justify-center rounded-full font-figtree font-bold text-[1.5rem] sm:text-xs"
        >
          {notificationCount}
        </span>
      )}
    </button>
  );
};

export default MenuButton;
