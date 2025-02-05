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
 * New features:
 * - A fancy gradient background.
 * - The game now “ends” (loss) when the ball falls out the bottom.
 * - A score is calculated based on the number of bricks hit and the initial ball speed.
 * - Controls allow adjusting the initial ball speed and the brick layout.
 * - A visible gap between bricks via drawing a stroke around each brick.
 * - Improved collision detection to avoid edge cases where the ball gets stuck or passes through objects.
 */
export const OnePersonPong: React.FC = () => {
  const t = useTranslations("minigames");

  // "Logical" game area dimensions.
  const LOGICAL_WIDTH = 700;
  const LOGICAL_HEIGHT = 600;

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

  // Game start/win/lose states.
  const [hasStarted, setHasStarted] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [hasLost, setHasLost] = useState(false);

  function togglePause() {
    setIsPaused((prev) => !prev);
  }

  /******************
   * Adjustable parameters
   ******************/
  // User-adjustable initial ball speed.
  const [initialBallSpeed, setInitialBallSpeed] = useState(8);
  // User-adjustable brick layout (number of rows and columns).
  const [customBrickRows, setCustomBrickRows] = useState(4);
  const [customBrickCols, setCustomBrickCols] = useState(8);

  /******************
   * Brick Setup
   ******************/
  // getBrickSetup returns brick configuration based on screen size and user settings.
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
  const newSetup = getBrickSetup();
  const [brickSetup, setBrickSetup] = useState(newSetup);

  // Update brickSetup if the adjustable settings or canvas size change.
  useEffect(() => {
    const newSetup = getBrickSetup();
    setBrickSetup(newSetup);

    // Regenerate bricks based on the new setup.
    const newBricks = [];
    for (let r = 0; r < newSetup.brickRows; r++) {
      for (let c = 0; c < newSetup.brickCols; c++) {
        newBricks.push({
          x: newSetup.offsetLeft + c * (newSetup.brickWidth + newSetup.padding),
          y: newSetup.offsetTop + r * (newSetup.brickHeight + newSetup.padding),
          destroyed: false,
        });
      }
    }
    setBricks(newBricks);
  }, [customBrickRows, customBrickCols, canvasSize]);


  // Generate a bricks array based on the current brickSetup.
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

  /******************
   * Paddle and Ball State
   ******************/
  const [paddleX, setPaddleX] = useState(350);
  const paddleWidth = 100;
  const paddleHeight = 20;
  const paddleY = 550; // near bottom (logical coordinates)

  // Ball state.
  const [ballX, setBallX] = useState(350);
  const [ballY, setBallY] = useState(350);
  const [ballDX, setBallDX] = useState(initialBallSpeed);
  const [ballDY, setBallDY] = useState(-initialBallSpeed);
  const [ballRotation, setBallRotation] = useState(0);
  const ballRadius = 15;

  // Load ball logo image.
  const logoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  // Score state – increases when bricks are hit.
  const [score, setScore] = useState(0);

  // Win: if all bricks are destroyed.
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
  // Main animation loop.
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
    // Use local variables for robust collision handling.
    let x = ballX;
    let y = ballY;
    let dx = ballDX;
    let dy = ballDY;
    let rotation = ballRotation + 2;

    // --- Wall collisions ---
    // Left/right walls.
    if (x + dx < ballRadius) {
      dx = Math.abs(dx);
    } else if (x + dx > LOGICAL_WIDTH - ballRadius) {
      dx = -Math.abs(dx);
    }
    // Top wall.
    if (y + dy < ballRadius) {
      dy = Math.abs(dy);
    }

    // --- Paddle collision ---
    // Only check if the ball is moving downward.
    if (dy > 0 && y + dy >= paddleY - ballRadius) {
      if (x >= paddleX - paddleWidth / 2 && x <= paddleX + paddleWidth / 2) {
        // Simple collision: reverse vertical direction.
        dy = -Math.abs(dy);
        // Add a horizontal offset based on where the ball hit the paddle.
        const offset = (x - paddleX) / (paddleWidth / 2);
        dx += offset * 1.5;
        // Reposition the ball just above the paddle.
        y = paddleY - ballRadius;
      }
    }

    // --- Brick collisions ---
    let bricksHitCount = 0;
    const newBricks = bricks.map((br) => {
      if (!br.destroyed) {
        // Use circle-rectangle collision.
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
          // Determine which side is the collision more dominant.
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

    // Update state.
    setBallX(x);
    setBallY(y);
    setBallDX(dx);
    setBallDY(dy);
    setBallRotation(rotation);
  }

  // Reset the ball (used when restarting the game).
  function resetBall() {
    setBallX(350);
    setBallY(300);
    setBallDX(initialBallSpeed);
    setBallDY(-initialBallSpeed);
    setBallRotation(0);
  }

  // Restart the game.
  function restartGame() {
    setHasWon(false);
    setHasLost(false);
    setScore(0);
    setBallRotation(0);
    // Recalculate brick setup and bricks so that the starting positions match.
    const newSetup = getBrickSetup();
    setBrickSetup(newSetup);
    setBricks(generateBricks());
    setPaddleX(350);
    resetBall();
    setHasStarted(false);
  }

  // Convert pointer coordinates to logical coordinates.
  function handlePointerMove(e: React.MouseEvent | React.TouchEvent) {
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

      {/* Adjustable settings */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "1rem" }}>
          Initial Ball Speed:{" "}
          <input
            type="number"
            value={initialBallSpeed}
            onChange={(e) => setInitialBallSpeed(Number(e.target.value))}
            style={{ width: "50px" }}
          />
        </label>
        <label style={{ marginRight: "1rem" }}>
          Brick Rows:{" "}
          <input
            type="number"
            value={customBrickRows}
            onChange={(e) => setCustomBrickRows(Number(e.target.value))}
            style={{ width: "50px" }}
          />
        </label>
        <label>
          Brick Columns:{" "}
          <input
            type="number"
            value={customBrickCols}
            onChange={(e) => setCustomBrickCols(Number(e.target.value))}
            style={{ width: "50px" }}
          />
        </label>
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
