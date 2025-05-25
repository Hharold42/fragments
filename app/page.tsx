'use client';

import React, { useState } from "react";
import MainMenu from "../components/MainMenu";
import GameBoard from "../components/GameBoard";

const HomePage: React.FC = () => {
  const [showMenu, setShowMenu] = useState(true);

  return (
    <div className="min-h-screen bg-blue-900">
      {showMenu ? (
        <MainMenu onClassicClick={() => setShowMenu(false)} />
      ) : (
        <GameBoard />
      )}
    </div>
  );
};

export default HomePage;
