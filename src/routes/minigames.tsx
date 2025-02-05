import React, { useState } from "react";
import { OnePersonPong } from "../minigames/BrickBreaker";
import { SnakeGame } from "../minigames/SnakeGame";
import { FlappyLogoGame } from "../minigames/FlappyLogoGame";
import { LogoRacerGame } from "../minigames/LogoRacer";
// import { TowerBuilderGame } from "../minigames/LogoTowerBuilder";
import { LogoSpaceShooterGame } from "../minigames/LogoSpaceShooter";
// import { LogoCatchGame } from "../minigames/LogoCatch";
import { LogoDodgeGame } from "../minigames/LogoDodge";
import { Logo } from "../components/logo";
import LeaderBoard from "../components/minigame page/LeaderBoard"
import { useTranslations } from "../contexts/TranslationContext";
import PlinkoGame from "../minigames/Plinko";
import MinesweeperGame from "../minigames/MineSweeper";

export const MinigamesPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleSelectGame = (game: string) => {
    setSelectedGame(game);
  };

  const minigames = [
    "brickBreaker",
    "snake",
    "flappy",
    "logoDodge",
    "logoRacer",
    "spaceShooter",
    "plinko",
    "minesweeper"
  ];

  const t = useTranslations("minigames");

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white text-center px-5">
      <div className="flex-grow flex flex-col items-center justify-center">
        <Logo />
        <h1 className="text-2xl font-bold pt-1">{t("title")}</h1>
        <p className="text-base pt-1 pb-3">{t("game_choice")}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-5 p-2">
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
          <button
            onClick={() => handleSelectGame("logoDodge")}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
            🚗 Logo Dodge
          </button>
          <button
            onClick={() => handleSelectGame("logoRacer")}
            className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700"
          >
            🏎️ Logo Racer
          </button>
          {/* <button
            onClick={() => handleSelectGame("towerBuilder")}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
          >
            🏗️ Tower Builder
          </button> */}
          <button
            onClick={() => handleSelectGame("spaceShooter")}
            className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
          >
            🚀 Space Shooter
          </button>
          {/* <button
            onClick={() => handleSelectGame("logoCatch")}
            className="bg-pink-600 px-4 py-2 rounded hover:bg-pink-700"
          >
            🧺 Logo Catch
          </button> */}
          <button
            onClick={() => handleSelectGame("plinko")}
            className="bg-orange-500 px-4 py-2 rounded hover:bg-orange-600"
          >
            🔴 Plinko
          </button>
          <button
            onClick={() => handleSelectGame("minesweeper")}
            className="bg-teal-500 px-4 py-2 rounded hover:bg-teal-600"
          >
            💣 MineSweeper
          </button>
        </div>

        <div className="w-full max-w-4xl">
          {selectedGame === "brickBreaker" && <OnePersonPong />}
          {selectedGame === "snake" && <SnakeGame />}
          {selectedGame === "flappy" && <FlappyLogoGame />}
          {selectedGame === "logoRacer" && <LogoRacerGame />}
          {/* {selectedGame === "towerBuilder" && <TowerBuilderGame />} */}
          {selectedGame === "spaceShooter" && <LogoSpaceShooterGame />}
          {/* {selectedGame === "logoCatch" && <LogoCatchGame />} */}
          {selectedGame === "logoDodge" && <LogoDodgeGame />}
          { selectedGame === "plinko" && <PlinkoGame /> }
          { selectedGame === "minesweeper" && <MinesweeperGame />}
        </div>
      </div>

      <LeaderBoard games={minigames} />
    </div>
  );
};
