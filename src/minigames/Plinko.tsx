// PlinkoGame.tsx
import React, { useEffect, useRef, useState } from "react";
import mpLogoCircle from "../assets/mp_logo-CIRCLE.png";
import GameOverModal from "../components/minigame page/GameOverModal";

interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const PlinkoGame: React.FC = () => {
  // Canvas dimensions
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const ballRadius = 10; // the ball is drawn as a 20x20 image (or circle diameter 20)
  const pegRadius = 5;

  // Game states
  const [currency, setCurrency] = useState(500);
  const [bet, setBet] = useState(50);
  const [ball, setBall] = useState<BallState>({
    x: CANVAS_WIDTH / 2,
    y: 0,
    vx: 0,
    vy: 0,
  });
  const ballRef = useRef<BallState>(ball);
  const [isDropping, setIsDropping] = useState(false);
  const [result, setResult] = useState<number | null>(null); // outcome (payout) of this drop
  const [showModal, setShowModal] = useState(false);

  // Animation frame ID and timing ref
  const animationFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Peg configuration – 10 rows with alternating peg counts
  const rows = 10;
  const pegs = useRef(
    (() => {
      const arr: { x: number; y: number }[] = [];
      for (let i = 1; i <= rows; i++) {
        const y = i * (CANVAS_HEIGHT / (rows + 1));
        // Even rows get 8 pegs; odd rows get 7 pegs
        const pegCount = i % 2 === 0 ? 8 : 7;
        for (let j = 0; j < pegCount; j++) {
          const x = ((j + 1) * CANVAS_WIDTH) / (pegCount + 1);
          arr.push({ x, y });
        }
      }
      return arr;
    })()
  );

  // Landing slots configuration – 8 slots with multipliers increasing toward the sides.
  // The center slots are very low (x0.2), then gradually increasing to x4 at the extreme sides.
  const slotCount = 8;
  const slotMultipliers = [4, 2, 1, 0.2, 0.2, 1, 2, 4];

  // Load the ball image (mp_logo-CIRCLE.png)
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

  // Physics constants
  const gravity = 1200; // pixels per second^2
  const restitution = 0.5; // bounce factor (energy preserved)
  // Reduce jitter to 1° (instead of 5°) for smoother collisions.
  const jitterRange = Math.PI / 180;
  const damping = 0.995; // damping per frame

  // We'll use a fixed timestep for physics updates.
  const fixedDelta = 0.016; // 16ms per step (~60 FPS)

  // Animation loop with fixed timestep
  useEffect(() => {
    if (!isDropping) return;
    lastTimeRef.current = null;

    const animate = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }
      
      // Calculate the elapsed time in seconds.
      let dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      // Clamp dt if it’s too high (in case of tab switching, etc.)
      dt = Math.min(dt, 0.05);

      // Use a fixed timestep integration to update physics smoothly.
      while (dt > fixedDelta) {
        updatePhysics(fixedDelta);
        dt -= fixedDelta;
      }
      updatePhysics(dt);

      // After updating, check if the ball has reached the bottom.
      const b = ballRef.current;
      if (b.y >= CANVAS_HEIGHT - ballRadius) {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        // Determine which slot the ball landed in.
        const slotWidth = CANVAS_WIDTH / slotCount;
        const slotIndex = Math.min(Math.floor(b.x / slotWidth), slotCount - 1);
        const multiplier = slotMultipliers[slotIndex];
        // Compute payout as bet * multiplier.
        const payout = bet * multiplier;
        setResult(payout);
        setCurrency((prev) => prev + payout);
        setIsDropping(false);
        return;
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    const updatePhysics = (delta: number) => {
      // Copy the current ball state.
      const b = { ...ballRef.current };

      // Apply gravity.
      b.vy += gravity * delta;
      // Update position.
      b.x += b.vx * delta;
      b.y += b.vy * delta;

      // Bounce off left/right walls.
      if (b.x < ballRadius) {
        b.x = ballRadius;
        b.vx = Math.abs(b.vx);
      } else if (b.x > CANVAS_WIDTH - ballRadius) {
        b.x = CANVAS_WIDTH - ballRadius;
        b.vx = -Math.abs(b.vx);
      }

      // Process collisions with each peg.
      pegs.current.forEach((peg) => {
        const dx = b.x - peg.x;
        const dy = b.y - peg.y;
        const dist = Math.hypot(dx, dy);
        const minDist = ballRadius + pegRadius;
        if (dist < minDist) {
          const nx = dx / dist;
          const ny = dy / dist;
          // Push the ball out of the peg.
          b.x = peg.x + nx * minDist;
          b.y = peg.y + ny * minDist;
          // Reflect velocity.
          const dot = b.vx * nx + b.vy * ny;
          let rvx = b.vx - (1 + restitution) * dot * nx;
          let rvy = b.vy - (1 + restitution) * dot * ny;
          // Add a small random perturbation.
          const currentAngle = Math.atan2(rvy, rvx);
          const jitter = (Math.random() - 0.5) * jitterRange;
          const newAngle = currentAngle + jitter;
          const speed = Math.hypot(rvx, rvy);
          rvx = speed * Math.cos(newAngle);
          rvy = speed * Math.sin(newAngle);
          b.vx = rvx;
          b.vy = rvy;
        }
      });

      // Apply damping.
      b.vx *= damping;
      b.vy *= damping;

      // Save and update state.
      ballRef.current = b;
      setBall({ ...b });
    };

    animationFrameId.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [
    isDropping,
    bet,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    ballRadius,
    gravity,
    restitution,
    jitterRange,
    damping,
    slotCount,
    slotMultipliers,
  ]);

  // Draw the board, pegs, landing slots, and ball.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
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
    // Draw the ball.
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
  }, [ball, ballImgLoaded, pegRadius, slotCount, slotMultipliers]);

  // Handle the "Drop Ball" button click.
  const handleDrop = () => {
    if (isDropping) return;
    if (bet > currency) {
      alert("Bet exceeds available currency!");
      return;
    }
    const initialBall: BallState = {
      x: CANVAS_WIDTH / 2,
      y: 0,
      vx: 0,
      vy: 0,
    };
    ballRef.current = initialBall;
    setBall(initialBall);
    setResult(null);
    lastTimeRef.current = null;
    setIsDropping(true);
  };

  // Common button styling.
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
        <button
          onClick={handleDrop}
          disabled={isDropping}
          style={buttonStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          {isDropping ? "Dropping..." : "Drop Ball"}
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
          setCurrency(500);
          ballRef.current = { x: CANVAS_WIDTH / 2, y: 0, vx: 0, vy: 0 };
          setBall({ ...ballRef.current });
          setResult(null);
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default PlinkoGame;
