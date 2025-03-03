import React, { useRef, useState, useEffect } from "react";
import PauseButton from "../components/minigame page/PauseButton";
import RestartButton from "../components/minigame page/RestartButton";
import GameOverModal from "../components/minigame page/GameOverModal";
import { useTranslations } from "../contexts/TranslationContext";

// ------------------ Types ------------------
interface Ring {
  radius: number;
  angle: number;       // current start angle for the gap (in radians)
  gapAngle: number;    // gap size (in radians)
  angularSpeed: number; // rotation speed in rad/s
  color: { r: number; g: number; b: number };
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;       // seconds remaining
  maxLife: number;
}

// ------------------ Helpers ------------------
// Generate rings based on a count and a base angular speed.
function generateRings(count: number, baseSpeed: number): Ring[] {
  const rings: Ring[] = [];
  let radius = 40;
  for (let i = 0; i < count; i++) {
    rings.push({
      radius,
      angle: Math.random() * 2 * Math.PI,
      gapAngle: 0.5, // fixed gap size
      angularSpeed: baseSpeed + (Math.random() - 0.5) * 0.2, // vary a bit
      color: {
        r: 150 + Math.floor(Math.random() * 100),
        g: 100 + Math.floor(Math.random() * 100),
        b: 80 + Math.floor(Math.random() * 100),
      },
    });
    radius += 15; // rings spaced 15px apart (closer than before)
  }
  return rings;
}

// Spawn particles along the ring's circumference.
function spawnParticles(ring: Ring, particles: Particle[]) {
  const count = 30; // number of particles per exploded ring
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 50 + 50; // pixels per second
    particles.push({
      x: (200 + ring.radius * Math.cos(angle)), // centered at 200 (will be re-offset in draw)
      y: (200 + ring.radius * Math.sin(angle)),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.5, // seconds
      maxLife: 1.5,
    });
  }
}

// ------------------ Component ------------------
export const BallBouncingGame: React.FC = () => {
  const LOGICAL_SIZE = 400;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 300 });
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const t = useTranslations('minigames');

  // Gravity (pixels per second²)
  const GRAVITY = 200;

  // Ball state.
  const ballRef = useRef({
    x: LOGICAL_SIZE / 2,
    y: LOGICAL_SIZE / 2,
    radius: 6,
    vx: 70,
    vy: 90,
  });

  // We'll store the rings and particles in refs to avoid re-renders.
  const ringsRef = useRef<Ring[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Global ring speed ramp factor (increases over time)
  const ringSpeedRampRef = useRef(1);

  // Dynamically determine number of rings based on canvas size.
  function updateRings() {
    // For example: at least 5 rings for small screens; add one extra ring per 50px above 300px width.
    const count = Math.max(5, Math.floor(canvasSize.width / 50));
    // Use a base angular speed that is slightly faster.
    const baseSpeed = 0.3;
    ringsRef.current = generateRings(count, baseSpeed);
  }

  // On initial load and whenever canvasSize changes, update rings.
  useEffect(() => {
    updateRings();
  }, [canvasSize]);

  // Resize the canvas responsively:
  useEffect(() => {
    function handleResize() {
      // For small screens, minimum width is 300; for larger screens, use 90% of window width capped by LOGICAL_SIZE * 1.2.
      const minWidth = 300;
      const maxWidth = LOGICAL_SIZE * 1.2;
      const newWidth = Math.max(
        minWidth,
        Math.min(window.innerWidth * 0.9, maxWidth)
      );
      setCanvasSize({ width: newWidth, height: newWidth });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animation refs.
  const animationFrameId = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Main game loop.
  function updateGame(timestamp: number) {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const dt = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    // Increase ring speed ramp gradually.
    ringSpeedRampRef.current += 0.05 * dt;

    const ball = ballRef.current;
    // Apply gravity.
    ball.vy += GRAVITY * dt;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Bounce off walls (with a stronger bounce multiplier).
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx = -ball.vx;
    }
    if (ball.x + ball.radius > LOGICAL_SIZE) {
      ball.x = LOGICAL_SIZE - ball.radius;
      ball.vx = -ball.vx;
    }
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy = -ball.vy;
    }
    if (ball.y + ball.radius > LOGICAL_SIZE) {
      ball.y = LOGICAL_SIZE - ball.radius;
      ball.vy = -ball.vy;
    }

    // Check collision with each ring.
    const centerX = LOGICAL_SIZE / 2;
    const centerY = LOGICAL_SIZE / 2;
    const ballDist = Math.hypot(ball.x - centerX, ball.y - centerY);
    const ballAngle = Math.atan2(ball.y - centerY, ball.x - centerX);

    // Use filter to remove rings that the ball passes through.
    ringsRef.current = ringsRef.current.filter((ring) => {
      if (Math.abs(ballDist - ring.radius) < ball.radius) {
        // Normalize angles.
        const normBallAngle = ((ballAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const gapStart = ((ring.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const gapEnd = gapStart + ring.gapAngle;
        let inGap = false;
        if (gapEnd > 2 * Math.PI) {
          if (normBallAngle >= gapStart || normBallAngle <= gapEnd - 2 * Math.PI) {
            inGap = true;
          }
        } else {
          if (normBallAngle >= gapStart && normBallAngle <= gapEnd) {
            inGap = true;
          }
        }
        if (inGap) {
          // Increase score.
          setScore((prev) => prev + 20);
          // Spawn particles from this ring.
          spawnParticles(ring, particlesRef.current);
          return false; // Remove ring.
        } else {
          // Solid collision: reflect ball velocity using radial reflection.
          const nx = (ball.x - centerX) / ballDist;
          const ny = (ball.y - centerY) / ballDist;
          const dot = ball.vx * nx + ball.vy * ny;
          ball.vx = ball.vx - 2 * dot * nx;
          ball.vy = ball.vy - 2 * dot * ny;
          // Boost ball speed.
          ball.vx *= 1.007;
          ball.vy *= 1.007;
        }
      }
      return true;
    });

    // Update rings: rotate them and change colors.
    ringsRef.current.forEach((ring) => {
      // Increase angular speed over time.
      ring.angle += ring.angularSpeed * dt * ringSpeedRampRef.current;
      // Gradually shift colors.
      ring.color.r = Math.min(255, Math.max(0, ring.color.r + (Math.random() - 0.5) * 20 * dt));
      ring.color.g = Math.min(255, Math.max(0, ring.color.g + (Math.random() - 0.5) * 20 * dt));
      ring.color.b = Math.min(255, Math.max(0, ring.color.b + (Math.random() - 0.5) * 20 * dt));
    });

    // Update particles.
    particlesRef.current = particlesRef.current.map((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // Simple gravity effect on particles.
      p.vy += GRAVITY * dt * 0.3;
      p.life -= dt;
      return p;
    }).filter((p) => p.life > 0);

    draw();

    // End game condition: for example, if score reaches some threshold (optional) or time limit.
    // Here we continue indefinitely.

    if (!isPaused && !gameOver) {
      animationFrameId.current = requestAnimationFrame(updateGame);
    }
  }

  // Draw the game elements.
  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = canvasSize.width / LOGICAL_SIZE;

    // Background.
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw rings.
    const centerX = LOGICAL_SIZE / 2;
    const centerY = LOGICAL_SIZE / 2;
    ringsRef.current.forEach((ring) => {
      const gapStart = ((ring.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const gapEnd = gapStart + ring.gapAngle;
      ctx.beginPath();
      // Draw an arc from gapEnd to gapStart + 2π so that the gap remains open.
      ctx.arc(centerX * scale, centerY * scale, ring.radius * scale, gapEnd, gapStart + 2 * Math.PI);
      ctx.strokeStyle = `rgb(${Math.floor(ring.color.r)}, ${Math.floor(ring.color.g)}, ${Math.floor(ring.color.b)})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    });

    // Draw particles.
    particlesRef.current.forEach((p) => {
      const alpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x * scale, p.y * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
      ctx.fill();
    });

    // Draw the ball.
    const ball = ballRef.current;
    ctx.beginPath();
    ctx.arc(ball.x * scale, ball.y * scale, ball.radius * scale, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();

    // If game hasn't started, overlay "Click to Start" and show the plunger area.
    if (!hasStarted && !gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = `${20 * scale}px Arial`;
      const message = "Click to Start";
      const textWidth = ctx.measureText(message).width;
      ctx.fillText(message, (canvas.width - textWidth) / 2, canvas.height / 2);
      // Also draw a plunger indicator in the bottom-right.
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(360 * scale, 500 * scale, 40 * scale, 100 * scale);
      ctx.fillStyle = "yellow";
      ctx.fillStyle = "white";
      ctx.font = `${16 * scale}px Arial`;
      const pMessage = "Hold to Launch";
      const pTextWidth = ctx.measureText(pMessage).width;
      ctx.fillText(pMessage, (360 * scale) + (40 * scale - pTextWidth) / 2, (500 * scale) - 10);
    }
  }

  // Start the game loop.
  useEffect(() => {
    if (hasStarted && !isPaused && !gameOver) {
      lastTimeRef.current = 0;
      animationFrameId.current = requestAnimationFrame(updateGame);
    }
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [hasStarted, isPaused, gameOver]);

  // Handle canvas click/touch to start the game.
  function handleStart() {
    if (!hasStarted) {
      setHasStarted(true);
    }
  }

  // Toggle pause.
  function togglePause() {
    setIsPaused((prev) => !prev);
  }

  // Restart the game.
  function restartGame() {
    // Reset ball.
    ballRef.current = {
      x: LOGICAL_SIZE / 2,
      y: LOGICAL_SIZE / 2,
      radius: 6,
      vx: 120,
      vy: 150,
    };
    // Regenerate rings based on current canvas size.
    updateRings();
    // Clear particles.
    particlesRef.current = [];
    // Reset score and states.
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setHasStarted(false);
    ringSpeedRampRef.current = 1;
  }

  // Handle plunger mouse events.
  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || hasStarted) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = canvasSize.width / LOGICAL_SIZE;
    const scaleY = canvasSize.height / LOGICAL_SIZE;
    // Check if within plunger area (approximately x:360-400, y:500-600).
    if (x >= 360 * scaleX && x <= 400 * scaleX && y >= 500 * scaleY && y <= 600 * scaleY) {
      // Begin "charging" the plunger.
      setHasStarted(false);
      setIsPaused(false);
      setGameOver(false);

    }
  }

  // Also support touch events.
  function handleTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    const touch = e.touches[0];
    handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY } as any);
  }

  // Return the component.
  return (
    <div style={{ marginBottom: "1rem", textAlign: "center", color: "white" }}>
      <h3>🏀 Bouncing Ball Game</h3>
      <p className="text-lg font-bold">{t("score")} {score}</p>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ background: "#222", border: "1px solid #fff" }}
        onClick={handleStart}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      />
      <div className="flex justify-center gap-4 mt-4">
        <PauseButton isPaused={isPaused} onTogglePause={togglePause} />
        <RestartButton onRestart={restartGame} />
      </div>
      <GameOverModal
        isOpen={gameOver}
        score={score}
        gameName={"bouncing ball"}
        onClose={restartGame}
        onRestart={restartGame}
      />
    </div>
  );
};
