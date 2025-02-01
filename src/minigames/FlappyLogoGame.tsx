import React, { useEffect, useRef, useState } from "react";
import mpLogo from "../assets/mp_logo-CIRCLE.png";
import GameOverModal from "../components/minigame page/GameOverModal";
import PauseButton from "../components/minigame page/PauseButton";

export const FlappyLogoGame: React.FC = () => {
  const LOGICAL_WIDTH = 800;
  const LOGICAL_HEIGHT = 600;
  const FLOOR_Y = 540; // Raised floor
  const FLOOR_HEIGHT = 80;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

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

  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Game state
  const birdSize = 40;
  const birdX = 100;
  const gravity = 0.5;
  const pipeWidth = 50;
  const pipeSpeed = 3;
  const gapHeight = 140; // Slightly larger gap for balance

  const birdYRef = useRef(300);
  const birdVYRef = useRef(0);
  const pipeXRef = useRef(LOGICAL_WIDTH);
  const gapYRef = useRef(200);
  const rotationRef = useRef(0);
  const passedPipeRef = useRef(false);
  const scoreRef = useRef(0);

  // Background state
  const bgXRef = useRef(0);
  const cloudXRef = useRef(LOGICAL_WIDTH);
  const bgSpeed = 1.5;
  const cloudSpeed = 0.6;

  const logoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  // Handle key press for jump
  useEffect(() => {
    const handleJump = () => {
      if (!gameOver) {
        birdVYRef.current = -8; // Properly apply jump
      }
    };

    // Attach event listener for click/touch
    window.addEventListener("click", handleJump);
    window.addEventListener("touchstart", handleJump);

    return () => {
      window.removeEventListener("click", handleJump);
      window.removeEventListener("touchstart", handleJump);
    };
  }, [gameOver]);


  // Main loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      if (!isPaused) {
        updateGame();
        drawGame();
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameOver, canvasSize, isPaused]);

  function updateGame() {
    if (gameOver) return;
    rotationRef.current += 2;

    birdYRef.current += birdVYRef.current;
    birdVYRef.current += gravity;

    pipeXRef.current -= pipeSpeed;
    if (pipeXRef.current < -pipeWidth) {
      pipeXRef.current = LOGICAL_WIDTH;
      gapYRef.current = Math.random() * 300 + 100;
      passedPipeRef.current = false;
    }

    // Move background for parallax effect
    bgXRef.current -= bgSpeed;
    if (bgXRef.current < -LOGICAL_WIDTH) {
      bgXRef.current = 0;
    }

    // Move clouds slower than the background
    cloudXRef.current -= cloudSpeed;
    if (cloudXRef.current < -LOGICAL_WIDTH) {
      cloudXRef.current = LOGICAL_WIDTH;
    }

    // Check if bird has passed a pipe and increase score
    if (!passedPipeRef.current && pipeXRef.current + pipeWidth < birdX) {
      scoreRef.current += 100; // Update ref
      setScore(scoreRef.current); // Trigger re-render
      passedPipeRef.current = true; // Prevent duplicate scoring
    }

    checkCollision();
  }

  function togglePause() {
    setIsPaused((prev) => !prev);
  }

  function checkCollision() {
    const birdTop = birdYRef.current;
    const birdBottom = birdTop + birdSize;
    const px = pipeXRef.current;
    const holeStart = gapYRef.current;
    const holeEnd = holeStart + gapHeight;

    // Collision: Top/Bottom
    if (birdTop < 0 || birdBottom > FLOOR_Y) {
      setGameOver(true);
      return;
    }

    // Collision: Pipes
    const birdLeft = birdX;
    const birdRight = birdLeft + birdSize;
    if (birdRight > px && birdLeft < px + pipeWidth) {
      if (birdTop < holeStart || birdBottom > holeEnd) {
        setGameOver(true);
      }
    }
  }

  function drawGame() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;

    // Draw Background
    drawBackground(ctx, scaleX, scaleY);

    // Draw Pipes
    ctx.fillStyle = "#004d00"; // Darker green pipes
    const pxScaled = pipeXRef.current * scaleX;
    ctx.fillRect(pxScaled, 0, pipeWidth * scaleX, gapYRef.current * scaleY);
    ctx.fillRect(
      pxScaled,
      (gapYRef.current + gapHeight) * scaleY,
      pipeWidth * scaleX,
      canvasSize.height - (gapYRef.current + gapHeight) * scaleY
    );

    // Draw Bird
    const img = logoRef.current;
    if (img) {
      ctx.save();
      const cx = (birdX + birdSize / 2) * scaleX;
      const cy = (birdYRef.current + birdSize / 2) * scaleY;
      ctx.translate(cx, cy);
      ctx.rotate((rotationRef.current * Math.PI) / 180);
      ctx.drawImage(
        img,
        -((birdSize * scaleX) / 2),
        -((birdSize * scaleY) / 2),
        birdSize * scaleX,
        birdSize * scaleY
      );
      ctx.restore();
    }

    // Display Score
    ctx.fillStyle = "white";
    ctx.font = `${30 * Math.min(scaleX, scaleY)}px Arial`;
    ctx.fillText(`Score: ${scoreRef.current}`, 20 * scaleX, 40 * scaleY);
  }

  function drawBackground(ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number) {
    ctx.fillStyle = "#0A0A32"; // Deep blue sky
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Stars (5-7 at a time, lasting longer)
    ctx.fillStyle = "white";
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(
        (Math.random() * canvasSize.width) + (i * 50),
        Math.random() * 150 * scaleY,
        2,
        2
      );
    }

    // City Silhouette
    ctx.fillStyle = "#1E1E4C";
    for (let i = 0; i < 8; i++) {
      ctx.fillRect((bgXRef.current + i * 180) * scaleX, 320 * scaleY, 80 * scaleX, 100 * scaleY);
    }

    // 🏙️ Buildings
    ctx.fillStyle = "#2E2E6A";
    for (let i = 0; i < 6; i++) {
      ctx.fillRect((bgXRef.current + i * 230) * scaleX, 350 * scaleY, 60 * scaleX, 130 * scaleY);
    }

    // Clouds (moving)
    ctx.fillStyle = "#AAAAAA";
    ctx.beginPath();
    ctx.arc(cloudXRef.current * scaleX, 100 * scaleY, 40 * scaleX, 0, Math.PI * 2);
    ctx.arc((cloudXRef.current + 60) * scaleX, 110 * scaleY, 30 * scaleX, 0, Math.PI * 2);
    ctx.fill();

    // Ground
    ctx.fillStyle = "#008000";
    ctx.fillRect(0, FLOOR_Y * scaleY, canvasSize.width, FLOOR_HEIGHT * scaleY);
  }

  function restart() {
    birdYRef.current = 300;
    birdVYRef.current = 0;
    pipeXRef.current = LOGICAL_WIDTH;
    gapYRef.current = 200;
    rotationRef.current = 0;
    passedPipeRef.current = false;
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setIsPaused(false);
  }

  return (
    <div style={{ textAlign: "center", color: "white", overflow: "hidden" }}>
      <h3>Flappy Logo</h3>
      <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} />
      <GameOverModal isOpen={gameOver} score={score} gameName={"flappy"} onClose={restart} onRestart={restart} />
      <PauseButton isPaused={isPaused} onTogglePause={togglePause} />
    </div>
  );
};
