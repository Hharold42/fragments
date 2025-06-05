"use client";

import React, { useState } from "react";
import GameBoard from "../components/GameBoard";
import MainMenu from "@/components/MainMenu";

type Screen = "main menu" | "classic mode" | "settings";

const HomePage: React.FC = () => {
  const [score, setScore] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<Screen>("main menu");

  const hadleStartClassic = () => {
    setCurrentScreen("classic mode");
  };

  const handleGoToMenu = () => {
    setCurrentScreen("main menu");
  };

  return (
    <div className="min-h-screen bg-blue-900">
      {currentScreen === "main menu" && (
        <MainMenu onStartClassic={hadleStartClassic} />
      )}
      {currentScreen === "classic mode" && (
        <GameBoard
          onExitGame={handleGoToMenu}
          onScoreUpdate={(newScore) => setScore(newScore)}
          onGameOver={() => console.log("Game Over")}
        />
      )}
    </div>
  );
};

export default HomePage;