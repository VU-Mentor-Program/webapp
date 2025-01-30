import React, { useEffect, useRef, useState } from "react";
import mpLogo from "../assets/mp_logo-CIRCLE.png";

/**
 * Flappy Logo with a logical 800x600 area,
 * scaled to fit smaller screens.
 * We hide overflow so it won't scroll if something goes off-canvas.
 */
export const FlappyLogoGame: React.FC = () => {
  const LOGICAL_WIDTH = 800;
  const LOGICAL_HEIGHT = 600;

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

  // Game state in logical coords
  const birdSize = 40;
  const birdX = 100;
  const gravity = 0.5;
  const pipeWidth = 50;
  const pipeSpeed = 3;
  const gapHeight = 120;

  const birdYRef = useRef(300);
  const birdVYRef = useRef(0);
  const pipeXRef = useRef(LOGICAL_WIDTH);
  const gapYRef = useRef(200);
  const rotationRef = useRef(0);

  const logoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  // Key for jump
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp") jump();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver]);

  // Main loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      updateGame();
      drawGame();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameOver, canvasSize]);

  function updateGame() {
    if (gameOver) return;
    rotationRef.current += 2;

    birdYRef.current += birdVYRef.current;
    birdVYRef.current += gravity;

    pipeXRef.current -= pipeSpeed;
    if (pipeXRef.current < -pipeWidth) {
      pipeXRef.current = LOGICAL_WIDTH;
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

    // top/bottom
    if (birdTop < 0 || birdBottom > LOGICAL_HEIGHT) {
      setGameOver(true);
      return;
    }

    // pipe
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

    // Pipes
    ctx.fillStyle = "green";
    const pxScaled = pipeXRef.current * scaleX;
    ctx.fillRect(pxScaled, 0, pipeWidth * scaleX, gapYRef.current * scaleY);

    const lowerY = (gapYRef.current + gapHeight) * scaleY;
    ctx.fillRect(
      pxScaled,
      lowerY,
      pipeWidth * scaleX,
      canvasSize.height - lowerY
    );

    // Bird
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
    } else {
      ctx.fillStyle = "yellow";
      ctx.fillRect(
        birdX * scaleX,
        birdYRef.current * scaleY,
        birdSize * scaleX,
        birdSize * scaleY
      );
    }

    if (gameOver) {
      ctx.fillStyle = "white";
      ctx.font = `${30 * Math.min(scaleX, scaleY)}px Arial`;
      ctx.fillText("GAME OVER!", canvasSize.width / 2 - 80 * scaleX, canvasSize.height / 2);
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

  function restart() {
    birdYRef.current = 300;
    birdVYRef.current = 0;
    pipeXRef.current = LOGICAL_WIDTH;
    gapYRef.current = 200;
    rotationRef.current = 0;
    setGameOver(false);
  }

  return (
    // Hide overflow so any off-canvas objects don't create scrollbars
    <div
      style={{
        marginBottom: "1rem",
        textAlign: "center",
        color: "white",
        overflow: "hidden",
      }}
    >
      <h3>Flappy Logo</h3>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
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
