import React, { useEffect, useRef, useState } from "react";
import mpLogo from "../assets/mp_logo-CIRCLE.png";
import GameOverModal from "../components/GameOverModal";
import PauseButton from "../components/PauseButton";
import RestartButton from "../components/RestartButton";

export const LogoRacerGame: React.FC = () => {
  const LOGICAL_WIDTH = 800;
  const LOGICAL_HEIGHT = 400;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 250, height: 600 });

  // Game States
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setPaused] = useState(false);
  const [score, setScore] = useState(0);

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

  // Click => jump, but only if the logo is on the ground
  useEffect(() => {
    const handleCanvasClick = () => {
      if (!gameOver && !isPaused && carY >= groundY) {
        jump();
      }
    };

    // Attach event listener for both mouse click and touch events
    window.addEventListener("click", handleCanvasClick);
    window.addEventListener("touchstart", handleCanvasClick);

    return () => {
      window.removeEventListener("click", handleCanvasClick);
      window.removeEventListener("touchstart", handleCanvasClick);
    };
  }, [gameOver, isPaused, carY]);

  // Game Loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      if (!isPaused && !gameOver) {
        updateGame();
        drawGame();
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, gameOver, carY, carVY, obstacles, speed, score, canvasSize]);

  function updateGame() {
    if (gameOver || isPaused) return;

    setCarVY((vy) => vy + gravity);
    setCarY((y) => (y + carVY > groundY ? groundY : y + carVY));

    setCarAngle((angle) => angle + 3);

    setObstacles((obs) =>
      obs
        .map((o) => ({ ...o, x: o.x - speed }))
        .filter((o) => o.x + o.w > 0)
    );

    setSpeed((s) => s + 0.005);

    spawnFrameRef.current++;
    if (spawnFrameRef.current % 100 === 0) {
      const obstacleHeight = 50 + Math.random() * 50;
      setObstacles((prev) => [
        ...prev,
        { x: LOGICAL_WIDTH, y: groundY + carSize - obstacleHeight, w: 50, h: obstacleHeight },
      ]);
    }

    obstacles.forEach((o) => {
      if (carX < o.x + o.w && carX + carSize > o.x && carY + carSize > o.y) {
        setGameOver(true);
      }
    });

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

    ctx.fillStyle = "green";
    ctx.fillRect(0, groundY + carSize, LOGICAL_WIDTH, LOGICAL_HEIGHT - (groundY + carSize));

    ctx.fillStyle = "brown";
    obstacles.forEach((o) => {
      ctx.fillRect(o.x, o.y, o.w, o.h);
    });

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

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);

    if (gameOver) {
      ctx.fillText("GAME OVER!", LOGICAL_WIDTH / 2 - 50, LOGICAL_HEIGHT / 2);
    }

    ctx.restore();
  }

  function jump() {
    if (carY >= groundY) {
      setCarVY(-12);
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
      />

      <div className="flex gap-4 mt-4">
        <PauseButton isPaused={isPaused} onTogglePause={togglePause} />
        <RestartButton onRestart={restartGame} />
      </div>

      <GameOverModal isOpen={gameOver} score={score} gameName="logoRacer" onClose={restartGame} onRestart={restartGame} />
    </div>
  );
};
