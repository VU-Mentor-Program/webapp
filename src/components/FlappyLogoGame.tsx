import React, { useEffect, useRef, useState } from "react";
import mpLogo from "../assets/mp_logo-CIRCLE.png";

export const FlappyLogoGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);

  // Basic constants
  const canvasWidth = 800;
  const canvasHeight = 600;
  const birdSize = 40;
  const birdX = 100;
  const gravity = 0.5;
  const pipeWidth = 50;
  const pipeSpeed = 3;
  // Pillars closer: reduce gap from 150 to 120
  const gapHeight = 120;

  // Use React state *only* for gameOver
  const [gameOver, setGameOver] = useState(false);

  // Store game state in refs so we don’t have stale closures
  const birdYRef = useRef(300);
  const birdVYRef = useRef(0);
  const pipeXRef = useRef(canvasWidth);
  const gapYRef = useRef(200);

  // For spinning logo
  const rotationRef = useRef(0);

  // Load the logo image
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  // Key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp") jump();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver]);

  // Game loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      updateGame();
      drawGame();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [gameOver]);

  function updateGame() {
    if (gameOver) return;

    // Spin the logo a bit each frame
    rotationRef.current += 2;

    birdYRef.current += birdVYRef.current;
    birdVYRef.current += gravity;

    pipeXRef.current -= pipeSpeed;
    if (pipeXRef.current < -pipeWidth) {
      pipeXRef.current = canvasWidth;
      gapYRef.current = Math.random() * 300 + 100; 
    }

    checkCollision();
  }

  function checkCollision() {
    const birdTop = birdYRef.current;
    const birdBottom = birdTop + birdSize;
    const px = pipeXRef.current;
    const holeStart = gapYRef.current;
    const holeEnd = holeStart + gapHeight;

    // Collide with top/bottom
    if (birdTop < 0 || birdBottom > canvasHeight) {
      setGameOver(true);
      return;
    }

    // Collide with pipe
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

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Pipes
    ctx.fillStyle = "green";
    ctx.fillRect(pipeXRef.current, 0, pipeWidth, gapYRef.current);
    ctx.fillRect(
      pipeXRef.current,
      gapYRef.current + gapHeight,
      pipeWidth,
      canvasHeight - (gapYRef.current + gapHeight)
    );

    // Bird (logo or fallback)
    const img = logoRef.current;
    if (img) {
      ctx.save();
      // Translate & rotate around the bird's center
      ctx.translate(birdX + birdSize / 2, birdYRef.current + birdSize / 2);
      ctx.rotate((rotationRef.current * Math.PI) / 180);
      ctx.drawImage(img, -birdSize / 2, -birdSize / 2, birdSize, birdSize);
      ctx.restore();
    } else {
      ctx.fillStyle = "yellow";
      ctx.fillRect(birdX, birdYRef.current, birdSize, birdSize);
    }

    // "Game Over" text
    if (gameOver) {
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.fillText("GAME OVER!", 320, 250);
    }
  }

  function jump() {
    if (!gameOver) {
      birdVYRef.current = -8;
    }
  }

  function handleCanvasClick() {
    jump();
  }

  // Restart
  function restart() {
    birdYRef.current = 300;
    birdVYRef.current = 0;
    pipeXRef.current = canvasWidth;
    gapYRef.current = 200;
    rotationRef.current = 0;
    setGameOver(false);
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      <h3>Flappy Logo</h3>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ background: "#444" }}
        onClick={handleCanvasClick}
      />
      <p>Click or press Space/Up Arrow to jump!</p>
      {gameOver && (
        <button onClick={restart} style={{ marginTop: "1rem" }}>
          Restart
        </button>
      )}
    </div>
  );
};
