import React, { useRef, useState, useEffect } from "react";
import PauseButton from "../components/minigame page/PauseButton";
import RestartButton from "../components/minigame page/RestartButton";
import GameOverModal from "../components/minigame page/GameOverModal";
import { useTranslations } from "../contexts/TranslationContext";

// ------------------ Types ------------------
// Added an optional "flash" property to rings for bounce visual effect.
interface Ring {
  radius: number;
  angle: number;       // current start angle for the gap (in radians)
  gapAngle: number;    // gap size (in radians)
  angularSpeed: number; // rotation speed in rad/s
  color: { r: number; g: number; b: number };
  flash?: number;      // 0..1 value for visual flash effect
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;       // seconds remaining
  maxLife: number;
  color: { r: number; g: number; b: number }; // particle color
}

// ------------------ Helpers ------------------
// Helper: convert HSL to RGB.
function hslToRgb(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }
  return { r: Math.round((r1 + m) * 255), g: Math.round((g1 + m) * 255), b: Math.round((b1 + m) * 255) };
}

// Default ring settings.
const defaultControls = {
  baseSpeed: 0.3,
  speedVariation: 0.2,
  gapAngle: 0.5,
  ringDirection: 1
};

// ------------------ Audio ------------------
// Three octaves of notes (24 notes total).
const noteFrequencies = [
  261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25,  // octave 1 (C4 - C5)
  523.25, 587.33, 659.26, 698.46, 783.99, 880.00, 987.77, 1046.50,   // octave 2 (C5 - C6)
  1046.50, 1174.66, 1318.51, 1396.91, 1567.98, 1760.00, 1975.53, 2093.00  // octave 3 (C6 - C7)
];
// Play a smoother bounce sound with a gain envelope.
function playBounceSound(frequency: number, audioCtx: AudioContext) {
  const oscillator = audioCtx.createOscillator();
  oscillator.frequency.value = frequency;
  oscillator.type = "sine";
  const gainNode = audioCtx.createGain();
  const now = audioCtx.currentTime;
  // Start at 0, ramp quickly to 0.1, then decay smoothly.
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.1, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.2);
}

// ------------------ Helpers ------------------
// Generate rings based on count and default settings.
function generateRings(count: number): Ring[] {
  const rings: Ring[] = [];
  let radius = 40;
  for (let i = 0; i < count; i++) {
    const hue = Math.random() * 360; // vibrant hue
    const color = hslToRgb(hue, 80, 50); // high saturation, mid brightness
    rings.push({
      radius,
      angle: Math.random() * 2 * Math.PI,
      gapAngle: defaultControls.gapAngle,
      angularSpeed: (defaultControls.baseSpeed + (Math.random() - 0.5) * defaultControls.speedVariation) * defaultControls.ringDirection,
      color,
      flash: 0
    });
    radius += 15; // rings spaced 15px apart
  }
  return rings;
}

// Spawn particles when a ring is escaped (through its gap)
function spawnParticles(ring: Ring, particles: Particle[]) {
  const count = 30;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 50 + 50;
    particles.push({
      x: 200 + ring.radius * Math.cos(angle),
      y: 200 + ring.radius * Math.sin(angle),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.5,
      maxLife: 1.5,
      color: { ...ring.color }
    });
  }
}

// Spawn a few extra particles on bounce.
function spawnBounceEffect(ring: Ring, x: number, y: number, particles: Particle[]) {
  const count = 5;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 20 + 10;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5,
      maxLife: 0.5,
      color: { ...ring.color }
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
  const t = useTranslations("minigames");

  // Audio context and bounce note index (using a ref for fast updates).
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bounceNoteIndexRef = useRef<number>(0);

  // Gravity.
  const GRAVITY = 200;

  const randomVelocity = () => (Math.random() < 0.5 ? 1 : -1) * (40 + Math.random() * 50);

  // Ball state.
  const ballRef = useRef({
    x: LOGICAL_SIZE / 2,
    y: LOGICAL_SIZE / 2,
    radius: 6,
    vx: randomVelocity(), 
    vy: randomVelocity(), 
  });

  // Store rings and particles.
  const ringsRef = useRef<Ring[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Global ring speed ramp factor.
  const ringSpeedRampRef = useRef(1);

  // Update rings based on canvas size using default settings.
  function updateRings() {
    const count = Math.max(5, Math.floor(canvasSize.width / 50));
    ringsRef.current = generateRings(count);
  }

  useEffect(() => {
    updateRings();
  }, [canvasSize]);

  useEffect(() => {
    function handleResize() {
      const minWidth = 300;
      const maxWidth = LOGICAL_SIZE * 1.2;
      const newWidth = Math.max(minWidth, Math.min(window.innerWidth * 0.9, maxWidth));

      setCanvasSize((prevSize) => {
        if (prevSize.width === newWidth && prevSize.height === newWidth) return prevSize;
        return { width: newWidth, height: newWidth };
      });
    }
    
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Draw start overlay when game not started.
  useEffect(() => {
    if (!hasStarted && canvasRef.current) {
      draw();
    }
  }, [hasStarted, canvasSize]);

  // Animation refs.
  const animationFrameId = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Main game loop.
  function updateGame(timestamp: number) {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const dt = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;
    ringSpeedRampRef.current += 0.05 * dt;

    const ball = ballRef.current;
    ball.vy += GRAVITY * dt;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    const centerX = LOGICAL_SIZE / 2;
    const centerY = LOGICAL_SIZE / 2;
    const ballDist = Math.hypot(ball.x - centerX, ball.y - centerY);
    const ballAngle = ((Math.atan2(ball.y - centerY, ball.x - centerX)) + 2 * Math.PI) % (2 * Math.PI);

    let bounced = false;
    ringsRef.current = ringsRef.current.filter((ring) => {
      if (Math.abs(ballDist - ring.radius) < ball.radius) {
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
          // Passing through gap: spawn gap particles and remove ring.
          spawnParticles(ring, particlesRef.current);
          return false;
        } else {
          // Solid collision (bounce).
          if (!bounced) {
            setScore((prev) => prev + 30);
            if (!audioCtxRef.current) {
              audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            playBounceSound(noteFrequencies[bounceNoteIndexRef.current], audioCtxRef.current);
            bounceNoteIndexRef.current = (bounceNoteIndexRef.current + 1) % noteFrequencies.length;
            bounced = true;
            spawnBounceEffect(ring, ball.x, ball.y, particlesRef.current);
          }
          // Compute normal and reflect velocity.
          const nx = (ball.x - centerX) / ballDist;
          const ny = (ball.y - centerY) / ballDist;
          const dot = ball.vx * nx + ball.vy * ny;
          ball.vx = ball.vx - 2 * dot * nx;
          ball.vy = ball.vy - 2 * dot * ny;
          // Reposition ball to avoid sticking.
          if (ballDist < ring.radius) {
            ball.x = centerX + (ring.radius - ball.radius) * nx;
            ball.y = centerY + (ring.radius - ball.radius) * ny;
          } else {
            ball.x = centerX + (ring.radius + ball.radius) * nx;
            ball.y = centerY + (ring.radius + ball.radius) * ny;
          }
          ball.vx *= 1.007;
          ball.vy *= 1.007;
          ring.flash = 1;
          return true;
        }
      }
      return true;
    });

    // End game if ball leaves canvas.
    if (
      ball.x - ball.radius < 0 ||
      ball.x + ball.radius > LOGICAL_SIZE ||
      ball.y - ball.radius < 0 ||
      ball.y + ball.radius > LOGICAL_SIZE
    ) {
      setGameOver(true);
      draw();
      return;
    }

    // Update rings (rotate, change colors, decay flash).
    ringsRef.current.forEach((ring) => {
      ring.angle += ring.angularSpeed * dt * ringSpeedRampRef.current;
      ring.color.r = Math.min(255, Math.max(0, ring.color.r + (Math.random() - 0.5) * 20 * dt));
      ring.color.g = Math.min(255, Math.max(0, ring.color.g + (Math.random() - 0.5) * 20 * dt));
      ring.color.b = Math.min(255, Math.max(0, ring.color.b + (Math.random() - 0.5) * 20 * dt));
      if (ring.flash) {
        ring.flash = Math.max(0, ring.flash - dt * 2);
      }
    });

    // Update particles.
    particlesRef.current = particlesRef.current
      .map((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += GRAVITY * dt * 0.3;
        p.life -= dt;
        return p;
      })
      .filter((p) => p.life > 0);

    draw();
    if (!isPaused && !gameOver) {
      animationFrameId.current = requestAnimationFrame(updateGame);
    }
  }

  // Draw all game elements.
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
      // Draw the ring's solid part (leaving the gap un-drawn)
      const gapStart = ((ring.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const gapEnd = gapStart + ring.gapAngle;
      ctx.beginPath();
      ctx.arc(centerX * scale, centerY * scale, ring.radius * scale, gapEnd, gapStart + 2 * Math.PI);
      ctx.strokeStyle = `rgb(${Math.floor(ring.color.r)}, ${Math.floor(ring.color.g)}, ${Math.floor(ring.color.b)})`;
      ctx.lineWidth = 4;
      ctx.stroke();
      // Draw flash glow only along the solid arc.
      if (ring.flash && ring.flash > 0) {
        ctx.beginPath();
        ctx.arc(centerX * scale, centerY * scale, ring.radius * scale + 4, gapEnd, gapStart + 2 * Math.PI);
        ctx.strokeStyle = `rgba(255,255,255,${ring.flash.toFixed(2)})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    // Draw particles.
    particlesRef.current.forEach((p) => {
      const alpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x * scale, p.y * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha.toFixed(2)})`;
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

    // Draw start overlay.
    if (!hasStarted && !gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = `${20 * scale}px Arial`;
      const message = "Click here to Start";
      const textWidth = ctx.measureText(message).width;
      ctx.fillText(message, (canvas.width - textWidth) / 2, canvas.height / 2);
    }
  }

  // Start game loop.
  useEffect(() => {
    if (hasStarted && !isPaused && !gameOver) {
      lastTimeRef.current = 0;
      animationFrameId.current = requestAnimationFrame(updateGame);
    }
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [hasStarted, isPaused, gameOver]);

  // Start game on canvas click.
  function handleStart() {
    if (!hasStarted) {
      setHasStarted(true);
      lastTimeRef.current = 0;
    }
  }

  // Toggle pause.
  function togglePause() {
    setIsPaused((prev) => !prev);
  }

  // Restart game.
  function restartGame() {
    ballRef.current = {
      x: LOGICAL_SIZE / 2,
      y: LOGICAL_SIZE / 2,
      radius: 6,
      vx: randomVelocity(), 
      vy: randomVelocity(), 
    };
    updateRings();
    particlesRef.current = [];
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setHasStarted(false);
    ringSpeedRampRef.current = 1;
    // Reset bounce note to first note.
    bounceNoteIndexRef.current = 0;
    draw();
  }

  // Secondary start area.
  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || hasStarted) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = canvasSize.width / LOGICAL_SIZE;
    const scaleY = canvasSize.height / LOGICAL_SIZE;
    if (x >= 360 * scaleX && x <= 400 * scaleX && y >= 500 * scaleY && y <= 600 * scaleY) {
      setHasStarted(true);
      setIsPaused(false);
      setGameOver(false);
    }
  }

  function handleTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    const touch = e.touches[0];
    handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY } as React.MouseEvent<HTMLCanvasElement>);
  }

  return (
    <div style={{ marginBottom: "1rem", textAlign: "center", color: "white" }}>
      <h3>🏀 Bouncing Ball Game</h3>
      <p className="text-lg font-bold">
        {t("score")} {score}
      </p>
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
        gameName={"bouncer"}
        onClose={restartGame}
        onRestart={restartGame}
      />
    </div>
  );
};
