import React, { useEffect, useRef, useState } from "react";
import mpLogo from "../assets/mp_logo.png"; // Adjust path

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [direction, setDirection] = useState<"UP" | "DOWN" | "LEFT" | "RIGHT">("RIGHT");
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 5, y: 10 },
    { x: 4, y: 10 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 10, y: 10 });
  const [logoLoaded, setLogoLoaded] = useState(false);
  const logoImg = useRef<HTMLImageElement | null>(null);

  const gridSize = 20;
  const tileCount = 20;

  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoImg.current = img;
      setLogoLoaded(true);
    };
  }, []);

  // Game loop
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

    // Wrap around edges
    if (head.x < 0) head.x = tileCount - 1;
    if (head.x > tileCount - 1) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y > tileCount - 1) head.y = 0;

    const newSnake = [head, ...snake];
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
      // spawn new food
      setFood({
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
      });
    } else {
      newSnake.pop();
    }
    // Check self collision
    for (let i = 1; i < newSnake.length; i++) {
      if (newSnake[i].x === head.x && newSnake[i].y === head.y) {
        // restart
        newSnake.splice(1);
      }
    }
    setSnake(newSnake);
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") setDirection("UP");
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") setDirection("DOWN");
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") setDirection("LEFT");
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") setDirection("RIGHT");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function handleTouch(dir: "UP" | "DOWN" | "LEFT" | "RIGHT") {
    setDirection(dir);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    // Draw snake
    snake.forEach((segment, idx) => {
      if (idx === 0 && logoLoaded && logoImg.current) {
        // Draw logo for head
        ctx.drawImage(
          logoImg.current,
          segment.x * gridSize,
          segment.y * gridSize,
          gridSize,
          gridSize
        );
      } else {
        ctx.fillStyle = "lime";
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
      }
    });
  });

  return (
    <div style={{ marginBottom: "1rem" }}>
      <h3>Snake Game</h3>
      <canvas
        ref={canvasRef}
        width={gridSize * tileCount}
        height={gridSize * tileCount}
        style={{ background: "#222", border: "1px solid #fff" }}
      />
      {/* Simple on-screen arrows for touch */}
      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => handleTouch("UP")}>↑</button>
        <div>
          <button onClick={() => handleTouch("LEFT")}>←</button>
          <button onClick={() => handleTouch("RIGHT")}>→</button>
        </div>
        <button onClick={() => handleTouch("DOWN")}>↓</button>
      </div>
    </div>
  );
};
