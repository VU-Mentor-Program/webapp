import React, { useEffect, useRef, useState } from "react";
import mpLogo from "../assets/mp_logo-CIRCLE.png";
import GameOverModal from "../components/GameOverModal";

/**
 * Logo Racer:
 * - The logo is a "car" or runner at the left.
 * - Obstacles come from the right, moving left.
 * - Tap/click/Up/Space => jump.
 * - Logo spins in the air.
 * - Survive as long as possible. Score = distance traveled.
 * - Speed ramps up gradually over time.
 */
export const LogoRacerGame: React.FC = () => {
  const LOGICAL_WIDTH = 800;
  const LOGICAL_HEIGHT = 400;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 250, height: 600 });
  // Dynamically resize (maintaining aspect ratio)
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

  // Game states
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Logo "car" properties
  const carX = 100;
  const groundY = 300; // top of the "ground"
  const carSize = 50;
  const [carY, setCarY] = useState(groundY);
  const [carVY, setCarVY] = useState(0);
  const gravity = 0.5;

  // Logo rotation
  const [carAngle, setCarAngle] = useState(0); // in degrees

  // Obstacles
  type Obstacle = { x: number; y: number; w: number; h: number };
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const spawnFrameRef = useRef(0);

  // Obstacle speed that ramps up
  const [speed, setSpeed] = useState(10);

  // Load the logo image
  const logoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  // Keyboard => jump
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === "ArrowUp" || e.key === " " || e.key === "Spacebar") && !gameOver) {
        jump();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver]);

  // Main game loop
  useEffect(() => {
    let animId = 0;
    const loop = () => {
      updateGame();
      drawGame();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
    // eslint-disable-next-line
  }, [gameOver, carY, carVY, obstacles, speed, score, canvasSize]);

  function updateGame() {
    if (gameOver) return;

    // 1) Update the car's vertical motion (gravity)
    setCarVY((vy) => vy + gravity);
    setCarY((y) => {
      const newY = y + carVY;
      // If we hit the ground, stop
      if (newY > groundY) {
        return groundY;
      }
      return newY;
    });

    // 2) Spin the car a bit every frame
    //    - you can make it spin faster if it's in the air, for example:
    setCarAngle((angle) => angle + 3); // 3 deg per frame; tweak as desired

    // 3) Move obstacles left by current speed
    //    and remove those that have gone offscreen
    setObstacles((obs) =>
      obs
        .map((o) => ({ ...o, x: o.x - speed }))
        .filter((o) => o.x + o.w > 0) // keep only visible
    );

    // 4) Gradually increase the speed for a challenge
    setSpeed((s) => s + 0.005); // tiny increment each frame

    // 5) Spawn new obstacles
    spawnFrameRef.current++;
    if (spawnFrameRef.current % 100 === 0) {
      const obstacleHeight = 50 + Math.random() * 50;
      setObstacles((prev) => [
        ...prev,
        {
          x: LOGICAL_WIDTH,
          y: groundY + carSize - obstacleHeight, // so it stands on top of the ground
          w: 50,
          h: obstacleHeight,
        },
      ]);
    }

    // 6) Collision check
    obstacles.forEach((o) => {
      if (
        // horizontally overlapping?
        carX < o.x + o.w &&
        carX + carSize > o.x &&
        // vertically overlapping?
        carY + carSize > o.y
      ) {
        setGameOver(true);
      }
    });

    // 7) Increase score
    setScore((s) => s + 1);
  }

  function drawGame() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale to "logical" coordinates
    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;

    // Save/scale once, draw everything in logical coords
    ctx.save();
    ctx.scale(scaleX, scaleY);

    // Draw ground
    ctx.fillStyle = "green";
    ctx.fillRect(0, groundY + carSize, LOGICAL_WIDTH, LOGICAL_HEIGHT - (groundY + carSize));

    // Draw obstacles
    ctx.fillStyle = "brown";
    obstacles.forEach((o) => {
      ctx.fillRect(o.x, o.y, o.w, o.h);
    });

    // Draw car (logo) with rotation
    ctx.save();
    // Translate to the center of the car (so rotation is around the middle)
    const centerX = carX + carSize / 2;
    const centerY = carY + carSize / 2;
    ctx.translate(centerX, centerY);
    // Convert degrees to radians
    ctx.rotate((carAngle * Math.PI) / 180);
    // Move back so we can draw with the car's top-left at (-carSize/2, -carSize/2)
    const img = logoRef.current;
    if (img) {
      ctx.drawImage(img, -carSize / 2, -carSize / 2, carSize, carSize);
    } else {
      ctx.fillStyle = "yellow";
      ctx.fillRect(-carSize / 2, -carSize / 2, carSize, carSize);
    }
    ctx.restore(); // restore after rotation

    // Draw score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);

    // Game Over text
    if (gameOver) {
      ctx.fillText("GAME OVER!", 300, 200);
    }

    // Restore to normal
    ctx.restore();
  }

  // Jump
  function jump() {
    // Only jump if on ground
    if (carY >= groundY) {
      // more negative => higher jump
      setCarVY(-12);
    }
  }

  // Click => jump
  function handleCanvasClick() {
    if (!gameOver) {
      jump();
    }
  }

  // Restart
  function restart() {
    setGameOver(false);
    setScore(0);
    setCarY(groundY);
    setCarVY(0);
    setCarAngle(0);
    setSpeed(5);
    setObstacles([]);
    spawnFrameRef.current = 0;
  }

  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h3>Logo Racer</h3>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ background: "#555" }}
        onClick={handleCanvasClick}
        className="border border-white flex"
      />
      <p>Tap/click or press Up/Space to jump!</p>

      <GameOverModal isOpen={gameOver} score={score} gameName="logoRacer" onClose={restart} onRestart={restart} />
    </div>
  );
};
