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

  // Track whether the game has started (canvas click/touch)
  const [hasStarted, setHasStarted] = useState(false);

  // Snake state
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

  // For rendering the head with a logo
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

  // Resize canvas to keep a square ratio
  useEffect(() => {
    function handleResize() {
      const maxWidth = Math.min(window.innerWidth * 0.9, LOGICAL_SIZE);
      setCanvasSize({ width: maxWidth, height: maxWidth });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ref to prevent multiple direction changes per move tick.
  const directionChangedRef = useRef<boolean>(false);

  // Helper: Generate a random food position not colliding with the snake.
  function getRandomFoodPosition(snake: { x: number; y: number }[]): { x: number; y: number } {
    let newFood: { x: number; y: number } = { x: 0, y: 0 };
    let collision = true;
    while (collision) {
      newFood = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
      };
      collision = snake.some((seg) => seg.x === newFood.x && seg.y === newFood.y);
    }
    return newFood;
  }

  // Move snake at set intervals. Only run if game is started, not paused, and not over.
  useEffect(() => {
    if (isPaused || gameOver || !hasStarted) return;
    const interval = setInterval(() => {
      moveSnake();
    }, speed);
    return () => clearInterval(interval);
  }, [snake, direction, isPaused, gameOver, speed, hasStarted]);

  function moveSnake() {
    // Reset the flag so that a new direction can be accepted for this move.
    directionChangedRef.current = false;

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
      // Get a new food position that is not on the snake.
      const newFood = getRandomFoodPosition(newSnake);
      setFood(newFood);
      setScore((prev) => prev + 30); // Increase score by 30
    } else {
      // Remove tail if no food eaten.
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

  // Keyboard controls with one direction change per tick.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      if (!directionChangedRef.current) {
        if (e.key === "ArrowUp" && direction !== "DOWN") {
          setDirection("UP");
          directionChangedRef.current = true;
        }
        if (e.key === "ArrowDown" && direction !== "UP") {
          setDirection("DOWN");
          directionChangedRef.current = true;
        }
        if (e.key === "ArrowLeft" && direction !== "RIGHT") {
          setDirection("LEFT");
          directionChangedRef.current = true;
        }
        if (e.key === "ArrowRight" && direction !== "LEFT") {
          setDirection("RIGHT");
          directionChangedRef.current = true;
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [direction]);

  // Touch controls (only accept one move per tick) with a check to prevent reverse direction.
  function handleTouch(dir: "UP" | "DOWN" | "LEFT" | "RIGHT") {
    // Do not allow reversing the snake directly.
    if (
      (dir === "UP" && direction === "DOWN") ||
      (dir === "DOWN" && direction === "UP") ||
      (dir === "LEFT" && direction === "RIGHT") ||
      (dir === "RIGHT" && direction === "LEFT")
    ) {
      return;
    }
    if (!directionChangedRef.current) {
      setDirection(dir);
      directionChangedRef.current = true;
    }
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
    // Optionally, wait for a new click/touch to start
    setHasStarted(false);
  }

  function togglePause() {
    setIsPaused((prev) => !prev);
  }

  // Draw the game canvas.
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

    // Draw snake segments
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

    // If the game hasn't started yet (and it's not over), overlay a "Click to Start" message.
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

      {/* On-screen arrow buttons for touch control */}
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
