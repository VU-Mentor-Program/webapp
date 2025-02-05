// PlinkoGame.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import mpLogoCircle from "../assets/mp_logo-CIRCLE.png";
import GameOverModal from "../components/minigame page/GameOverModal";

// A dropped ball carries its physics state plus the bet it was dropped with.
interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bet: number;
}

const PlinkoGame: React.FC = () => {
  // Canvas dimensions and radii.
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const ballRadius = 10; // The ball is drawn as a 20x20 image/circle.
  const pegRadius = 5;

  // Game states.
  const [currency, setCurrency] = useState(10);
  const [bet, setBet] = useState(2);
  // We'll show the most recent landed ball's payout.
  const [result, setResult] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Instead of a single ball, we maintain an array of dropped balls.
  // Each ball holds its own physics state and the bet associated with it.
  const ballsRef = useRef<BallState[]>([]);

  // Animation frame and time tracking.
  const animationFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Peg configuration – 10 rows with alternating peg counts.
  const rows = 10;
  const pegs = useRef(
    (() => {
      const arr: { x: number; y: number }[] = [];
      for (let i = 1; i <= rows; i++) {
        const y = i * (CANVAS_HEIGHT / (rows + 1));
        const pegCount = i % 2 === 0 ? 8 : 7;
        for (let j = 0; j < pegCount; j++) {
          const x = ((j + 1) * CANVAS_WIDTH) / (pegCount + 1);
          arr.push({ x, y });
        }
      }
      return arr;
    })()
  );

  // Landing slots configuration – 8 slots with multipliers.
  const slotCount = 8;
  const slotMultipliers = [4, 2, 1, 0.2, 0.2, 1, 2, 4];

  // Load the ball image.
  const [ballImgLoaded, setBallImgLoaded] = useState(false);
  const ballImgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogoCircle;
    img.onload = () => {
      ballImgRef.current = img;
      setBallImgLoaded(true);
    };
  }, []);

  // Physics constants.
  const gravity = 1200; // pixels per second².
  const restitution = 0.5; // bounce factor.
  const jitterRange = Math.PI / 180; // small random angle for collision.
  const damping = 0.995; // damping per frame.
  // Using a smaller fixed timestep (e.g. 1/120 sec) increases the physics update frequency.
  const fixedDelta = 1 / 120; // ~0.00833 sec per physics step.

  // Reference to the canvas element.
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the scene: background, pegs, landing slots, and every dropped ball.
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas and draw background.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pegs.
    ctx.fillStyle = "#888";
    pegs.current.forEach((peg) => {
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, pegRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw landing slots.
    const slotWidth = canvas.width / slotCount;
    for (let i = 0; i < slotCount; i++) {
      ctx.fillStyle = "#555";
      ctx.fillRect(i * slotWidth, canvas.height - 20, slotWidth - 2, 20);
      ctx.fillStyle = "white";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("x" + slotMultipliers[i], i * slotWidth + slotWidth / 2, canvas.height - 10);
    }

    // Draw each dropped ball.
    ballsRef.current.forEach((ball) => {
      if (ballImgLoaded && ballImgRef.current) {
        ctx.drawImage(
          ballImgRef.current,
          ball.x - ballRadius,
          ball.y - ballRadius,
          ballRadius * 2,
          ballRadius * 2
        );
      } else {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [ballImgLoaded, ballRadius, slotCount, slotMultipliers, pegRadius]);

  // Physics update for one ball.
  const updatePhysicsForBall = useCallback(
    (ball: BallState, delta: number) => {
      // Apply gravity.
      ball.vy += gravity * delta;
      // Update position.
      ball.x += ball.vx * delta;
      ball.y += ball.vy * delta;
      // Bounce off left/right walls.
      if (ball.x < ballRadius) {
        ball.x = ballRadius;
        ball.vx = Math.abs(ball.vx);
      } else if (ball.x > CANVAS_WIDTH - ballRadius) {
        ball.x = CANVAS_WIDTH - ballRadius;
        ball.vx = -Math.abs(ball.vx);
      }
      // Process collisions with each peg.
      pegs.current.forEach((peg) => {
        const dx = ball.x - peg.x;
        const dy = ball.y - peg.y;
        const dist = Math.hypot(dx, dy);
        const minDist = ballRadius + pegRadius;
        if (dist < minDist) {
          const nx = dx / dist;
          const ny = dy / dist;
          // Push the ball out of the peg.
          ball.x = peg.x + nx * minDist;
          ball.y = peg.y + ny * minDist;
          // Reflect velocity.
          const dot = ball.vx * nx + ball.vy * ny;
          let rvx = ball.vx - (1 + restitution) * dot * nx;
          let rvy = ball.vy - (1 + restitution) * dot * ny;
          // Add a small random perturbation.
          const currentAngle = Math.atan2(rvy, rvx);
          const jitter = (Math.random() - 0.5) * jitterRange;
          const newAngle = currentAngle + jitter;
          const speed = Math.hypot(rvx, rvy);
          ball.vx = speed * Math.cos(newAngle);
          ball.vy = speed * Math.sin(newAngle);
        }
      });
      // Apply damping.
      ball.vx *= damping;
      ball.vy *= damping;
    },
    [gravity, ballRadius, CANVAS_WIDTH, pegRadius, restitution, jitterRange, damping]
  );

  // The main animation loop.
  // It updates physics for every dropped ball, draws the scene,
  // removes landed balls (and computes their payout), and continues as long as any ball is in flight.
  const animate = useCallback(
    (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }
      let dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      // Clamp dt in case of tab switching.
      dt = Math.min(dt, 0.05);

      // Update physics for each ball using fixed timestep integration.
      for (let i = 0; i < ballsRef.current.length; i++) {
        let ball = ballsRef.current[i];
        let t = dt;
        while (t > fixedDelta) {
          updatePhysicsForBall(ball, fixedDelta);
          t -= fixedDelta;
        }
        updatePhysicsForBall(ball, t);
      }

      // Process landed balls.
      const remainingBalls: BallState[] = [];
      for (let i = 0; i < ballsRef.current.length; i++) {
        const ball = ballsRef.current[i];
        if (ball.y >= CANVAS_HEIGHT - ballRadius) {
          // The ball has landed. Determine its landing slot.
          const slotWidth = CANVAS_WIDTH / slotCount;
          const slotIndex = Math.min(Math.floor(ball.x / slotWidth), slotCount - 1);
          const multiplier = slotMultipliers[slotIndex];
          const payout = ball.bet * multiplier;
          setResult(payout);
          setCurrency((prev) => prev + payout);
        } else {
          remainingBalls.push(ball);
        }
      }
      ballsRef.current = remainingBalls;

      // Redraw the scene.
      drawCanvas();

      // Continue animating if there are still balls in flight.
      if (ballsRef.current.length > 0) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        animationFrameId.current = null;
      }
    },
    [CANVAS_HEIGHT, ballRadius, CANVAS_WIDTH, updatePhysicsForBall, drawCanvas, fixedDelta, slotCount, slotMultipliers]
  );

  // When the user clicks "Drop Ball":
  //  - Deduct the current bet from currency,
  //  - Push a new ball (with its own bet value) into the balls array,
  //  - And start the animation loop if not already running.
  const handleDrop = () => {
    if (bet > currency) {
      alert("Bet exceeds available currency!");
      return;
    }
    // Deduct the bet immediately.
    setCurrency((prev) => prev - bet);
    // Add a new ball drop (its bet is locked in here).
    ballsRef.current.push({ x: CANVAS_WIDTH / 2, y: 0, vx: 0, vy: 0, bet });
    // Start animation if not already running.
    if (!animationFrameId.current) {
      lastTimeRef.current = null;
      animationFrameId.current = requestAnimationFrame(animate);
    }
  };

  // Button styling.
  const buttonStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    border: "none",
    borderRadius: "8px",
    background: "#444",
    color: "white",
    cursor: "pointer",
    margin: "0.5rem",
    transition: "background 0.3s ease",
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.target as HTMLButtonElement).style.background = "#666";
  };
  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.target as HTMLButtonElement).style.background = "#444";
  };

  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h3>Plinko Ball</h3>
      <p>Currency: {currency}</p>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Bet Amount:{" "}
          <input
            type="number"
            value={bet}
            min="1"
            max={currency}
            onChange={(e) => setBet(Number(e.target.value))}
            style={{
              marginLeft: "0.5rem",
              width: "80px",
              padding: "0.3rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </label>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          background: "#222",
          border: "1px solid #fff",
          marginTop: "1rem",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
      <div style={{ marginTop: "1rem" }}>
        {/* The drop button is always enabled so the user can drop multiple balls concurrently. */}
        <button
          onClick={handleDrop}
          style={buttonStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          Drop Ball
        </button>
        <button
          onClick={() => setShowModal(true)}
          style={buttonStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          Submit Score
        </button>
      </div>
      {result !== null && (
        <p style={{ marginTop: "1rem" }}>
          {result >= 0 ? `You won ${result}!` : `You lost ${-result}!`}
        </p>
      )}
      <GameOverModal
        isOpen={showModal}
        score={currency}
        gameName={"plinko"}
        onClose={() => setShowModal(false)}
        onRestart={() => {
          setCurrency(10);
          // Clear all balls.
          ballsRef.current = [];
          setResult(null);
          setShowModal(false);
          // Clear any pending animation.
          if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
          }
        }}
      />
    </div>
  );
};

export default PlinkoGame;
