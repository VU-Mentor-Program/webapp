import React, { useEffect, useRef, useState } from "react";
import mpLogo from "../assets/mp_logo-CIRCLE.png";
import GameOverModal from "../components/minigame page/GameOverModal";
import PauseButton from "../components/minigame page/PauseButton";
import { useTranslations } from "../contexts/TranslationContext";

export const LogoDodgeGame: React.FC = () => {
  const t = useTranslations("minigames");

  const LOGICAL_WIDTH = 400;
  const LOGICAL_HEIGHT = 600;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 600 });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);

  const playerSize = 40;
  const [playerX, setPlayerX] = useState(180);
  const [playerY] = useState(500);

  const [obstacles, setObstacles] = useState<{ x: number; y: number }[]>([]);
  const frameRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  const logoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  // 🎨 Background State
  const [bgColor, setBgColor] = useState("#1a1a2e");
  const [clouds, setClouds] = useState<{ x: number; y: number; speed: number }[]>([]);

  // ✅ Responsive canvas
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

  // 🎨 Background Color Changing
  useEffect(() => {
    const interval = setInterval(() => {
      setBgColor(`hsl(${Math.random() * 360}, 50%, 15%)`);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ☁️ Clouds Initialization
  useEffect(() => {
    const initialClouds = Array.from({ length: 3 }, () => ({
      x: Math.random() * LOGICAL_WIDTH,
      y: Math.random() * 100,
      speed: Math.random() * 0.5 + 0.2,
    }));
    setClouds(initialClouds);
  }, []);

  // ✅ Movement Handling
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver || isPaused) return;
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        setPlayerX((x) => Math.max(0, x - 10));
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        setPlayerX((x) => Math.min(LOGICAL_WIDTH - playerSize, x + 10));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver, isPaused]);

  // ✅ Game Loop
  useEffect(() => {
    let animId: number;
    const loop = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsedSeconds = (timestamp - startTimeRef.current) / 1000;

      if (!isPaused && !gameOver) {
        updateGame(elapsedSeconds);
        drawGame();
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameOver, isPaused, playerX, obstacles, score, canvasSize]);

  function updateGame(elapsedSeconds: number) {
    setScore((s) => s + 1);
    const speedMultiplier = Math.min(1 + Math.pow(elapsedSeconds / 8, 3), 7);
    const obstacleSpeed = 2 + speedMultiplier * 2;
    const spawnRate = Math.max(50 - Math.floor(elapsedSeconds * 2), 10);
    frameRef.current++;

    if (frameRef.current % spawnRate === 0) {
      const x = Math.random() * (LOGICAL_WIDTH - 30);
      setObstacles((o) => [...o, { x, y: -30 }]);
    }

    setObstacles((obs) =>
      obs.map((o) => ({ x: o.x, y: o.y + obstacleSpeed })).filter((o) => o.y < LOGICAL_HEIGHT + 50)
    );

    obstacles.forEach((o) => {
      if (checkCollide(o.x, o.y, playerX, playerY)) {
        setGameOver(true);
      }
    });

    // Move clouds
    setClouds((c) =>
      c.map((cloud) => ({
        ...cloud,
        x: (cloud.x + cloud.speed) % LOGICAL_WIDTH,
      }))
    );
  }

  function drawGame() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;

    // 🎨 Background Gradient
    ctx.fillStyle = bgColor; 
    ctx.fillRect(0, 0, canvas.width, canvas.height); 

    // ☁️ Draw Clouds
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    clouds.forEach((cloud) => {
      ctx.beginPath();
      ctx.arc(cloud.x * scaleX, cloud.y * scaleY, 20 * scaleX, 0, Math.PI * 2);
      ctx.fill();
    });

    // Obstacles
    ctx.fillStyle = "red";
    obstacles.forEach((o) => {
      ctx.fillRect(o.x * scaleX, o.y * scaleY, 30 * scaleX, 30 * scaleY);
    });

    // Player Logo
    const img = logoRef.current;
    if (img) {
      ctx.drawImage(
        img,
        playerX * scaleX,
        playerY * scaleY,
        playerSize * scaleX,
        playerSize * scaleY
      );
    }

    // Score
    ctx.fillStyle = "white";
    ctx.font = `${20 * Math.min(scaleX, scaleY)}px Arial`;
    ctx.fillText(`Score: ${score}`, 10, 30 * scaleY);

    // Game Over
    if (gameOver) {
      ctx.fillText("GAME OVER!", 100 * scaleX, 200 * scaleY);
    }
  }

  function handlePointerMove(e: React.MouseEvent | React.TouchEvent) {
    if (gameOver || isPaused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const scale = LOGICAL_WIDTH / rect.width;
    const xPos = clientX - rect.left;
    const logicX = xPos * scale - playerSize / 2;
    setPlayerX(Math.min(Math.max(logicX, 0), LOGICAL_WIDTH - playerSize));
  }

  function checkCollide(ox: number, oy: number, px: number, py: number) {
    const obsSize = 30;
    return !(
      ox + obsSize < px ||
      ox > px + playerSize ||
      oy + obsSize < py ||
      oy > py + playerSize
    );
  }

  function restart() {
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setObstacles([]);
    setPlayerX(180);
    frameRef.current = 0;
    startTimeRef.current = null;
  }

  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h3>Logo Dodge</h3>

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
      />

      <p>{t("dodge_instruction")}</p>

      {/* ✅ Pause Button */}
      <PauseButton isPaused={isPaused} onTogglePause={() => setIsPaused(!isPaused)} />

      {/* ✅ Show GameOverModal when game ends */}
      <GameOverModal isOpen={gameOver} score={score} gameName={"logoDodge"} onClose={restart} onRestart={restart} />
    </div>
  );
};
