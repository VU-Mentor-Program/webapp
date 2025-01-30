import React, { useEffect, useRef, useState } from "react";
import mpLogo from "../assets/mp_logo-CIRCLE.png";

/**
 * Logo Catch:
 * - The logo is a "basket" at the bottom.
 * - Good items (fruits) & bad items (bombs) fall from top.
 * - Catch good => +1 score, catch bad => game over.
 */
export const LogoCatchGame: React.FC = () => {
  const LOGICAL_WIDTH = 400;
  const LOGICAL_HEIGHT = 600;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 600 });

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

  // basket
  const [basketX, setBasketX] = useState(200);
  const basketY = 550;
  const basketSize = 50;

  // items
  type FallingItem = {
    x: number;
    y: number;
    speed: number;
    isGood: boolean; // true => good, false => bad
  };
  const [items, setItems] = useState<FallingItem[]>([]);
  const spawnFrameRef = useRef(0);

  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const logoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        setBasketX((x) => Math.max(x - 10, 0));
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        setBasketX((x) => Math.min(x + 10, LOGICAL_WIDTH - basketSize));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver]);

  // main loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      updateGame();
      drawGame();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameOver, basketX, items, score, canvasSize]);

  function updateGame() {
    if (gameOver) return;
    // spawn items
    spawnFrameRef.current++;
    if (spawnFrameRef.current % 60 === 0) {
      const x = Math.random() * (LOGICAL_WIDTH - 30);
      const isGood = Math.random() < 0.7; // 70% good
      const speed = 3 + Math.random() * 2;
      setItems((prev) => [...prev, { x, y: -30, speed, isGood }]);
    }

    // move items
    setItems((prev) =>
      prev.map((it) => ({ ...it, y: it.y + it.speed })).filter((it) => it.y < LOGICAL_HEIGHT + 50)
    );

    // check collisions with basket
    const basketRect = { x: basketX, y: basketY, w: basketSize, h: basketSize };
    setItems((prev) => {
      const newItems: FallingItem[] = [];
      for (const it of prev) {
        if (checkCollide(it, basketRect)) {
          if (it.isGood) {
            setScore((s) => s + 1);
          } else {
            // bad => game over
            setGameOver(true);
          }
        } else {
          newItems.push(it);
        }
      }
      return newItems;
    });
  }

  function checkCollide(it: FallingItem, br: { x: number; y: number; w: number; h: number }) {
    const size = 30;
    return !(
      it.x + size < br.x ||
      it.x > br.x + br.w ||
      it.y + size < br.y ||
      it.y > br.y + br.h
    );
  }

  function drawGame() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;

    // draw basket (logo)
    const img = logoRef.current;
    if (img) {
      ctx.drawImage(
        img,
        basketX * scaleX,
        basketY * scaleY,
        basketSize * scaleX,
        basketSize * scaleY
      );
    } else {
      ctx.fillStyle = "yellow";
      ctx.fillRect(
        basketX * scaleX,
        basketY * scaleY,
        basketSize * scaleX,
        basketSize * scaleY
      );
    }

    // draw items
    items.forEach((it) => {
      if (it.isGood) {
        ctx.fillStyle = "lightgreen";
      } else {
        ctx.fillStyle = "red";
      }
      ctx.fillRect(it.x * scaleX, it.y * scaleY, 30 * scaleX, 30 * scaleY);
    });

    // score
    ctx.fillStyle = "white";
    ctx.font = `${20 * Math.min(scaleX, scaleY)}px Arial`;
    ctx.fillText(`Score: ${score}`, 10, 30 * scaleY);

    if (gameOver) {
      ctx.fillText("GAME OVER!", 100 * scaleX, 200 * scaleY);
    }
  }

  // pointer => move basket
  function handlePointerMove(e: React.MouseEvent | React.TouchEvent) {
    if (gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const scale = LOGICAL_WIDTH / rect.width;
    const xPos = clientX - rect.left;
    const logicX = xPos * scale - basketSize / 2;
    setBasketX(Math.min(Math.max(logicX, 0), LOGICAL_WIDTH - basketSize));
  }

  function restart() {
    setGameOver(false);
    setScore(0);
    setItems([]);
    setBasketX(200);
    spawnFrameRef.current = 0;
  }

  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h3>Logo Catch</h3>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ background: "#444" }}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
      />
      <p>Move basket with mouse/finger or ←/→. Catch good items!</p>
      {gameOver && (
        <button onClick={restart} style={{ marginTop: "1rem" }}>
          Restart
        </button>
      )}
    </div>
  );
};
