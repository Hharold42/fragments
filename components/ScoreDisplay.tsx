import React, { useEffect, useState } from 'react';
import { ScoreResult } from '../lib/data/types';

interface ScoreDisplayProps {
  score: ScoreResult;
  className?: string;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, className = '' }) => {
  const [displayScore, setDisplayScore] = useState(score.totalPoints);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (score.totalPoints !== displayScore) {
      setIsAnimating(true);
      // Анимация изменения счета
      const animationDuration = 500; // ms
      const startScore = displayScore;
      const endScore = score.totalPoints;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        // Плавная анимация с использованием easeOutQuad
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        const currentScore = Math.round(startScore + (endScore - startScore) * easeProgress);

        setDisplayScore(currentScore);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [score.totalPoints]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`text-4xl font-bold transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
        {displayScore.toLocaleString()}
      </div>
      {score.comboLevel > 0 && (
        <div className="text-lg text-yellow-500 animate-bounce">
          Комбо: {score.comboLevel} (×{score.comboBonus})
        </div>
      )}
      {score.isBoardCleared && (
        <div className="text-lg text-green-500 animate-pulse">
          +300 бонус за очистку поля!
        </div>
      )}
    </div>
  );
}; 