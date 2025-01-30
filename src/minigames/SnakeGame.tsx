import React, { useEffect, useRef, useState } from "react";
import mpLogo from "../assets/mp_logo.png";

/**
 * Snake with bigger arrow buttons (background, radius),
 * scaled from a 400x400 logical board.
 */
export const SnakeGame: React.FC = () => {
  const LOGICAL_SIZE = 400;
  const tileCount = 20;
  const tileSize = 20;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });

  // Resize canvas to keep square ratio
  useEffect(() => {
    function handleResize() {
      const maxWidth = Math.min(window.innerWidth * 0.9, LOGICAL_SIZE);
      setCanvasSize({ width: maxWidth, height: maxWidth });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [direction, setDirection] = useState<"UP" | "DOWN" | "LEFT" | "RIGHT">("RIGHT");
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 5, y: 10 },
    { x: 4, y: 10 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 10, y: 10 });
  const [logoLoaded, setLogoLoaded] = useState(false);
  const logoImg = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoImg.current = img;
      setLogoLoaded(true);
    };
  }, []);

  // Move snake every 200ms
  useEffect(() => {
    const interval = setInterval(() => {
      moveSnake();
    }, 200);
    return () => clearInterval(interval);
  }, [snake, direction]);

  function moveSnake() {
    const head = { ...snake[0] };
    if (direction === "UP") head.y -= 1;
    if (direction === "DOWN") head.y += 1;
    if (direction === "LEFT") head.x -= 1;
    if (direction === "RIGHT") head.x += 1;

    // wrap edges
    if (head.x < 0) head.x = tileCount - 1;
    if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y >= tileCount) head.y = 0;

    const newSnake = [head, ...snake];
    // check food
    if (head.x === food.x && head.y === food.y) {
      setFood({
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
      });
    } else {
      newSnake.pop();
    }
    // self-collision => reset except head
    for (let i = 1; i < newSnake.length; i++) {
      if (newSnake[i].x === head.x && newSnake[i].y === head.y) {
        newSnake.splice(1);
      }
    }
    setSnake(newSnake);
  }

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") setDirection("UP");
      if (k === "arrowdown" || k === "s") setDirection("DOWN");
      if (k === "arrowleft" || k === "a") setDirection("LEFT");
      if (k === "arrowright" || k === "d") setDirection("RIGHT");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function handleTouch(dir: "UP" | "DOWN" | "LEFT" | "RIGHT") {
    setDirection(dir);
  }

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = canvasSize.width / LOGICAL_SIZE;

    // Food
    ctx.fillStyle = "red";
    ctx.fillRect(
      food.x * tileSize * scale,
      food.y * tileSize * scale,
      tileSize * scale,
      tileSize * scale
    );

    // Snake
    snake.forEach((seg, idx) => {
      const x = seg.x * tileSize * scale;
      const y = seg.y * tileSize * scale;
      const size = tileSize * scale;
      if (idx === 0 && logoLoaded && logoImg.current) {
        ctx.drawImage(logoImg.current, x, y, size, size);
      } else {
        ctx.fillStyle = "lime";
        ctx.fillRect(x, y, size, size);
      }
    });
  });

  return (
    <div style={{ marginBottom: "1rem", textAlign: "center", color: "white" }}>
      <h3>Snake Game</h3>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ background: "#222", border: "1px solid #fff" }}
      />
      {/* On-screen arrows with bigger buttons */}
      <div style={{ marginTop: "1rem", display: "inline-block" }}>
        <div>
          <button
            onClick={() => handleTouch("UP")}
            style={{
              fontSize: "1.5rem",
              background: "#444",
              color: "#fff",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              margin: "0.3rem",
            }}
          >
            ↑
          </button>
        </div>
        <div>
          <button
            onClick={() => handleTouch("LEFT")}
            style={{
              fontSize: "1.5rem",
              background: "#444",
              color: "#fff",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              margin: "0.3rem",
            }}
          >
            ←
          </button>
          <button
            onClick={() => handleTouch("RIGHT")}
            style={{
              fontSize: "1.5rem",
              background: "#444",
              color: "#fff",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              margin: "0.3rem",
            }}
          >
            →
          </button>
        </div>
        <div>
          <button
            onClick={() => handleTouch("DOWN")}
            style={{
              fontSize: "1.5rem",
              background: "#444",
              color: "#fff",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              margin: "0.3rem",
            }}
          >
            ↓
          </button>
        </div>
      </div>
    </div>
  );
};
