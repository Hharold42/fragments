import React, { FC, useMemo } from "react";
import star from "@/public/romn.svg";
import Image from "next/image";

interface BackgroundAnimationProps {
  className?: string;
}


const NUM_ELEMENTS = 12; // Количество анимированных элементов
const generateRandomElements = () => {
  const elements = [];
  for (let i = 0; i < NUM_ELEMENTS; i++) {
    const size = Math.random() * 40 + 30;
    const duration = Math.random() * 10 + 8;
    const delay = Math.random() * 10;
    const initialLeft = Math.random() * 100; 


    elements.push({
      id: i,
      size,
      duration,
      delay,
      initialLeft,
      // figType,
    });
  }
  return elements;
};

const BackgroundAnimation: FC<BackgroundAnimationProps> = ({ className }) => {
  const animatedElements = useMemo(() => generateRandomElements(), []);

  return (
    <div className={className}>
      {animatedElements.map((element) =>
        element.id % 2 === 0 ? (
          <div
            key={element.id}
            className="falling-element absolute falling-square rounded" // Используем базовый класс loh и tailwind классы
            style={
              {
                width: `${element.size}px`,
                height: `${element.size}px`,
                left: `${element.initialLeft}%`,
                // Применяем рандомную длительность и задержку через CSS переменные
                "--animation-duration": `${element.duration}s`,
                "--animation-delay": `${element.delay}s`,
              } as React.CSSProperties
            } // Указываем тип для поддержки CSS переменных
          ></div>
        ) : (
          <Image
            key={element.id}
            src={star}
            alt="star"
            className="falling-element absolute"
            
            style={
              {
                width: `${element.size}px`,
                height: `${element.size}px`,
                left: `${element.initialLeft}%`,
                "--animation-duration": `${element.duration}s`,
                "--animation-delay": `${element.delay}s`,
              } as React.CSSProperties
            } 
          />
        )
      )}
    </div>
  );
};

export default BackgroundAnimation;
