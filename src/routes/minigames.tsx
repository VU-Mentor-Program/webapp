import React, { useState, useEffect } from "react";
import FadeIn from "../components/Fadein-Wrapper";
import { OnePersonPong } from "../minigames/BrickBreaker";
import { SnakeGame } from "../minigames/SnakeGame";
import { FlappyLogoGame } from "../minigames/FlappyLogoGame";
import { LogoRacerGame } from "../minigames/LogoRacer";
import { LogoStackGame } from "../minigames/LogoTowerBuilder";
import { LogoSpaceShooterGame } from "../minigames/LogoSpaceShooter";
// import { LogoCatchGame } from "../minigames/LogoCatch";
import { LogoDodgeGame } from "../minigames/LogoDodge";
import { Logo } from "../components/logo";
import { useTranslations } from "../contexts/TranslationContext";
import PlinkoGame from "../minigames/Plinko";
import MinesweeperGame from "../minigames/MineSweeper";
import TypingGame from "../minigames/FastType";
// import PacManGame from "../minigames/PacMan";
import SimonSaysGame from "../minigames/SimonSays";
import Game2048 from "../minigames/2048";
// import { PinballGame } from "../minigames/PinBallGame";
import { BallBouncingGame } from "../minigames/Bouncer";
import WordleGame from "../minigames/Wordle";

export const MinigamesPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleSelectGame = (game: string) => {
    setSelectedGame(game);
  };


  const t = useTranslations("minigames");

  // --- Time Counter State ---
  const [timeSpent, setTimeSpent] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Convert timeSpent (in seconds) to hours, minutes, and seconds.
  const hours = Math.floor(timeSpent / 3600);
  const minutes = Math.floor((timeSpent % 3600) / 60);
  const seconds = timeSpent % 60;

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white text-center px-5">
      <div className="flex-grow flex flex-col items-center justify-center">
        <FadeIn duration={100}>
          <Logo />
        </FadeIn>

        <FadeIn duration={100}>
          <h1 className="text-2xl font-bold pt-1">{t("title")}</h1>
          <p className="text-base pt-1 pb-3">{t("game_choice")}</p>
        </FadeIn>

        <FadeIn duration={100}>
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
            <button
              onClick={() => handleSelectGame("towerBuilder")}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              🏗️ Tower Builder
            </button>
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
            <button
              onClick={() => handleSelectGame("fasttype")}
              className="bg-green-800 px-4 py-2 rounded hover:bg-green-900"
            >
              🤓 FastType
            </button>
            {/* <button
              onClick={() => handleSelectGame("pacman")}
              className="bg-green-800 px-4 py-2 rounded hover:bg-green-900"
            >
              PacMan
            </button> */}
            <button
              onClick={() => handleSelectGame("simonsays")}
              className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
            >
              🎵 SimonSays
            </button>
            <button
              onClick={() => handleSelectGame("2048")}
              className="bg-orange-600 px-4 py-2 rounded hover:bg-orange-700"
            >
              🔢 2048
            </button>
            {/* <button
              onClick={() => handleSelectGame("pinball")}
              className="bg-orange-600 px-4 py-2 rounded hover:bg-orange-700"
            >
              pinball
            </button> */}
            <button
              onClick={() => handleSelectGame("bouncer")}
              className="bg-yellow-400 px-4 py-2 rounded hover:bg-orange-700"
            > 🪩Bouncer
            </button>
            <button
              onClick={() => handleSelectGame("wordle")}
              className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
            >
              🧩 Wordle
            </button>
          </div>
        </FadeIn>

        <FadeIn duration={100}>
          <div className="w-full max-w-4xl">
            {selectedGame === "brickBreaker" && <OnePersonPong />}
            {selectedGame === "snake" && <SnakeGame />}
            {selectedGame === "flappy" && <FlappyLogoGame />}
            {selectedGame === "logoRacer" && <LogoRacerGame />}
            {selectedGame === "towerBuilder" && <LogoStackGame />}
            {selectedGame === "spaceShooter" && <LogoSpaceShooterGame />}
            {/* {selectedGame === "logoCatch" && <LogoCatchGame />} */}
            {selectedGame === "logoDodge" && <LogoDodgeGame />}
            {selectedGame === "plinko" && <PlinkoGame />}
            {selectedGame === "minesweeper" && <MinesweeperGame />}
            {selectedGame === "fasttype" && <TypingGame />}
            {/* {selectedGame === "pacman" && <PacManGame />} */}
            {selectedGame === "simonsays" && <SimonSaysGame />}
            {selectedGame === "2048" && <Game2048 />}
            {/* {selectedGame === "pinball" && <PinballGame />} */}
            {selectedGame === "bouncer" && <BallBouncingGame />}
            {selectedGame === "wordle" && <WordleGame />}
          </div>
        </FadeIn>
      </div>

      <FadeIn duration={100}>
        <div className="flex flex-col items-center">
          <p className="text-base pt-2 pb-2">
            {t("time_spent")}{" "}
            {hours}:{minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </p>
        </div>
      </FadeIn>
    </div>
  );
};
