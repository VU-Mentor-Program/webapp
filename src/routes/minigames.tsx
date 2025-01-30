import React, { useState } from "react";
import { OnePersonPong } from "../components/OnePersonPong";
import { SnakeGame } from "../components/SnakeGame";
import { FlappyLogoGame } from "../components/FlappyLogoGame";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Logo } from "../components/logo";

export const MinigamesPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleSelectGame = (game: string) => {
    setSelectedGame(game);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white text-center px-5">
      <Header />
      <div className="flex-grow flex flex-col items-center justify-center">
        <Logo />
        <h1 className="text-2xl font-bold pt-1">Minigames</h1>
        <p className="text-base pt-1 pb-3">Choose a game to play!</p>

        <div className="flex gap-4 mb-5">
          <button
            onClick={() => handleSelectGame("brickBreaker")}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            🔨 Brick Breaker
          </button>
          <button
            onClick={() => handleSelectGame("snake")}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          >
            🐍 Snake
          </button>
          <button
            onClick={() => handleSelectGame("flappy")}
            className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
          >
            🪂 Flappy Logo
          </button>
        </div>

        <div className="w-full max-w-4xl">
          {selectedGame === "brickBreaker" && <OnePersonPong />}
          {selectedGame === "snake" && <SnakeGame />}
          {selectedGame === "flappy" && <FlappyLogoGame />}
        </div>
      </div>
      <Footer />
    </div>
  );
};
