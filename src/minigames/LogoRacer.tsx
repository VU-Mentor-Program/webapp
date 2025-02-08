import React, { useEffect, useRef, useState } from "react";
import mpLogo from "../assets/mp_logo-CIRCLE.png";
import GameOverModal from "../components/minigame page/GameOverModal";
import PauseButton from "../components/minigame page/PauseButton";
import RestartButton from "../components/minigame page/RestartButton";

export const LogoRacerGame: React.FC = () => {
  // Logical dimensions
  const LOGICAL_WIDTH = 800;
  const LOGICAL_HEIGHT = 400;
  const groundY = 300; // y-coordinate of the road/ground

  // Canvas ref and size state.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 250, height: 600 });

  // Game states
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  // Car (player) properties
  const carX = 100;
  const carSize = 50;
  const [carY, setCarY] = useState(groundY);
  const [carVY, setCarVY] = useState(0);
  const [carAngle, setCarAngle] = useState(0);
  const [speed, setSpeed] = useState(10);
  const gravity = 0.5;

  // -------------------------
  // New Types for Obstacles and Clouds
  // -------------------------
  type Obstacle = {
    x: number;
    y: number;
    w: number;
    h: number;
    type: "barrier" | "bird";
    birdType?: "low" | "high"; // if type==="bird"
  };

  type Cloud = {
    x: number;
    y: number;
    w: number;
    h: number;
    speed: number;
  };

  // Obstacles state – these move from right to left.
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  // Clouds state for background decoration.
  const [clouds, setClouds] = useState<Cloud[]>([]);
  // A frame counter to help with obstacle/cloud spawning.
  const spawnFrameRef = useRef(0);

  // -------------------------
  // Logo (Car) Image
  // -------------------------
  const logoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  // -------------------------
  // Handle Resize (Keep Game Fit)
  // -------------------------
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

  // -------------------------
  // Main Game Loop
  // -------------------------
  useEffect(() => {
    let animId: number;

    const loop = () => {
      if (!isPaused && !gameOver && hasStarted) {
        updateGame();
      }
      drawGame();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, gameOver, carY, carVY, obstacles, clouds, speed, score, canvasSize, hasStarted]);

  // -------------------------
  // Update Game Logic
  // -------------------------
  function updateGame() {
    if (gameOver || isPaused) return;

    // Update car physics
    setCarVY((vy) => vy + gravity);
    setCarY((y) => {
      const newY = y + carVY;
      return newY > groundY ? groundY : newY;
    });
    setCarAngle((angle) => angle + 3);

    // Update obstacles: move left and remove those offscreen.
    setObstacles((prevObstacles) => {
      const updated = prevObstacles
        .map((o) => ({ ...o, x: o.x - speed }))
        .filter((o) => o.x + o.w > 0);
      // Check collision (using full AABB collision)
      updated.forEach((o) => {
        if (
          carX < o.x + o.w &&
          carX + carSize > o.x &&
          carY < o.y + o.h &&
          carY + carSize > o.y
        ) {
          setGameOver(true);
        }
      });
      return updated;
    });

    // Update clouds: move them left (they move slower than obstacles)
    setClouds((prevClouds) =>
      prevClouds
        .map((c) => ({ ...c, x: c.x - c.speed }))
        .filter((c) => c.x + c.w > 0)
    );

    // Increase the speed slightly over time.
    setSpeed((s) => s + 0.005);

    // Increment frame counter.
    spawnFrameRef.current++;

    // Every 100 frames, spawn a new obstacle.
    if (spawnFrameRef.current % 100 === 0) {
      let obstacle: Obstacle;
      if (Math.random() < 0.5) {
        // Barrier obstacle (as before)
        const obstacleHeight = 50 + Math.random() * 50;
        obstacle = {
          x: LOGICAL_WIDTH,
          y: groundY + carSize - obstacleHeight,
          w: 50,
          h: obstacleHeight,
          type: "barrier",
        };
      } else {
        // Bird obstacle – decide if it's a "low" or "high" bird.
        const birdType = Math.random() < 0.5 ? "low" : "high";
        if (birdType === "low") {
          // Low bird: positioned so that if you remain on the ground, you will hit it.
          obstacle = {
            x: LOGICAL_WIDTH,
            y: groundY + carSize - 40, // e.g., around 310 when groundY is 300 and carSize is 50.
            w: 40,
            h: 30,
            type: "bird",
            birdType: "low",
          };
        } else {
          // High bird: positioned high so that if you jump you hit it.
          obstacle = {
            x: LOGICAL_WIDTH,
            y: groundY - 120, // e.g., around 180 when groundY is 300.
            w: 40,
            h: 30,
            type: "bird",
            birdType: "high",
          };
        }
      }
      setObstacles((prev) => [...prev, obstacle]);
    }

    // Every 150 frames, spawn a new cloud.
    if (spawnFrameRef.current % 150 === 0) {
      const cloud: Cloud = {
        x: LOGICAL_WIDTH,
        y: Math.random() * (groundY - 100), // Clouds appear in the sky (upper part)
        w: 80 + Math.random() * 40,
        h: 40 + Math.random() * 20,
        speed: speed * 0.3 + 1, // Clouds move slower than obstacles.
      };
      setClouds((prev) => [...prev, cloud]);
    }

    // Increase score continuously.
    setScore((s) => s + 1);
  }

  // -------------------------
  // Draw the Game Scene
  // -------------------------
  function drawGame() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear entire canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;

    ctx.save();
    ctx.scale(scaleX, scaleY);

    // Draw the sky background with a vertical gradient.
    const skyGradient = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGradient.addColorStop(0, "#87CEEB"); // light blue
    skyGradient.addColorStop(1, "#4682B4"); // steel blue
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, groundY + carSize);

    // Draw drifting clouds (elliptical shapes).
    clouds.forEach((c) => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.ellipse(c.x + c.w / 2, c.y + c.h / 2, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw the ground.
    ctx.fillStyle = "green";
    ctx.fillRect(0, groundY + carSize, LOGICAL_WIDTH, LOGICAL_HEIGHT - (groundY + carSize));

    // Draw obstacles.
    obstacles.forEach((o) => {
      if (o.type === "barrier") {
        ctx.fillStyle = "brown";
      } else if (o.type === "bird") {
        // Use different colors depending on the bird type.
        ctx.fillStyle = o.birdType === "low" ? "orange" : "pink";
      }
      ctx.fillRect(o.x, o.y, o.w, o.h);
    });

    // Draw the car (using the logo image if loaded, otherwise a yellow square).
    ctx.save();
    const centerX = carX + carSize / 2;
    const centerY = carY + carSize / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((carAngle * Math.PI) / 180);
    const img = logoRef.current;
    if (img) {
      ctx.drawImage(img, -carSize / 2, -carSize / 2, carSize, carSize);
    } else {
      ctx.fillStyle = "yellow";
      ctx.fillRect(-carSize / 2, -carSize / 2, carSize, carSize);
    }
    ctx.restore();

    // Draw the score.
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);

    // If game hasn't started (and not over), display a "Click to Start" overlay.
    if (!hasStarted && !gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.fillStyle = "white";
      ctx.font = "24px Arial";
      const message = "Click to Start";
      const textWidth = ctx.measureText(message).width;
      ctx.fillText(message, (LOGICAL_WIDTH - textWidth) / 2, LOGICAL_HEIGHT / 2);
    }

    ctx.restore();
  }

  // -------------------------
  // Jump Action (Only if on the Ground)
  // -------------------------
  function jump() {
    if (carY >= groundY) {
      setCarVY(-12);
    }
  }

  // When the canvas is clicked/touched:
  // • If the game hasn’t started, start it.
  // • Otherwise (if not paused and not over) and the car is on the ground, perform a jump.
  function handleStart() {
    if (!hasStarted) {
      setHasStarted(true);
    } else if (!gameOver && !isPaused && carY >= groundY) {
      jump();
    }
  }

  function restartGame() {
    setGameOver(false);
    setScore(0);
    setCarY(groundY);
    setCarVY(0);
    setCarAngle(0);
    setSpeed(10);
    setObstacles([]);
    setClouds([]);
    setPaused(false);
    spawnFrameRef.current = 0;
    setHasStarted(false);
  }

  function togglePause() {
    setPaused((prev) => !prev);
  }

  return (
    <div className="flex flex-col items-center text-white">
      <h3>Logo Racer</h3>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ background: "#555" }}
        onClick={handleStart}
        onTouchStart={handleStart}
      />
      <div className="flex gap-4 mt-4">
        <PauseButton isPaused={isPaused} onTogglePause={togglePause} />
        <RestartButton onRestart={restartGame} />
      </div>
      <GameOverModal
        isOpen={gameOver}
        score={score}
        gameName="logoRacer"
        onClose={restartGame}
        onRestart={restartGame}
      />
    </div>
  );
};
