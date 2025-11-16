import React, { useEffect, useRef, useState } from "react";
import GameOverModal from "../components/minigame page/GameOverModal";
import PauseButton from "../components/minigame page/PauseButton";

export const IdeaDashGame: React.FC = () => {
  const LOGICAL_WIDTH = 800;
  const LOGICAL_HEIGHT = 400;
  const GRAVITY = 0.6;
  const JUMP_FORCE = -12;
  const GROUND_Y = 320;
  const PLAYER_SIZE = 40;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Game state
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [speed, setSpeed] = useState(4);
  const [ideasCollected, setIdeasCollected] = useState(0);
  const [streak, setStreak] = useState(
    parseInt(localStorage.getItem("ideaDashStreak") || "0")
  );
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem("ideaDashHighScore") || "0")
  );

  // Player physics
  const [playerY, setPlayerY] = useState(GROUND_Y);
  const [playerVelY, setPlayerVelY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  // Game objects
  interface GameObject {
    x: number;
    y: number;
    type: "obstacle" | "idea" | "powerup";
    label?: string;
  }
  const [objects, setObjects] = useState<GameObject[]>([]);

  const [powerUpActive, setPowerUpActive] = useState<string | null>(null);
  const [powerUpTimer, setPowerUpTimer] = useState(0);

  const frameRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const lastPowerUpTimeRef = useRef(0);

  const obstacleLabels = ["Perfectionism", "Self-Doubt", "Comparison", "Fear"];

  // Responsive canvas
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


  // Game loop
  useEffect(() => {
    let animId: number;
    const loop = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsedSeconds = (timestamp - startTimeRef.current) / 1000;

      if (!isPaused && !gameOver && hasStarted) {
        updateGame(elapsedSeconds);
      }
      drawGame();

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameOver, isPaused, hasStarted, playerY, playerVelY, objects, hearts, score, speed, ideasCollected, powerUpActive]);

  function updateGame(elapsedSeconds: number) {
    frameRef.current++;

    // Update player physics
    let newVelY = playerVelY + GRAVITY;
    let newY = playerY + newVelY;

    if (newY >= GROUND_Y) {
      newY = GROUND_Y;
      newVelY = 0;
      setIsJumping(false);
    }

    setPlayerY(newY);
    setPlayerVelY(newVelY);

    // Spawn obstacles and ideas
    const spawnRate = Math.max(60 - Math.floor(elapsedSeconds * 2), 30);
    if (frameRef.current % spawnRate === 0) {
      const rand = Math.random();
      if (rand < 0.4) {
        // Spawn obstacle
        setObjects((o) => [
          ...o,
          {
            x: LOGICAL_WIDTH,
            y: GROUND_Y,
            type: "obstacle",
            label: obstacleLabels[Math.floor(Math.random() * obstacleLabels.length)],
          },
        ]);
      } else if (rand < 0.8) {
        // Spawn idea (lightbulb)
        const yPos = GROUND_Y - Math.random() * 150 - 50;
        setObjects((o) => [
          ...o,
          {
            x: LOGICAL_WIDTH,
            y: yPos,
            type: "idea",
          },
        ]);
      }
    }

    // Spawn power-up every 10 seconds
    if (elapsedSeconds - lastPowerUpTimeRef.current > 10) {
      lastPowerUpTimeRef.current = elapsedSeconds;
      setObjects((o) => [
        ...o,
        {
          x: LOGICAL_WIDTH,
          y: GROUND_Y - 100,
          type: "powerup",
        },
      ]);
    }

    // Move objects
    setObjects((obs) =>
      obs
        .map((o) => ({ ...o, x: o.x - speed }))
        .filter((o) => o.x > -50)
    );

    // Collision detection
    const playerHitbox = {
      x: 50,
      y: newY,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
    };

    objects.forEach((obj) => {
      const objHitbox = {
        x: obj.x,
        y: obj.y,
        width: obj.type === "idea" ? 30 : obj.type === "powerup" ? 35 : 40,
        height: obj.type === "idea" ? 30 : obj.type === "powerup" ? 35 : 40,
      };

      if (checkCollision(playerHitbox, objHitbox)) {
        if (obj.type === "obstacle") {
          if (powerUpActive !== "shield") {
            setHearts((h) => {
              const newHearts = h - 1;
              if (newHearts <= 0) {
                endGame();
              }
              return newHearts;
            });
          }
          setObjects((o) => o.filter((item) => item !== obj));
        } else if (obj.type === "idea") {
          setScore((s) => s + 1);
          setIdeasCollected((i) => {
            const newIdeas = i + 1;
            if (newIdeas % 5 === 0) {
              setSpeed((s) => s * 1.1);
            }
            return newIdeas;
          });
          setObjects((o) => o.filter((item) => item !== obj));
        } else if (obj.type === "powerup") {
          const powerups = ["shield", "magnet", "slowmo"];
          const randomPowerup = powerups[Math.floor(Math.random() * powerups.length)];
          setPowerUpActive(randomPowerup);
          setPowerUpTimer(5);
          setObjects((o) => o.filter((item) => item !== obj));
        }
      }
    });

    // Power-up timer
    if (powerUpActive && powerUpTimer > 0) {
      setPowerUpTimer((t) => t - 0.016);
    } else if (powerUpTimer <= 0) {
      setPowerUpActive(null);
    }

    // Apply power-up effects
    if (powerUpActive === "magnet") {
      // Attract nearby ideas
      setObjects((obs) =>
        obs.map((o) => {
          if (o.type === "idea") {
            const dx = 50 - o.x;
            const dy = newY - o.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              return {
                ...o,
                x: o.x + dx * 0.1,
                y: o.y + dy * 0.1,
              };
            }
          }
          return o;
        })
      );
    }
  }

  function checkCollision(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ) {
    return !(
      a.x + a.width < b.x ||
      a.x > b.x + b.width ||
      a.y + a.height < b.y ||
      a.y > b.y + b.height
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

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#16213e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = "#0f3460";
    ctx.fillRect(0, GROUND_Y * scaleY, canvas.width, canvas.height - GROUND_Y * scaleY);

    // Draw objects
    objects.forEach((obj) => {
      if (obj.type === "obstacle") {
        ctx.fillStyle = "#e94560";
        ctx.fillRect(obj.x * scaleX, obj.y * scaleY, 40 * scaleX, 40 * scaleY);
        ctx.fillStyle = "white";
        ctx.font = `${10 * Math.min(scaleX, scaleY)}px Arial`;
        ctx.fillText(obj.label || "", obj.x * scaleX, (obj.y - 5) * scaleY);
      } else if (obj.type === "idea") {
        // Lightbulb
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(obj.x * scaleX, obj.y * scaleY, 15 * scaleX, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = `${20 * Math.min(scaleX, scaleY)}px Arial`;
        ctx.fillText("💡", (obj.x - 10) * scaleX, (obj.y + 10) * scaleY);
      } else if (obj.type === "powerup") {
        ctx.fillStyle = "#00d4ff";
        ctx.beginPath();
        ctx.arc(obj.x * scaleX, obj.y * scaleY, 17.5 * scaleX, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = `${20 * Math.min(scaleX, scaleY)}px Arial`;
        ctx.fillText("⚡", (obj.x - 10) * scaleX, (obj.y + 10) * scaleY);
      }
    });

    // Player
    ctx.fillStyle = powerUpActive === "shield" ? "#00ff00" : "#53a8e2";
    ctx.fillRect(50 * scaleX, playerY * scaleY, PLAYER_SIZE * scaleX, PLAYER_SIZE * scaleY);
    ctx.fillStyle = "white";
    ctx.font = `${30 * Math.min(scaleX, scaleY)}px Arial`;
    ctx.fillText("🏃", 50 * scaleX, (playerY + 35) * scaleY);

    // HUD
    ctx.fillStyle = "white";
    ctx.font = `${18 * Math.min(scaleX, scaleY)}px Arial`;
    ctx.fillText(`💡 ${score}`, 10, 30 * scaleY);
    ctx.fillText(`❤️ ${hearts}`, 10, 55 * scaleY);
    ctx.fillText(`🏆 ${highScore}`, 10, 80 * scaleY);
    ctx.fillText(`🔥 ${streak}`, 10, 105 * scaleY);

    if (powerUpActive) {
      ctx.fillText(`⚡ ${powerUpActive.toUpperCase()} (${powerUpTimer.toFixed(1)}s)`, 10, 130 * scaleY);
    }

    // Start screen overlay
    if (!hasStarted && !gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = `${32 * Math.min(scaleX, scaleY)}px Arial`;
      ctx.fillText("IDEA DASH", canvas.width / 2 - 100 * scaleX, canvas.height / 2 - 50 * scaleY);
      ctx.font = `${20 * Math.min(scaleX, scaleY)}px Arial`;
      ctx.fillText("TAP or Press SPACE to Start", canvas.width / 2 - 140 * scaleX, canvas.height / 2);
      ctx.font = `${14 * Math.min(scaleX, scaleY)}px Arial`;
      ctx.fillText("Collect 💡 ideas, dodge obstacles", canvas.width / 2 - 120 * scaleX, canvas.height / 2 + 30 * scaleY);
    }
  }

  function endGame() {
    setGameOver(true);

    // Update high score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("ideaDashHighScore", score.toString());
    }

    // Update streak
    if (hearts > 0) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("ideaDashStreak", newStreak.toString());
    } else {
      setStreak(0);
      localStorage.setItem("ideaDashStreak", "0");
    }
  }

  function restart() {
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setHearts(3);
    setSpeed(4);
    setIdeasCollected(0);
    setObjects([]);
    setPlayerY(GROUND_Y);
    setPlayerVelY(0);
    setIsJumping(false);
    setPowerUpActive(null);
    setPowerUpTimer(0);
    frameRef.current = 0;
    startTimeRef.current = null;
    lastPowerUpTimeRef.current = 0;
    setHasStarted(false);
  }

  function handleJump() {
    if (gameOver || isPaused) return;

    // Start the game if not started
    if (!hasStarted) {
      setHasStarted(true);
      return;
    }

    // Jump if on ground
    if (!isJumping) {
      setPlayerVelY(JUMP_FORCE);
      setIsJumping(true);
    }
  }

  // Allow Space or click to start/jump
  useEffect(() => {
    const handleSpace = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault(); // Prevent page scroll
        handleJump();
      }
    };
    window.addEventListener("keydown", handleSpace);
    return () => window.removeEventListener("keydown", handleSpace);
  }, [hasStarted, gameOver, isJumping, isPaused]);

  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h3>💡 Idea Dash</h3>

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleJump}
        onTouchStart={(e) => {
          e.preventDefault();
          handleJump();
        }}
        style={{
          border: "2px solid #53a8e2",
          borderRadius: "8px",
          cursor: "pointer",
          touchAction: "none",
        }}
      />

      <p>Press SPACE or TAP to jump. Collect ideas 💡, dodge obstacles!</p>

      <PauseButton isPaused={isPaused} onTogglePause={() => setIsPaused(!isPaused)} />

      <GameOverModal
        isOpen={gameOver}
        score={score}
        gameName="ideaDash"
        onClose={restart}
        onRestart={restart}
      />
    </div>
  );
};
