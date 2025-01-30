import React, { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import mpLogo from "../assets/mp_logo-CIRCLE.png";

export const OnePersonPong: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  const [hasWon, setHasWon] = useState(false);
  const [paddleX, setPaddleX] = useState(350);
  const paddleWidth = 100;
  const paddleHeight = 20;
  const paddleY = 550;

  const rand = (min: number, max: number) => Math.random() * (max - min) + min;
  const [ballX, setBallX] = useState(() => rand(100, 600));
  const [ballY, setBallY] = useState(() => rand(100, 400));
  const [ballDX, setBallDX] = useState(() => rand(-3, 3) || 2);
  const [ballDY, setBallDY] = useState(() => rand(-3, -1));
  const [ballRotation, setBallRotation] = useState(0);
  const ballRadius = 15;

  const brickRows = 3;
  const brickCols = 6;
  const brickWidth = 80;
  const brickHeight = 20;
  const brickPadding = 10;
  const brickOffsetTop = 50;
  const brickOffsetLeft = 80;

  const [bricks, setBricks] = useState(() => {
    const arr = [];
    for (let r = 0; r < brickRows; r++) {
      for (let c = 0; c < brickCols; c++) {
        arr.push({
          x: brickOffsetLeft + c * (brickWidth + brickPadding),
          y: brickOffsetTop + r * (brickHeight + brickPadding),
          destroyed: false
        });
      }
    }
    return arr;
  });

  const logoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    logoRef.current = img;
  }, []);

  useEffect(() => {
    if (bricks.every((b) => b.destroyed)) {
      setHasWon(true);
    }
  }, [bricks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;

    if (hasWon) {
      ctx.clearRect(0, 0, width, height);
      drawBricks(ctx);
      drawPaddle(ctx);
      drawBall(ctx);
      return;
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      drawBricks(ctx);
      drawPaddle(ctx);
      drawBall(ctx);
      updateBallPosition(width, height);
      requestRef.current = requestAnimationFrame(render);
    };
    requestRef.current = requestAnimationFrame(render);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [ballX, ballY, ballDX, ballDY, bricks, paddleX, hasWon, ballRotation]);

  function drawBricks(ctx: CanvasRenderingContext2D) {
    for (const b of bricks) {
      if (!b.destroyed) {
        ctx.fillStyle = "lightblue";
        ctx.fillRect(b.x, b.y, brickWidth, brickHeight);
      }
    }
  }

  function drawPaddle(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "darkblue";
    ctx.fillRect(paddleX - paddleWidth / 2, paddleY, paddleWidth, paddleHeight);
  }

  function drawBall(ctx: CanvasRenderingContext2D) {
    const logo = logoRef.current;
    if (logo && logo.complete) {
      ctx.save();
      ctx.translate(ballX, ballY);
      ctx.rotate((ballRotation * Math.PI) / 180);
      ctx.drawImage(logo, -ballRadius, -ballRadius, ballRadius * 2, ballRadius * 2);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "orange";
      ctx.fill();
      ctx.closePath();
    }
  }

  function updateBallPosition(width: number, height: number) {
    setBallRotation((r) => r + 1);

    if (ballX + ballDX < ballRadius || ballX + ballDX > width - ballRadius) {
      setBallDX((d) => -d);
    }
    if (ballY + ballDY < ballRadius) {
      setBallDY((d) => -d);
    } else if (ballY + ballDY > height - ballRadius) {
      resetBall();
    }

    if (
      ballY + ballDY >= paddleY - ballRadius &&
      ballX >= paddleX - paddleWidth / 2 &&
      ballX <= paddleX + paddleWidth / 2
    ) {
      setBallDY((d) => -d);
    }

    const updated = bricks.map((br) => {
      if (!br.destroyed) {
        if (
          ballX >= br.x &&
          ballX <= br.x + brickWidth &&
          ballY - ballRadius <= br.y + brickHeight &&
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
    setBricks(
      [...Array(brickRows)].flatMap((_, r) =>
        [...Array(brickCols)].map((__, c) => ({
          x: brickOffsetLeft + c * (brickWidth + brickPadding),
          y: brickOffsetTop + r * (brickHeight + brickPadding),
          destroyed: false
        }))
      )
    );
    setPaddleX(350);
    resetBall();
  }

  function pauseGame() {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }

  function handlePointerMove(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const xPos = clientX - rect.left;
    const half = paddleWidth / 2;
    const minX = half;
    const maxX = canvas.width - half;
    setPaddleX(Math.min(Math.max(xPos, minX), maxX));
  }

  return (
    <div style={{ textAlign: "center", marginTop: "2rem", color: "white" }}>
      <h2>One-Person Pong / Brick Breaker!</h2>
      {hasWon && (
        <div>
          <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={500} recycle={false} />
          <h3>YOU WIN!!!</h3>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={700}
        height={600}
        style={{ background: "#333", border: "2px solid #fff" }}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
      />
      <p>Move the paddle with your mouse or finger; break all the tiles!</p>
      <button onClick={restartGame} style={{ marginRight: "1rem" }}>
        Restart
      </button>
      <button onClick={pauseGame}>Pause</button>
    </div>
  );
};
