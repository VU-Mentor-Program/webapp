import React, { useRef, useState, useEffect } from "react";
import PauseButton from "../components/minigame page/PauseButton";
import RestartButton from "../components/minigame page/RestartButton";
import GameOverModal from "../components/minigame page/GameOverModal";

// ------------------ Types ------------------
interface Wall {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface PinballElement {
  id: number;
  type: "bumper" | "wall" | "spinner" | "absorber" | "target" | "curve";
  x: number;
  y: number;
  radius: number;
  angle?: number;       // For spinner & curve (in degrees for curve drawing)
  angularSpeed?: number;
  hit?: boolean;        // For targets, so they disappear once hit
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;       // seconds remaining
  maxLife: number;
}

// ------------------ Helper: Generate Geometric Elements ------------------
function generateElements(LOGICAL_WIDTH: number, LOGICAL_HEIGHT: number): PinballElement[] {
  const types: ("bumper" | "wall" | "spinner" | "absorber" | "target")[] = ["bumper", "wall", "spinner", "absorber", "target"];
  const elements: PinballElement[] = [];
  const count = 15;
  const centerX = LOGICAL_WIDTH / 2; // e.g. 200
  const centerY = LOGICAL_HEIGHT / 2; // e.g. 300
  const r = 150; // radius for circular layout
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    let type = types[i % types.length];
    const elem: PinballElement = {
      id: i + 1,
      type,
      x,
      y,
      radius: 15,
    };
    // Make the first element a "curve" element.
    if (i === 0) {
      elem.type = "curve";
      // Instead of adding 60°, subtract 60° so that the curve rotates 60° to the right.
      elem.angle = 270 - 60; // 210°
    }
    // For spinners, assign a randomized angularSpeed.
    if (type === "spinner") {
      elem.angularSpeed = 1 + Math.random();
    }
    elements.push(elem);
  }
  return elements;
}

// ------------------ Helper: Spawn Explosion Particles ------------------
function spawnParticles(el: PinballElement, particles: Particle[]) {
  const count = 30; // number of particles per exploded element
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 50 + 50;
    particles.push({
      x: el.x,
      y: el.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.5,
      maxLife: 1.5,
    });
  }
}

// ------------------ Component ------------------
export const PinballGame: React.FC = () => {
  // Logical dimensions for the pinball table.
  const LOGICAL_WIDTH = 400;
  const LOGICAL_HEIGHT = 600;

  // Canvas state with proper aspect ratio (400×600).
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 300 * (LOGICAL_HEIGHT / LOGICAL_WIDTH) });

  // Game state.
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Plunger state.
  const [isPlungerDragging, setIsPlungerDragging] = useState(false);
  const plungerStartTimeRef = useRef<number | null>(null);
  const [plungerForce, setPlungerForce] = useState(0);

  // Launch animation state.
  const [isLaunching, setIsLaunching] = useState(false);
  const launchDuration = 500; // ms
  const launchStartTimeRef = useRef<number | null>(null);

  // Gravity.
  const GRAVITY = 1000; // pixels per second²

  // Ball state.
  const ballRef = useRef({
    x: 380,
    y: 580,
    radius: 8,
    vx: 0,
    vy: 0,
  });

  // Flipper control.
  const leftFlipperActiveRef = useRef(false);
  const rightFlipperActiveRef = useRef(false);
  const leftFlipper = {
    baseX: 100,
    baseY: LOGICAL_HEIGHT - 50, // 550
    length: 80,
    defaultAngle: 30 * (Math.PI / 180),
    activeAngle: -20 * (Math.PI / 180),
    thickness: 8,
  };
  const rightFlipper = {
    baseX: 300,
    baseY: LOGICAL_HEIGHT - 50, // 550
    length: 80,
    defaultAngle: 150 * (Math.PI / 180),
    activeAngle: 200 * (Math.PI / 180),
    thickness: 8,
  };

  // Fixed walls.
  // Outer boundaries plus additional walls isolating the plunger area.
  const wallsRef = useRef<Wall[]>([
    { x1: 0, y1: 0, x2: 0, y2: LOGICAL_HEIGHT },             // left
    { x1: 0, y1: 0, x2: LOGICAL_WIDTH, y2: 0 },                // top
    { x1: LOGICAL_WIDTH, y1: 0, x2: LOGICAL_WIDTH, y2: LOGICAL_HEIGHT }, // right
    { x1: 0, y1: LOGICAL_HEIGHT, x2: LOGICAL_WIDTH, y2: LOGICAL_HEIGHT }, // bottom
    // Plunger compartment walls:
    { x1: 360, y1: 500, x2: 360, y2: 600 }, // vertical left side of plunger area
    { x1: 360, y1: 500, x2: 380, y2: 500 }, // horizontal top segment left
    { x1: 390, y1: 500, x2: 400, y2: 500 }, // horizontal top segment right
  ]);

  // Geometric playfield elements.
  const [elements, setElements] = useState<PinballElement[]>(generateElements(LOGICAL_WIDTH, LOGICAL_HEIGHT));
  const elementsRef = useRef<PinballElement[]>(elements);

  // Particles for explosion effects.
  const particlesRef = useRef<Particle[]>([]);

  // Animation timing.
  const animationFrameId = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Responsive canvas sizing (keep 400×600 ratio).
  useEffect(() => {
    function handleResize() {
      const minWidth = 300;
      const maxWidth = LOGICAL_WIDTH * 1.2;
      const newWidth = Math.max(minWidth, Math.min(window.innerWidth * 0.9, maxWidth));
      setCanvasSize({ width: newWidth, height: newWidth * (LOGICAL_HEIGHT / LOGICAL_WIDTH) });
      // Optionally, re-generate elements (more rings on larger screens).
      const newElements = generateElements(LOGICAL_WIDTH, LOGICAL_HEIGHT);
      setElements(newElements);
      elementsRef.current = newElements;
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Draw on initial render and when dependencies change.
  useEffect(() => {
    draw();
  }, [canvasSize, hasStarted, isPaused, gameOver, plungerForce]);

  // ------------------ Main Game Loop ------------------
  function updateGame(timestamp: number) {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const dt = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    // --- Launch Animation ---
    if (isLaunching) {
      const progress = Math.min((timestamp - (launchStartTimeRef.current || 0)) / launchDuration, 1);
      // Quadratic Bezier curve from P0 (380,580) to P2 (385,500) via control point P1 (390,540)
      const P0 = { x: 380, y: 580 };
      const P1 = { x: 390, y: 540 };
      const P2 = { x: 385, y: 500 };
      const u = 1 - progress;
      ballRef.current.x = u * u * P0.x + 2 * u * progress * P1.x + progress * progress * P2.x;
      ballRef.current.y = u * u * P0.y + 2 * u * progress * P1.y + progress * progress * P2.y;
      if (progress >= 1) {
        // Set initial velocity from derivative at t=1.
        const dP = { x: 2 * (P2.x - P1.x), y: 2 * (P2.y - P1.y) };
        ballRef.current.vx = dP.x;
        ballRef.current.vy = dP.y;
        setIsLaunching(false);
      }
      draw();
      animationFrameId.current = requestAnimationFrame(updateGame);
      return;
    }

    // --- Physics Update ---
    const ball = ballRef.current;
    ball.vy += GRAVITY * dt;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Bounce off outer boundaries.
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx = -ball.vx * 1.05;
    }
    if (ball.x + ball.radius > LOGICAL_WIDTH) {
      ball.x = LOGICAL_WIDTH - ball.radius;
      ball.vx = -ball.vx * 1.05;
    }
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy = -ball.vy * 1.05;
    }
    if (ball.y - ball.radius > LOGICAL_HEIGHT) {
      setGameOver(true);
      cancelAnimationFrame(animationFrameId.current);
      return;
    }

    // Bounce off fixed walls.
    wallsRef.current.forEach((wall) => {
      const dx = wall.x2 - wall.x1;
      const dy = wall.y2 - wall.y1;
      const lengthSq = dx * dx + dy * dy;
      let t = ((ball.x - wall.x1) * dx + (ball.y - wall.y1) * dy) / lengthSq;
      t = Math.max(0, Math.min(1, t));
      const closestX = wall.x1 + t * dx;
      const closestY = wall.y1 + t * dy;
      const dist = Math.hypot(ball.x - closestX, ball.y - closestY);
      if (dist < ball.radius) {
        const nx = (ball.x - closestX) / dist;
        const ny = (ball.y - closestY) / dist;
        const dot = ball.vx * nx + ball.vy * ny;
        ball.vx -= 2 * dot * nx;
        ball.vy -= 2 * dot * ny;
        ball.vx *= 1.02;
        ball.vy *= 1.02;
      }
    });

    // Process collisions with playfield elements.
    elementsRef.current.forEach((el) => {
      if (el.type === "target" && el.hit) return;
      const dx = ball.x - el.x;
      const dy = ball.y - el.y;
      const dist = Math.hypot(dx, dy);
      if (dist < ball.radius + el.radius) {
        switch (el.type) {
          case "bumper": {
            const nx = dx / dist, ny = dy / dist;
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx -= 2 * dot * nx;
            ball.vy -= 2 * dot * ny;
            ball.vx *= 1.05;
            ball.vy *= 1.05;
            setScore((prev) => prev + 10);
            break;
          }
          case "wall": {
            const nx = dx / dist, ny = dy / dist;
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx -= 2 * dot * nx;
            ball.vy -= 2 * dot * ny;
            setScore((prev) => prev + 5);
            break;
          }
          case "spinner": {
            const nx = dx / dist, ny = dy / dist;
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx -= 2 * dot * nx;
            ball.vy -= 2 * dot * ny;
            ball.vx *= 1.02;
            ball.vy *= 1.02;
            el.angle = (el.angle || 0) + (el.angularSpeed || 1) * dt;
            setScore((prev) => prev + 5);
            break;
          }
          case "absorber": {
            ball.vx *= 0.9;
            ball.vy *= 0.9;
            setScore((prev) => prev + 2);
            break;
          }
          case "target": {
            setScore((prev) => prev + 20);
            el.hit = true;
            break;
          }
          case "curve": {
            const nx = dx / dist, ny = dy / dist;
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx -= 2 * dot * nx;
            ball.vy -= 2 * dot * ny;
            ball.vx *= 1.03;
            ball.vy *= 1.03;
            setScore((prev) => prev + 15);
            break;
          }
          default:
            break;
        }
      }
    });
    // Remove targets that have been hit.
    elementsRef.current = elementsRef.current.filter((el) => el.type !== "target" || !el.hit);

    // Process flipper collisions.
    const leftAngle = leftFlipperActiveRef.current ? leftFlipper.activeAngle : leftFlipper.defaultAngle;
    const leftTip = {
      x: leftFlipper.baseX + leftFlipper.length * Math.cos(leftAngle),
      y: leftFlipper.baseY + leftFlipper.length * Math.sin(leftAngle),
    };
    handleFlipperCollision(ball, leftFlipper.baseX, leftFlipper.baseY, leftTip.x, leftTip.y, leftFlipper.thickness);
    const rightAngle = rightFlipperActiveRef.current ? rightFlipper.activeAngle : rightFlipper.defaultAngle;
    const rightTip = {
      x: rightFlipper.baseX + rightFlipper.length * Math.cos(rightAngle),
      y: rightFlipper.baseY + rightFlipper.length * Math.sin(rightAngle),
    };
    handleFlipperCollision(ball, rightFlipper.baseX, rightFlipper.baseY, rightTip.x, rightTip.y, rightFlipper.thickness);

    // Update particles.
    particlesRef.current = particlesRef.current.map((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += GRAVITY * dt * 0.3;
      p.life -= dt;
      return p;
    }).filter((p) => p.life > 0);

    draw();
    if (!isPaused && !gameOver) {
      animationFrameId.current = requestAnimationFrame(updateGame);
    }
  }

  function handleFlipperCollision(
    ball: { x: number; y: number; vx: number; vy: number; radius: number },
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    thickness: number
  ) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;
    let t = ((ball.x - x1) * dx + (ball.y - y1) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));
    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;
    const dist = Math.hypot(ball.x - closestX, ball.y - closestY);
    if (dist < ball.radius + thickness) {
      const nx = (ball.x - closestX) / dist;
      const ny = (ball.y - closestY) / dist;
      const dot = ball.vx * nx + ball.vy * ny;
      ball.vx -= 2 * dot * nx;
      ball.vy -= 2 * dot * ny;
      ball.vx *= 1.02;
      ball.vy *= 1.02;
    }
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Use separate scale factors.
    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;

    // Background.
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw fixed walls.
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    wallsRef.current.forEach((wall) => {
      ctx.beginPath();
      ctx.moveTo(wall.x1 * scaleX, wall.y1 * scaleY);
      ctx.lineTo(wall.x2 * scaleX, wall.y2 * scaleY);
      ctx.stroke();
    });

    // Draw playfield elements.
    elementsRef.current.forEach((el) => {
      ctx.beginPath();
      switch (el.type) {
        case "bumper":
          ctx.fillStyle = "orange";
          ctx.arc(el.x * scaleX, el.y * scaleY, el.radius * scaleX, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "white";
          ctx.stroke();
          break;
        case "wall":
          ctx.fillStyle = "gray";
          ctx.arc(el.x * scaleX, el.y * scaleY, el.radius * scaleX, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "white";
          ctx.stroke();
          break;
        case "spinner":
          ctx.fillStyle = "purple";
          ctx.arc(el.x * scaleX, el.y * scaleY, el.radius * scaleX, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "white";
          ctx.stroke();
          // Spinner angle indicator.
          ctx.beginPath();
          const indicatorX = el.x + el.radius * Math.cos(el.angle || 0);
          const indicatorY = el.y + el.radius * Math.sin(el.angle || 0);
          ctx.moveTo(el.x * scaleX, el.y * scaleY);
          ctx.lineTo(indicatorX * scaleX, indicatorY * scaleY);
          ctx.strokeStyle = "yellow";
          ctx.stroke();
          break;
        case "absorber":
          ctx.fillStyle = "blue";
          ctx.arc(el.x * scaleX, el.y * scaleY, el.radius * scaleX, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "white";
          ctx.stroke();
          break;
        case "target":
          ctx.fillStyle = "red";
          ctx.arc(el.x * scaleX, el.y * scaleY, el.radius * scaleX, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "white";
          ctx.stroke();
          break;
        case "curve":
          ctx.strokeStyle = "cyan";
          ctx.lineWidth = 4;
          ctx.beginPath();
          const startAngle = (el.angle! * Math.PI) / 180;
          const endAngle = ((el.angle! + 180) * Math.PI) / 180;
          ctx.arc(el.x * scaleX, el.y * scaleY, el.radius * scaleX, startAngle, endAngle);
          ctx.stroke();
          break;
        default:
          break;
      }
    });

    // Draw particles.
    particlesRef.current.forEach((p) => {
      const alpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x * scaleX, p.y * scaleY, 2 * scaleX, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
      ctx.fill();
    });

    // Draw flippers.
    const leftAngle = leftFlipperActiveRef.current ? leftFlipper.activeAngle : leftFlipper.defaultAngle;
    const leftTip = {
      x: leftFlipper.baseX + leftFlipper.length * Math.cos(leftAngle),
      y: leftFlipper.baseY + leftFlipper.length * Math.sin(leftAngle),
    };
    ctx.lineWidth = leftFlipper.thickness;
    ctx.strokeStyle = "lime";
    ctx.beginPath();
    ctx.moveTo(leftFlipper.baseX * scaleX, leftFlipper.baseY * scaleY);
    ctx.lineTo(leftTip.x * scaleX, leftTip.y * scaleY);
    ctx.stroke();

    const rightAngle = rightFlipperActiveRef.current ? rightFlipper.activeAngle : rightFlipper.defaultAngle;
    const rightTip = {
      x: rightFlipper.baseX + rightFlipper.length * Math.cos(rightAngle),
      y: rightFlipper.baseY + rightFlipper.length * Math.sin(rightAngle),
    };
    ctx.lineWidth = rightFlipper.thickness;
    ctx.strokeStyle = "lime";
    ctx.beginPath();
    ctx.moveTo(rightFlipper.baseX * scaleX, rightFlipper.baseY * scaleY);
    ctx.lineTo(rightTip.x * scaleX, rightTip.y * scaleY);
    ctx.stroke();

    // Draw the ball.
    const ball = ballRef.current;
    ctx.beginPath();
    ctx.arc(ball.x * scaleX, ball.y * scaleY, ball.radius * scaleX, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();

    // If game hasn't started, draw the plunger area.
    if (!hasStarted) {
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(360 * scaleX, 500 * scaleY, 40 * scaleX, 100 * scaleY);
      ctx.fillStyle = "yellow";
      const forceHeight = Math.min(plungerForce, 100);
      ctx.fillRect(360 * scaleX, (500 + 100 - forceHeight) * scaleY, 40 * scaleX, forceHeight * scaleY);
      ctx.fillStyle = "white";
      ctx.font = `${16 * scaleX}px Arial`;
      const message = "Hold to Launch";
      const textWidth = ctx.measureText(message).width;
      ctx.fillText(message, (360 * scaleX) + (40 * scaleX - textWidth) / 2, (500 * scaleY) - 10);
    }
  }

  // Start game loop.
  useEffect(() => {
    if (hasStarted && !isPaused && !gameOver) {
      lastTimeRef.current = 0;
      animationFrameId.current = requestAnimationFrame(updateGame);
    }
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [hasStarted, isPaused, gameOver, isLaunching]);

  // ------------------ Plunger Events ------------------
  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || hasStarted) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;
    if (x >= 360 * scaleX && x <= 400 * scaleX && y >= 500 * scaleY && y <= 600 * scaleY) {
      setIsPlungerDragging(true);
      plungerStartTimeRef.current = performance.now();
    }
  }
  function handleMouseUp() {
    if (isPlungerDragging && plungerStartTimeRef.current) {
      const holdTime = performance.now() - plungerStartTimeRef.current;
      const force = Math.min(holdTime * 0.5, 500);
      setPlungerForce(force);
      // Start launch animation.
      setIsLaunching(true);
      launchStartTimeRef.current = performance.now();
      // Reset ball to launch start position.
      ballRef.current.x = 380;
      ballRef.current.y = 580;
      setIsPlungerDragging(false);
      plungerStartTimeRef.current = null;
    }
  }
  function handleTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    const touch = e.touches[0];
    handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY } as any);
  }
  function handleTouchEnd() {
    handleMouseUp();
  }

  // ------------------ Keyboard Controls ------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "a" || e.key === "A") leftFlipperActiveRef.current = true;
      if (e.key === "l" || e.key === "L") rightFlipperActiveRef.current = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "a" || e.key === "A") leftFlipperActiveRef.current = false;
      if (e.key === "l" || e.key === "L") rightFlipperActiveRef.current = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  function togglePause() {
    setIsPaused((prev) => !prev);
  }

  function restartGame() {
    ballRef.current = { x: 380, y: 580, radius: 8, vx: 0, vy: 0 };
    const newElems = generateElements(LOGICAL_WIDTH, LOGICAL_HEIGHT);
    setElements(newElems);
    elementsRef.current = newElems;
    particlesRef.current = [];
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setHasStarted(false);
    setIsPlungerDragging(false);
    setPlungerForce(0);
    setIsLaunching(false);
  }

  return (
    <div style={{ marginBottom: "1rem", textAlign: "center", color: "white" }}>
      <h3>🎯 Pinball Game</h3>
      <p className="text-lg font-bold">Score: {score}</p>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ background: "#222", border: "1px solid #fff" }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => { if (!hasStarted) setHasStarted(true); }}
      />
      <div className="flex justify-center gap-4 mt-4">
        <PauseButton isPaused={isPaused} onTogglePause={togglePause} />
        <RestartButton onRestart={restartGame} />
      </div>
      <GameOverModal
        isOpen={gameOver}
        score={score}
        gameName={"pinball"}
        onClose={restartGame}
        onRestart={restartGame}
      />
      <div style={{ marginTop: "1rem" }}>
        <p>Use "A" for left flipper and "L" for right flipper.</p>
      </div>
    </div>
  );
};
