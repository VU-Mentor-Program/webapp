// PacManGame.tsx
import React, { useState, useEffect, useRef } from "react";
import GameOverModal from "../components/minigame page/GameOverModal";
import PauseButton from "../components/minigame page/PauseButton";

const CELL_SIZE = 30;
const ROWS = 13;
const COLS = 15;

// Maze grid: 1 = wall, 0 = path (with dot)
const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,0,1,0,0,1,1,1,0,1],
  [1,0,1,0,1,0,0,0,0,0,1,0,1,0,1],
  [1,0,1,0,1,1,1,1,1,0,1,0,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
  [1,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,1,0,0,0,0,1,0,1,0,1],
  [1,0,1,1,0,1,1,1,1,0,1,0,1,0,1],
  [1,0,1,0,0,0,0,0,1,0,1,0,1,0,1],
  [1,0,1,0,1,1,1,0,1,0,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const PacManGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pacman, setPacman] = useState({ row: 1, col: 1 });
  const [ghosts, setGhosts] = useState([{ row: 11, col: 13 }]);
  const [dots, setDots] = useState<Set<string>>(new Set());
  const [direction, setDirection] = useState<{ dRow: number; dCol: number }>({ dRow: 0, dCol: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  // Initialize dots on all path cells (except pacman's starting cell)
  useEffect(() => {
    const initialDots = new Set<string>();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (MAZE[r][c] === 0 && !(r === 1 && c === 1)) {
          initialDots.add(`${r},${c}`);
        }
      }
    }
    setDots(initialDots);
  }, []);

  // Listen for arrow key input (if not paused or game over)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (paused || gameOver) return;
      switch (e.key) {
        case "ArrowUp":
          setDirection({ dRow: -1, dCol: 0 });
          break;
        case "ArrowDown":
          setDirection({ dRow: 1, dCol: 0 });
          break;
        case "ArrowLeft":
          setDirection({ dRow: 0, dCol: -1 });
          break;
        case "ArrowRight":
          setDirection({ dRow: 0, dCol: 1 });
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paused, gameOver]);

  // Main game loop – moves pacman and ghosts every 200ms
  useEffect(() => {
    if (gameOver || paused) return;
    const interval = setInterval(() => {
      // Move Pac-Man if the next cell is not a wall.
      const newRow = pacman.row + direction.dRow;
      const newCol = pacman.col + direction.dCol;
      if (
        newRow >= 0 &&
        newRow < ROWS &&
        newCol >= 0 &&
        newCol < COLS &&
        MAZE[newRow][newCol] !== 1
      ) {
        setPacman({ row: newRow, col: newCol });
        // Eat dot if present
        const posKey = `${newRow},${newCol}`;
        if (dots.has(posKey)) {
          const newDots = new Set(dots);
          newDots.delete(posKey);
          setDots(newDots);
          setScore((prev) => prev + 10);
        }
      }
      // Move ghosts randomly
      setGhosts((prevGhosts) =>
        prevGhosts.map((ghost) => {
          const possibleMoves = [];
          const moves = [
            { dRow: -1, dCol: 0 },
            { dRow: 1, dCol: 0 },
            { dRow: 0, dCol: -1 },
            { dRow: 0, dCol: 1 },
          ];
          for (const move of moves) {
            const gr = ghost.row + move.dRow;
            const gc = ghost.col + move.dCol;
            if (
              gr >= 0 &&
              gr < ROWS &&
              gc >= 0 &&
              gc < COLS &&
              MAZE[gr][gc] !== 1
            ) {
              possibleMoves.push({ row: gr, col: gc });
            }
          }
          if (possibleMoves.length > 0) {
            return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
          }
          return ghost;
        })
      );
      // Check collision between Pac-Man and any ghost
      for (const ghost of ghosts) {
        if (ghost.row === pacman.row && ghost.col === pacman.col) {
          setGameOver(true);
          break;
        }
      }
    }, 200);
    return () => clearInterval(interval);
  }, [pacman, direction, dots, ghosts, gameOver, paused]);

  // Render the maze, dots, Pac-Man, and ghosts on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw maze walls and background
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.fillStyle = MAZE[r][c] === 1 ? "#1a1a1a" : "#000";
        ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
    // Draw dots
    dots.forEach((pos) => {
      const [r, c] = pos.split(",").map(Number);
      ctx.beginPath();
      ctx.fillStyle = "#fff";
      ctx.arc(c * CELL_SIZE + CELL_SIZE / 2, r * CELL_SIZE + CELL_SIZE / 2, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
    // Draw Pac-Man
    ctx.beginPath();
    ctx.fillStyle = "yellow";
    ctx.arc(
      pacman.col * CELL_SIZE + CELL_SIZE / 2,
      pacman.row * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0.25 * Math.PI,
      1.75 * Math.PI
    );
    ctx.lineTo(pacman.col * CELL_SIZE + CELL_SIZE / 2, pacman.row * CELL_SIZE + CELL_SIZE / 2);
    ctx.fill();
    // Draw ghosts
    ghosts.forEach((ghost) => {
      ctx.beginPath();
      ctx.fillStyle = "red";
      ctx.arc(
        ghost.col * CELL_SIZE + CELL_SIZE / 2,
        ghost.row * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        Math.PI,
        2 * Math.PI
      );
      ctx.lineTo(ghost.col * CELL_SIZE + CELL_SIZE / 2 - (CELL_SIZE / 2 - 2), ghost.row * CELL_SIZE + CELL_SIZE / 2);
      ctx.fill();
    });
  }, [pacman, ghosts, dots]);

  const togglePause = () => {
    setPaused((prev) => !prev);
  };

  const restartGame = () => {
    setPacman({ row: 1, col: 1 });
    setGhosts([{ row: 11, col: 13 }]);
    // Reinitialize dots
    const initialDots = new Set<string>();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (MAZE[r][c] === 0 && !(r === 1 && c === 1)) {
          initialDots.add(`${r},${c}`);
        }
      }
    }
    setDots(initialDots);
    setDirection({ dRow: 0, dCol: 0 });
    setScore(0);
    setGameOver(false);
    setPaused(false);
  };

  return (
    <div className="relative flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-2">Pac-Man Clone</h1>
      <div className="mb-2">
        <PauseButton isPaused={paused} onTogglePause={togglePause} />
      </div>
      <canvas
        ref={canvasRef}
        width={COLS * CELL_SIZE}
        height={ROWS * CELL_SIZE}
        className="border-4 border-gray-700 bg-black"
      />
      <div className="mt-2 text-white">Score: {score}</div>
      <GameOverModal
        isOpen={gameOver}
        score={score}
        gameName="PacMan"
        onClose={() => setGameOver(false)}
        onRestart={restartGame}
      />
    </div>
  );
};

export default PacManGame;
