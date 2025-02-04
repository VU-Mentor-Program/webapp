import React, { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import mpLogo from "../assets/mp_logo-CIRCLE.png";
import PauseButton from "../components/minigame page/PauseButton";
import RestartButton from "../components/minigame page/RestartButton";
import GameOverModal from "../components/minigame page/GameOverModal";  
import { useTranslations } from "../contexts/TranslationContext";

/**
 * Brick Breaker (One Person Pong) with dynamic brick layouts for smaller screens:
 * If canvas width < 500 => use smaller layout (8 cols, 2 rows).
 * Otherwise => normal layout (6 cols, 3 rows).
 */
export const OnePersonPong: React.FC = () => {
  const t = useTranslations("minigames");

  // "Logical" size for all calculations
  const LOGICAL_WIDTH = 700;
  const LOGICAL_HEIGHT = 600;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // We'll resize the <canvas> to fit user screen while maintaining aspect ratio
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 600 });

  useEffect(() => {
    function handleResize() {
      const maxWidth = Math.min(window.innerWidth * 0.9, LOGICAL_WIDTH);
      const scale = maxWidth / LOGICAL_WIDTH;
      const scaledHeight = LOGICAL_HEIGHT * scale;
      setCanvasSize({ width: maxWidth, height: scaledHeight });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // New: Track whether the user has started the game.
  const [hasStarted, setHasStarted] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  function togglePause() {
    // When resuming, the animation loop will continue automatically.
    setIsPaused((prev) => !prev);
  }

  // Determine columns/rows/brick sizes depending on final canvas width.
  function getBrickSetup(): {
    brickCols: number;
    brickRows: number;
    brickWidth: number;
    brickHeight: number;
    padding: number;
    offsetLeft: number;
    offsetTop: number;
  } {
    if (canvasSize.width < 500) {
      // smaller layout
      return {
        brickCols: 8,
        brickRows: 2,
        brickWidth: 70,
        brickHeight: 20,
        padding: 10,
        offsetLeft: 35,
        offsetTop: 50,
      };
    } else {
      // normal layout
      return {
        brickCols: 6,
        brickRows: 3,
        brickWidth: 80,
        brickHeight: 20,
        padding: 10,
        offsetLeft: 80,
        offsetTop: 50,
      };
    }
  }

  // Store the dynamic brick setup in state; updated when we restart.
  const [brickSetup, setBrickSetup] = useState(getBrickSetup);

  // Re-generate bricks array based on current `brickSetup`
  function generateBricks() {
    const {
      brickCols,
      brickRows,
      brickWidth,
      brickHeight,
      padding,
      offsetLeft,
      offsetTop,
    } = brickSetup;
    const arr = [];
    for (let r = 0; r < brickRows; r++) {
      for (let c = 0; c < brickCols; c++) {
        arr.push({
          x: offsetLeft + c * (brickWidth + padding),
          y: offsetTop + r * (brickHeight + padding),
          destroyed: false,
        });
      }
    }
    return arr;
  }

  const [bricks, setBricks] = useState(generateBricks);

  // Paddle state
  const [paddleX, setPaddleX] = useState(350);
  const paddleWidth = 100;
  const paddleHeight = 20;
  const paddleY = 550; // near bottom in logical coords

  // Ball state
  function rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
  const [ballX, setBallX] = useState(() => rand(100, 600));
  const [ballY, setBallY] = useState(() => rand(100, 400));
  const [ballDX, setBallDX] = useState(5);
  const [ballDY, setBallDY] = useState(5);
  const [ballRotation, setBallRotation] = useState(0);
  const ballRadius = 15;

  // Load logo
  const logoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  // Check if all bricks are destroyed => Win
  useEffect(() => {
    if (bricks.every((b) => b.destroyed)) {
      setHasWon(true);
    }
  }, [bricks]);

  // Main animation loop.
  // When the game hasn't started, only draw the scene (plus a "Click to Start" message).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      if (isPaused) {
        // If paused, simply schedule the next frame.
        requestRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawAll(ctx);

      // Only update game state (ball movement, collisions, etc.) if the game has started.
      if (hasStarted && !hasWon) {
        updateBall();
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // We include hasStarted, hasWon, and isPaused as dependencies so that the loop behaves correctly.
  }, [hasStarted, hasWon, isPaused, canvasSize, brickSetup, paddleX, ballX, ballY, ballDX, ballDY, ballRotation, bricks]);

  function drawAll(ctx: CanvasRenderingContext2D) {
    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;

    // Helper to draw rectangles in logical coordinates.
    const drawRect = (lx: number, ly: number, lw: number, lh: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(lx * scaleX, ly * scaleY, lw * scaleX, lh * scaleY);
    };

    // Draw bricks.
    for (const b of bricks) {
      if (!b.destroyed) {
        drawRect(
          b.x,
          b.y,
          brickSetup.brickWidth,
          brickSetup.brickHeight,
          "lightblue"
        );
      }
    }

    // Draw paddle.
    drawRect(paddleX - paddleWidth / 2, paddleY, paddleWidth, paddleHeight, "darkblue");

    // Draw ball.
    const logo = logoRef.current;
    if (logo && logo.complete) {
      ctx.save();
      const cx = ballX * scaleX;
      const cy = ballY * scaleY;
      ctx.translate(cx, cy);
      ctx.rotate((ballRotation * Math.PI) / 180);
      const sizeX = ballRadius * 2 * scaleX;
      const sizeY = ballRadius * 2 * scaleY;
      ctx.drawImage(logo, -sizeX / 2, -sizeY / 2, sizeX, sizeY);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.fillStyle = "orange";
      ctx.arc(
        ballX * scaleX,
        ballY * scaleY,
        ballRadius * Math.min(scaleX, scaleY),
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.closePath();
    }

    if (hasWon) {
      ctx.fillStyle = "white";
      ctx.font = `${24 * scaleX}px Arial`;
      ctx.fillText("YOU WIN!!!", 200 * scaleX, 250 * scaleY);
    }

    // When the game hasn't started, show an overlay message.
    if (!hasStarted && !hasWon) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      ctx.fillStyle = "white";
      ctx.font = `${30 * scaleX}px Arial`;
      const message = "Click to Start";
      const textWidth = ctx.measureText(message).width;
      ctx.fillText(message, (canvasSize.width - textWidth) / 2, canvasSize.height / 2);
    }
  }

  function updateBall() {
    // Increment ball rotation.
    setBallRotation((r) => r + 2);

    // Bounce off side walls.
    if (ballX + ballDX < ballRadius || ballX + ballDX > LOGICAL_WIDTH - ballRadius) {
      setBallDX((d) => -d);
    }
    // Bounce off top.
    if (ballY + ballDY < ballRadius) {
      setBallDY((d) => -d);
    }
    // Bottom: reset ball.
    else if (ballY + ballDY > LOGICAL_HEIGHT - ballRadius) {
      resetBall();
    }

    // Paddle collision.
    if (
      ballY + ballDY >= paddleY - ballRadius &&
      ballX >= paddleX - paddleWidth / 2 &&
      ballX <= paddleX + paddleWidth / 2
    ) {
      setBallDY((d) => -d);
    }

    // Brick collisions.
    const updated = bricks.map((br) => {
      if (!br.destroyed) {
        if (
          ballX >= br.x &&
          ballX <= br.x + brickSetup.brickWidth &&
          ballY - ballRadius <= br.y + brickSetup.brickHeight &&
          ballY + ballRadius >= br.y
        ) {
          return { ...br, destroyed: true };
        }
      }
      return br;
    });
    let destroyedAny = false;
    for (let i = 0; i < bricks.length; i++) {
      if (!bricks[i].destroyed && updated[i].destroyed) {
        destroyedAny = true;
        break;
      }
    }
    if (destroyedAny) {
      setBallDY((d) => -d);
      setBricks(updated);
    }

    setBallX((x) => x + ballDX);
    setBallY((y) => y + ballDY);
  }

  function resetBall() {
    setBallX(350);
    setBallY(300);
    setBallDX(3);
    setBallDY(-3);
    setBallRotation(0);
  }

  function restartGame() {
    setHasWon(false);
    setBallRotation(0);
    // Recalculate brick setup in case the canvas was resized.
    setBrickSetup(getBrickSetup());
    setBricks(generateBricks());
    setPaddleX(350);
    resetBall();
    // Optionally, you may also want to set hasStarted to false so that the game waits for another click.
    setHasStarted(false);
  }

  // Convert pointer coordinates to logical coordinates.
  function handlePointerMove(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const scaleX = LOGICAL_WIDTH / rect.width; // invert
    const xPosLogical = (clientX - rect.left) * scaleX;
    const half = paddleWidth / 2;
    const minX = half;
    const maxX = LOGICAL_WIDTH - half;
    setPaddleX(Math.min(Math.max(xPosLogical, minX), maxX));
  }

  function handleStart() {
    if (!hasStarted) {
      setHasStarted(true);
    }
  }

  return (
    <div style={{ textAlign: "center", marginTop: "1rem", color: "white" }}>
      <h2>{t("brickBreaker_title")}</h2>
      {hasWon && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={500}
          recycle={false}
        />
      )}
      <GameOverModal
        isOpen={hasWon}
        score={500}
        gameName={"brickBreaker"}
        onClose={restartGame}
        onRestart={restartGame}
      />
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ background: "#333", border: "2px solid #fff" }}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        onClick={handleStart}
        onTouchStart={handleStart}
      />
      <p>{t("brickBreaker_instruction")}</p>
      <PauseButton isPaused={isPaused} onTogglePause={togglePause} />
      <RestartButton onRestart={restartGame} />
    </div>
  );
};
