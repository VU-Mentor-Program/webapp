import React, { useEffect, useRef, useState } from "react";
import mpLogo from "../assets/mp_logo-CIRCLE.png";
import GameOverModal from "../components/minigame page/GameOverModal";
import PauseButton from "../components/minigame page/PauseButton";
import RestartButton from "../components/minigame page/RestartButton";

export const LogoRacerGame: React.FC = () => {
  const LOGICAL_WIDTH = 800;
  const LOGICAL_HEIGHT = 400;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 250, height: 600 });

  // Game States
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setPaused] = useState(false);
  const [score, setScore] = useState(0);

  // New: Track whether the game has started.
  const [hasStarted, setHasStarted] = useState(false);

  // Game Properties
  const carX = 100;
  const groundY = 300;
  const carSize = 50;
  const [carY, setCarY] = useState(groundY);
  const [carVY, setCarVY] = useState(0);
  const [carAngle, setCarAngle] = useState(0);
  const [speed, setSpeed] = useState(10);
  const gravity = 0.5;

  // Obstacles
  type Obstacle = { x: number; y: number; w: number; h: number };
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const spawnFrameRef = useRef(0);

  // Logo Image
  const logoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  // Handle Resize (Ensure Game Fits Screen)
  useEffect(() => {
    function handleResize() {
      const maxWidth = Math.min(window.innerWidth * 0.9, LOGICAL_WIDTH);
      const scale = maxWidth / LOGICAL_WIDTH;
      setCanvasSize({ width: maxWidth, height: LOGICAL_HEIGHT * scale });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Remove the global click/touch jump listener.
  // Instead, we attach a handler on the canvas (see below).

  // Game Loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      // Only update the game if it has started, is not paused, and not over.
      if (!isPaused && !gameOver && hasStarted) {
        updateGame();
      }
      drawGame();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, gameOver, carY, carVY, obstacles, speed, score, canvasSize, hasStarted]);

  function updateGame() {
    if (gameOver || isPaused) return;

    // Apply gravity and update car position.
    setCarVY((vy) => vy + gravity);
    setCarY((y) => (y + carVY > groundY ? groundY : y + carVY));

    setCarAngle((angle) => angle + 3);

    // Update obstacles: move them left and filter out off-screen ones.
    setObstacles((obs) =>
      obs
        .map((o) => ({ ...o, x: o.x - speed }))
        .filter((o) => o.x + o.w > 0)
    );

    // Increase speed slightly over time.
    setSpeed((s) => s + 0.005);

    spawnFrameRef.current++;
    if (spawnFrameRef.current % 100 === 0) {
      const obstacleHeight = 50 + Math.random() * 50;
      setObstacles((prev) => [
        ...prev,
        { x: LOGICAL_WIDTH, y: groundY + carSize - obstacleHeight, w: 50, h: obstacleHeight },
      ]);
    }

    // Check for collision between car and obstacles.
    obstacles.forEach((o) => {
      if (carX < o.x + o.w && carX + carSize > o.x && carY + carSize > o.y) {
        setGameOver(true);
      }
    });

    // Increase score continuously.
    setScore((s) => s + 1);
  }

  function drawGame() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;

    ctx.save();
    ctx.scale(scaleX, scaleY);

    // Draw ground.
    ctx.fillStyle = "green";
    ctx.fillRect(0, groundY + carSize, LOGICAL_WIDTH, LOGICAL_HEIGHT - (groundY + carSize));

    // Draw obstacles.
    ctx.fillStyle = "brown";
    obstacles.forEach((o) => {
      ctx.fillRect(o.x, o.y, o.w, o.h);
    });

    // Draw the car (logo).
    ctx.save();
    const centerX = carX + carSize / 2;
    const centerY = carY + carSize / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((carAngle * Math.PI) / 180);
    const img = logoRef.current;
    if (img) {
      ctx.drawImage(img, -carSize / 2, -carSize / 2, carSize, carSize);
    } else {
      ctx.fillStyle = "yellow";
      ctx.fillRect(-carSize / 2, -carSize / 2, carSize, carSize);
    }
    ctx.restore();

    // Draw score.
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);

    // If game over, display text.
    if (gameOver) {
      ctx.fillText("GAME OVER!", LOGICAL_WIDTH / 2 - 50, LOGICAL_HEIGHT / 2);
    }

    // If game hasn't started (and game is not over), display "Click to Start" overlay.
    if (!hasStarted && !gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.fillStyle = "white";
      ctx.font = "24px Arial";
      const message = "Click to Start";
      const textWidth = ctx.measureText(message).width;
      ctx.fillText(message, (LOGICAL_WIDTH - textWidth) / 2, LOGICAL_HEIGHT / 2);
    }

    ctx.restore();
  }

  // Jump action: only if the car is on the ground.
  function jump() {
    if (carY >= groundY) {
      setCarVY(-12);
    }
  }

  function handleStart() {
    if (!hasStarted) {
      setHasStarted(true);
    } else if (!gameOver && !isPaused && carY >= groundY) {
      jump();
    }
  }

  function restartGame() {
    setGameOver(false);
    setScore(0);
    setCarY(groundY);
    setCarVY(0);
    setCarAngle(0);
    setSpeed(10);
    setObstacles([]);
    setPaused(false);
    spawnFrameRef.current = 0;
    // Reset game start status so that the static scene shows until the user clicks again.
    setHasStarted(false);
  }

  function togglePause() {
    setPaused((prev) => !prev);
  }

  return (
    <div className="flex flex-col items-center text-white">
      <h3>Logo Racer</h3>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ background: "#555" }}
        onClick={handleStart}
        onTouchStart={handleStart}
      />
      <div className="flex gap-4 mt-4">
        <PauseButton isPaused={isPaused} onTogglePause={togglePause} />
        <RestartButton onRestart={restartGame} />
      </div>
      <GameOverModal
        isOpen={gameOver}
        score={score}
        gameName="logoRacer"
        onClose={restartGame}
        onRestart={restartGame}
      />
    </div>
  );
};
