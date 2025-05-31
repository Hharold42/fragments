'use client';

import React from "react";
import GameBoard from "../components/GameBoard";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-900">
      <GameBoard />
    </div>
  );
};

export default HomePage;
