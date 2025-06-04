"use client";

import React, { useState } from "react";
import GameBoard from "../components/GameBoard";
import MainMenu from "@/components/MainMenu";

type Screen = "main menu" | "classic mode" | "settings";

const HomePage: React.FC = () => {
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
        <GameBoard onExitGame={handleGoToMenu} />
      )}
    </div>
  );
};

export default HomePage;
