"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import star from "@/public/romn.svg";
import Image from "next/image";
import { createArray, getRandomItem } from "@/utils/helpers";

interface BackgroundAnimationProps {
  className?: string;
}

const NUM_ELEMENTS = 20; // Количество анимированных элементов
const SIZES = [20, 30, 40, 50, 60, 70];
const START_LEFT = 3; // Начальная позиция слева
const END_LEFT = 97; // Конечная позиция слева
const STEP_LEFT = (END_LEFT - START_LEFT) / (NUM_ELEMENTS - 1);
const leftOffsets = createArray(START_LEFT, END_LEFT + STEP_LEFT, STEP_LEFT); // Создаем массив отступов

const generateRandomElements = () => {
  const elements = [];
  for (let i = 0; i < NUM_ELEMENTS; i++) {
    const size = getRandomItem(SIZES);
    const duration = Math.random() * 10 + 8;
    const delay = Math.random() * 5 + 1;
    const initialLeft = leftOffsets[i];

    elements.push({
      id: i,
      size,
      duration,
      delay,
      initialLeft,
    });
  }
  return elements;
};

const BackgroundAnimation: FC<BackgroundAnimationProps> = ({ className }) => {
  const [animatedElements, setAnimatedElements] = useState<any[]>([]); // Use useState to manage elements

  useEffect(() => {
    setAnimatedElements(generateRandomElements());
  }, []);

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
                width: `${element.size * 2}px`,
                height: `${element.size * 2}px`,
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
