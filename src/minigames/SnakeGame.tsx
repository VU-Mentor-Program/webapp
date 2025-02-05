import React, { useEffect, useRef, useState } from "react";
import mpLogo from "../assets/mp_logo.png";
import PauseButton from "../components/minigame page/PauseButton";
import RestartButton from "../components/minigame page/RestartButton";
import SpeedSlider from "../components/minigame page/SpeedSlider";
import GameOverModal from "../components/minigame page/GameOverModal";

export const SnakeGame: React.FC = () => {
  const LOGICAL_SIZE = 400;
  const tileCount = 20;
  const tileSize = 20;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 300 });

  // New state to track whether the game has started
  const [hasStarted, setHasStarted] = useState(false);

  // Resize canvas to keep square ratio
  useEffect(() => {
    function handleResize() {
      const maxWidth = Math.min(window.innerWidth * 0.9, LOGICAL_SIZE);
      setCanvasSize({ width: maxWidth, height: maxWidth });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [direction, setDirection] = useState<"UP" | "DOWN" | "LEFT" | "RIGHT">("RIGHT");
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 5, y: 10 },
    { x: 4, y: 10 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 10, y: 10 });
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(200); // Speed in ms

  const [logoLoaded, setLogoLoaded] = useState(false);
  const logoImg = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoImg.current = img;
      setLogoLoaded(true);
    };
  }, []);

  // Move snake at set interval.
  // Only run the movement if the game has started, is not paused, and is not over.
  useEffect(() => {
    if (isPaused || gameOver || !hasStarted) return;

    const interval = setInterval(() => {
      moveSnake();
    }, speed);

    return () => clearInterval(interval);
  }, [snake, direction, isPaused, gameOver, speed, hasStarted]);

  function moveSnake() {
    const head = { ...snake[0] };
    if (direction === "UP") head.y -= 1;
    if (direction === "DOWN") head.y += 1;
    if (direction === "LEFT") head.x -= 1;
    if (direction === "RIGHT") head.x += 1;

    // Wrap edges
    if (head.x < 0) head.x = tileCount - 1;
    if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y >= tileCount) head.y = 0;

    const newSnake = [head, ...snake];

    // Check collision with food
    if (head.x === food.x && head.y === food.y) {
      setFood({
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
      });
      setScore((prev) => prev + 30); // Increase score by 30
    } else {
      newSnake.pop();
    }

    // Check collision with self
    for (let i = 1; i < newSnake.length; i++) {
      if (newSnake[i].x === head.x && newSnake[i].y === head.y) {
        setGameOver(true);
        return;
      }
    }

    setSnake(newSnake);
  }

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Prevent default scrolling when arrow keys are pressed.
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowUp" && direction !== "DOWN") setDirection("UP");
      if (e.key === "ArrowDown" && direction !== "UP") setDirection("DOWN");
      if (e.key === "ArrowLeft" && direction !== "RIGHT") setDirection("LEFT");
      if (e.key === "ArrowRight" && direction !== "LEFT") setDirection("RIGHT");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [direction]);

  function handleTouch(dir: "UP" | "DOWN" | "LEFT" | "RIGHT") {
    setDirection(dir);
  }

  function restartGame() {
    setSnake([
      { x: 5, y: 10 },
      { x: 4, y: 10 },
    ]);
    setFood({ x: 10, y: 10 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setDirection("RIGHT");
    // Optionally, reset hasStarted so that the game waits for another click
    setHasStarted(false);
  }

  function togglePause() {
    setIsPaused((prev) => !prev);
  }

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = canvasSize.width / LOGICAL_SIZE;

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(
      food.x * tileSize * scale,
      food.y * tileSize * scale,
      tileSize * scale,
      tileSize * scale
    );

    // Draw snake
    snake.forEach((seg, idx) => {
      const x = seg.x * tileSize * scale;
      const y = seg.y * tileSize * scale;
      const size = tileSize * scale;
      if (idx === 0 && logoLoaded && logoImg.current) {
        ctx.drawImage(logoImg.current, x, y, size, size);
      } else {
        ctx.fillStyle = "lime";
        ctx.fillRect(x, y, size, size);
      }
    });

    // If the game hasn't started yet (and game over hasn't occurred), overlay a "Click to Start" message.
    if (!hasStarted && !gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = `${20 * scale}px Arial`;
      const message = "Click to Start";
      const textWidth = ctx.measureText(message).width;
      ctx.fillText(message, (canvas.width - textWidth) / 2, canvas.height / 2);
    }
  });

  // When the canvas is clicked/touched, start the game (if not already started).
  function handleStart() {
    if (!hasStarted) {
      setHasStarted(true);
    }
  }

  return (
    <div style={{ marginBottom: "1rem", textAlign: "center", color: "white" }}>
      <h3>🐍 Snake Game</h3>
      <p className="text-lg font-bold">Score: {score}</p>

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ background: "#222", border: "1px solid #fff" }}
        onClick={handleStart}
        onTouchStart={handleStart}
      />

      {/* On-screen arrows with bigger buttons */}
      <div style={{ marginTop: "1rem", display: "inline-block" }}>
        <div>
          <button
            onClick={() => handleTouch("UP")}
            style={{
              fontSize: "1.5rem",
              background: "#444",
              color: "#fff",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              margin: "0.3rem",
            }}
          >
            ↑
          </button>
        </div>
        <div>
          <button
            onClick={() => handleTouch("LEFT")}
            style={{
              fontSize: "1.5rem",
              background: "#444",
              color: "#fff",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              margin: "0.3rem",
              marginRight: "1.5rem",
            }}
          >
            ←
          </button>
          <button
            onClick={() => handleTouch("RIGHT")}
            style={{
              fontSize: "1.5rem",
              background: "#444",
              color: "#fff",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              margin: "0.3rem",
              marginLeft: "1.5rem",
            }}
          >
            →
          </button>
        </div>
        <div>
          <button
            onClick={() => handleTouch("DOWN")}
            style={{
              fontSize: "1.5rem",
              background: "#444",
              color: "#fff",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              margin: "0.3rem",
            }}
          >
            ↓
          </button>
        </div>
      </div>

      <SpeedSlider speed={speed} onChange={setSpeed} />

      <div className="flex justify-center gap-4 mt-4">
        <PauseButton isPaused={isPaused} onTogglePause={togglePause} />
        <RestartButton onRestart={restartGame} />
      </div>

      <GameOverModal
        isOpen={gameOver}
        score={score}
        gameName={"snake"}
        onClose={restartGame}
        onRestart={restartGame}
      />
    </div>
  );
};
