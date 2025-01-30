import React, { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import mpLogo from "../assets/mp_logo-CIRCLE.png";

/**
 * Brick Breaker with dynamic brick layouts for smaller screens:
 * If canvas width < 500 => use smaller layout (4 cols, 2 rows).
 * Otherwise => normal layout (6 cols, 3 rows).
 */
export const OnePersonPong: React.FC = () => {
  // "Logical" size for all calculations
  const LOGICAL_WIDTH = 700;
  const LOGICAL_HEIGHT = 600;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

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

  const [hasWon, setHasWon] = useState(false);

  // Determine columns/rows/brick sizes depending on final canvas width
  // We'll recalc whenever we "restartGame"
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
        brickCols: 4,
        brickRows: 2,
        brickWidth: 70,
        brickHeight: 20,
        padding: 10,
        offsetLeft: 50,
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

  // We'll store the dynamic brick setup in state, updated when we restart
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
  const [ballDX, setBallDX] = useState(() => rand(-3, 3) || 2);
  const [ballDY, setBallDY] = useState(() => rand(-3, -1));
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

  // Check if all bricks destroyed => Win
  useEffect(() => {
    if (bricks.every((b) => b.destroyed)) {
      setHasWon(true);
    }
  }, [bricks]);

  // Main animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (hasWon) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawAll(ctx);
      return;
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawAll(ctx);
      updateBall();
      requestRef.current = requestAnimationFrame(render);
    };
    requestRef.current = requestAnimationFrame(render);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [
    ballX,
    ballY,
    ballDX,
    ballDY,
    paddleX,
    ballRotation,
    bricks,
    hasWon,
    canvasSize,
    brickSetup,
  ]);

  function drawAll(ctx: CanvasRenderingContext2D) {
    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;

    // Helper to draw rect in logical coords
    function drawRect(lx: number, ly: number, lw: number, lh: number, color: string) {
      ctx.fillStyle = color;
      ctx.fillRect(lx * scaleX, ly * scaleY, lw * scaleX, lh * scaleY);
    }

    // Draw bricks
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

    // Paddle
    drawRect(paddleX - paddleWidth / 2, paddleY, paddleWidth, paddleHeight, "darkblue");

    // Ball
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
  }

  function updateBall() {
    setBallRotation((r) => r + 2);

    // side walls
    if (ballX + ballDX < ballRadius || ballX + ballDX > LOGICAL_WIDTH - ballRadius) {
      setBallDX((d) => -d);
    }
    // top
    if (ballY + ballDY < ballRadius) {
      setBallDY((d) => -d);
    }
    // bottom => reset
    else if (ballY + ballDY > LOGICAL_HEIGHT - ballRadius) {
      resetBall();
    }

    // paddle collision
    if (
      ballY + ballDY >= paddleY - ballRadius &&
      ballX >= paddleX - paddleWidth / 2 &&
      ballX <= paddleX + paddleWidth / 2
    ) {
      setBallDY((d) => -d);
    }

    // brick collisions
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
    // recalc brick setup in case we resized
    setBrickSetup(getBrickSetup());
    setBricks(generateBricks());
    setPaddleX(350);
    resetBall();
  }

  function pauseGame() {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }

  // Convert pointer coords => logical coords
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

  return (
    <div style={{ textAlign: "center", marginTop: "1rem", color: "white" }}>
      <h2>One-Person Pong / Brick Breaker!</h2>
      {hasWon && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={500}
          recycle={false}
        />
      )}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ background: "#333", border: "2px solid #fff" }}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
      />
      <p>Move the paddle with mouse or finger; break all the tiles!</p>
      <button onClick={restartGame} style={{ marginRight: "1rem" }}>
        Restart
      </button>
      <button onClick={pauseGame}>Pause</button>
    </div>
  );
};
