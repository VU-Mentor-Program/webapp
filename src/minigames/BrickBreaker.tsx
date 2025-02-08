import React, { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import mpLogo from "../assets/mp_logo-CIRCLE.png";
import PauseButton from "../components/minigame page/PauseButton";
import RestartButton from "../components/minigame page/RestartButton";
import GameOverModal from "../components/minigame page/GameOverModal";
import { useTranslations } from "../contexts/TranslationContext";

/**
 * Brick Breaker (One Person Pong) with dynamic brick layouts.
 *
 * New features/fixes:
 * - Now using slider controls for initial ball speed (1–20), brick rows (1–15), and brick columns (1–10)
 *   which works nicely on touch screens.
 * - The ball always starts below the last brick row.
 * - Bricks are only (re)generated before the game starts.
 * - Scrolling is prevented while moving the paddle (via touch-action and preventDefault on touch).
 */
export const OnePersonPong: React.FC = () => {
  const t = useTranslations("minigames");

  // "Logical" game area dimensions.
  const LOGICAL_WIDTH = 700;
  const LOGICAL_HEIGHT = 600;

  // References and state for animation.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Resize the canvas to fit the screen while maintaining aspect ratio.
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

  // Game state: start/win/lose.
  const [hasStarted, setHasStarted] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [hasLost, setHasLost] = useState(false);

  function togglePause() {
    setIsPaused((prev) => !prev);
  }

  /******************
   * Adjustable Parameters
   ******************/
  // Initial ball speed (allowed range: 1–20).
  const [initialBallSpeed, setInitialBallSpeed] = useState(8);
  // Brick layout rows (allowed range: 1–15) and columns (allowed range: 1–10).
  const [customBrickRows, setCustomBrickRows] = useState(4);
  const [customBrickCols, setCustomBrickCols] = useState(8);

  /******************
   * Brick Setup
   ******************/
  // Ball radius (used in collision and drawing).
  const ballRadius = 15;

  // getBrickSetup returns brick configuration based on canvas size and user settings.
  function getBrickSetup() {
    if (canvasSize.width < 500) {
      const brickWidth = 40;
      const brickHeight = 15;
      const padding = 20; // gap between bricks
      const totalWidth = customBrickCols * brickWidth + (customBrickCols - 1) * padding;
      return {
        brickCols: customBrickCols,
        brickRows: customBrickRows,
        brickWidth,
        brickHeight,
        padding,
        offsetLeft: (LOGICAL_WIDTH - totalWidth) / 2,
        offsetTop: 40,
      };
    } else {
      const brickWidth = 60;
      const brickHeight = 20;
      const padding = 10; // gap between bricks
      const totalWidth = customBrickCols * brickWidth + (customBrickCols - 1) * padding;
      return {
        brickCols: customBrickCols,
        brickRows: customBrickRows,
        brickWidth,
        brickHeight,
        padding,
        offsetLeft: (LOGICAL_WIDTH - totalWidth) / 2,
        offsetTop: 50,
      };
    }
  }
  // Compute initial brick setup.
  const initialBrickSetup = getBrickSetup();
  const [brickSetup, setBrickSetup] = useState(initialBrickSetup);

  // Compute initial ball position so that it starts below the brick layout.
  const initialBallX = LOGICAL_WIDTH / 2;
  const initialBallY =
    initialBrickSetup.offsetTop +
    initialBrickSetup.brickRows * (initialBrickSetup.brickHeight + initialBrickSetup.padding) +
    ballRadius +
    10;
  const [ballX, setBallX] = useState(initialBallX);
  const [ballY, setBallY] = useState(initialBallY);

  // Generate bricks based on a given setup (defaults to current brickSetup).
  function generateBricks(setup = brickSetup) {
    const { brickCols, brickRows, brickWidth, brickHeight, padding, offsetLeft, offsetTop } = setup;
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

  // Update brickSetup and bricks if adjustable settings or canvas size change (only if game not started).
  useEffect(() => {
    if (hasStarted) return; // Prevent resetting bricks during gameplay.
    const newSetup = getBrickSetup();
    setBrickSetup(newSetup);
    setBricks(generateBricks(newSetup));
    // Also reposition the ball to always start below the bricks.
    setBallX(LOGICAL_WIDTH / 2);
    setBallY(
      newSetup.offsetTop +
        newSetup.brickRows * (newSetup.brickHeight + newSetup.padding) +
        ballRadius +
        10
    );
  }, [customBrickRows, customBrickCols, canvasSize, hasStarted]);

  /******************
   * Paddle and Ball State
   ******************/
  const [paddleX, setPaddleX] = useState(350);
  const paddleWidth = 100;
  const paddleHeight = 20;
  const paddleY = 550; // near bottom (logical coordinates)

  // Ball velocity and rotation.
  const [ballDX, setBallDX] = useState(initialBallSpeed);
  const [ballDY, setBallDY] = useState(-initialBallSpeed);
  const [ballRotation, setBallRotation] = useState(0);

  // Load ball logo image.
  const logoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  // Score increases when bricks are hit.
  const [score, setScore] = useState(0);

  // Check for win (all bricks destroyed).
  useEffect(() => {
    if (bricks.every((b) => b.destroyed)) {
      setHasWon(true);
    }
  }, [bricks]);

  /******************
   * Helper: clamp
   ******************/
  function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, val));
  }

  /******************
   * Animation and Drawing
   ******************/
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      if (isPaused) {
        requestRef.current = requestAnimationFrame(render);
        return;
      }

      // Draw a fancy gradient background.
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#1a2a6c");
      gradient.addColorStop(0.5, "#b21f1f");
      gradient.addColorStop(1, "#fdbb2d");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawAll(ctx);

      // Only update the game state if the game is running.
      if (hasStarted && !hasWon && !hasLost) {
        updateBall();
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [
    hasStarted,
    hasWon,
    hasLost,
    isPaused,
    canvasSize,
    brickSetup,
    paddleX,
    ballX,
    ballY,
    ballDX,
    ballDY,
    ballRotation,
    bricks,
  ]);

  // Draw all game objects.
  const drawAll = (ctx: CanvasRenderingContext2D) => {
    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;

    // Helper function to draw rectangles in logical coordinates.
    const drawRect = (
      lx: number,
      ly: number,
      lw: number,
      lh: number,
      color: string
    ) => {
      ctx.fillStyle = color;
      ctx.fillRect(lx * scaleX, ly * scaleY, lw * scaleX, lh * scaleY);
    };

    // Draw bricks with a stroke to emphasize the gap.
    for (const b of bricks) {
      if (!b.destroyed) {
        drawRect(b.x, b.y, brickSetup.brickWidth, brickSetup.brickHeight, "lightblue");
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          b.x * scaleX,
          b.y * scaleY,
          brickSetup.brickWidth * scaleX,
          brickSetup.brickHeight * scaleY
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

    // Display win or loss message.
    ctx.fillStyle = "white";
    ctx.font = `${24 * scaleX}px Arial`;
    if (hasWon) {
      const winMsg = "YOU WIN!!!";
      const textWidth = ctx.measureText(winMsg).width;
      ctx.fillText(winMsg, (canvasSize.width - textWidth) / 2, canvasSize.height / 2);
    } else if (hasLost) {
      const loseMsg = "GAME OVER";
      const textWidth = ctx.measureText(loseMsg).width;
      ctx.fillText(loseMsg, (canvasSize.width - textWidth) / 2, canvasSize.height / 2);
    }
    
    // Before the game starts, show a "Click to Start" overlay.
    if (!hasStarted && !hasWon && !hasLost) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      ctx.fillStyle = "white";
      ctx.font = `${30 * scaleX}px Arial`;
      const message = "Click to Start";
      const textWidth = ctx.measureText(message).width;
      ctx.fillText(message, (canvasSize.width - textWidth) / 2, canvasSize.height / 2);
    }
  };

  // Update ball position and handle collisions.
  function updateBall() {
    let x = ballX;
    let y = ballY;
    let dx = ballDX;
    let dy = ballDY;
    let rotation = ballRotation + 2;

    // --- Wall collisions ---
    if (x + dx < ballRadius) {
      dx = Math.abs(dx);
    } else if (x + dx > LOGICAL_WIDTH - ballRadius) {
      dx = -Math.abs(dx);
    }
    if (y + dy < ballRadius) {
      dy = Math.abs(dy);
    }

    // --- Paddle collision ---
    if (dy > 0 && y + dy >= paddleY - ballRadius) {
      if (x >= paddleX - paddleWidth / 2 && x <= paddleX + paddleWidth / 2) {
        dy = -Math.abs(dy);
        const offset = (x - paddleX) / (paddleWidth / 2);
        dx += offset * 1.5;
        y = paddleY - ballRadius;
      }
    }

    // --- Brick collisions ---
    let bricksHitCount = 0;
    const newBricks = bricks.map((br) => {
      if (!br.destroyed) {
        const rx = br.x;
        const ry = br.y;
        const rw = brickSetup.brickWidth;
        const rh = brickSetup.brickHeight;
        const closestX = clamp(x, rx, rx + rw);
        const closestY = clamp(y, ry, ry + rh);
        const distX = x - closestX;
        const distY = y - closestY;
        if (distX * distX + distY * distY < ballRadius * ballRadius) {
          bricksHitCount++;
          if (Math.abs(distX) > Math.abs(distY)) {
            dx = -dx;
          } else {
            dy = -dy;
          }
          return { ...br, destroyed: true };
        }
      }
      return br;
    });
    if (bricksHitCount > 0) {
      setScore((prev) => prev + bricksHitCount * Math.round(10 * initialBallSpeed));
      setBricks(newBricks);
    }

    // --- Update ball position ---
    x = x + dx;
    y = y + dy;

    // If the ball falls below the bottom, the player loses.
    if (y > LOGICAL_HEIGHT - ballRadius) {
      setHasLost(true);
      return;
    }

    setBallX(x);
    setBallY(y);
    setBallDX(dx);
    setBallDY(dy);
    setBallRotation(rotation);
  }

  // Reset the ball using the provided setup (defaults to current brickSetup).
  function resetBall(setup = brickSetup) {
    setBallX(LOGICAL_WIDTH / 2);
    setBallY(
      setup.offsetTop +
        setup.brickRows * (setup.brickHeight + setup.padding) +
        ballRadius +
        10
    );
    setBallDX(initialBallSpeed);
    setBallDY(-initialBallSpeed);
    setBallRotation(0);
  }

  // Restart the game.
  function restartGame() {
    setHasWon(false);
    setHasLost(false);
    setScore(0);
    // Recalculate brick setup and bricks so that the starting positions match.
    const newSetup = getBrickSetup();
    setBrickSetup(newSetup);
    setBricks(generateBricks(newSetup));
    setPaddleX(350);
    resetBall(newSetup);
    setHasStarted(false);
  }

  // Convert pointer coordinates to logical coordinates.
  function handlePointerMove(e: React.MouseEvent | React.TouchEvent) {
    // Prevent scrolling on touch devices.
    if ("touches" in e) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const scaleX = LOGICAL_WIDTH / rect.width;
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

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ marginRight: "1rem" }}>
            Initial Ball Speed: {initialBallSpeed}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={initialBallSpeed}
            onChange={(e) => setInitialBallSpeed(Number(e.target.value))}
          />
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ marginRight: "1rem" }}>
            Brick Rows: {customBrickRows}
          </label>
          <input
            type="range"
            min="1"
            max="15"
            step="1"
            value={customBrickRows}
            onChange={(e) => setCustomBrickRows(Number(e.target.value))}
          />
        </div>
        <div>
          <label style={{ marginRight: "1rem" }}>
            Brick Columns: {customBrickCols}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={customBrickCols}
            onChange={(e) => setCustomBrickCols(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Display score */}
      <p style={{ fontSize: "1.2rem" }}>Score: {score}</p>

      {hasWon && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={500}
          recycle={false}
        />
      )}

      <GameOverModal
        isOpen={hasWon || hasLost}
        score={score}
        gameName={"brickBreaker"}
        onClose={restartGame}
        onRestart={restartGame}
      />

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          background: "#333",
          border: "2px solid #fff",
          touchAction: "none", 
        }}
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
