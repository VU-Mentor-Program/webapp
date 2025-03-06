// PlinkoGame.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import mpLogoCircle from "../assets/mp_logo-CIRCLE.png";
import GameOverModal from "../components/minigame page/GameOverModal";
import MuteButton from "../components/minigame page/MuteButton";
import { useTranslations } from "../contexts/TranslationContext";

import beep from "../assets/plinko_sounds/beep.mp3";
import drop from "../assets/plinko_sounds/drop.mp3";
import ping from "../assets/plinko_sounds/ping.mp3";
import ping2 from "../assets/plinko_sounds/ping2.mp3";
import stop from "../assets/plinko_sounds/stop.mp3";

interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bet: number;
}

interface HistoryItem {
  id: number;
  payout: number;
  color: string;
}

const PlinkoGame: React.FC = () => {
  const t = useTranslations("minigames");

  const CANVAS_WIDTH = 350;
  const CANVAS_HEIGHT = 600;
  const ballRadius = 10;
  const pegRadius = 5;

  // Sound refs.
  const beepSoundRef = useRef(new Audio(beep));
  const dropSoundRef = useRef(new Audio(drop));
  const pingSoundRef = useRef(new Audio(ping));
  const ping2SoundRef = useRef(new Audio(ping2));
  const stopSoundRef = useRef(new Audio(stop));

  // Preloaded multiplier sounds (mapping: 0.2 => beep, 1 => ping, 2 => ping2, 4 => stop).
  const multiplierSounds: HTMLAudioElement[] = [
    stopSoundRef.current,
    pingSoundRef.current,
    ping2SoundRef.current,
    beepSoundRef.current,
  ];

  // Colors for each landing slot.
  const multiplierColors = [
    "#00FF7F",
    "#FFFF00",
    "#FFA500",
    "#FF4500",
    "#FF4500",
    "#FFA500",
    "#FFFF00",
    "#00FF7F",
  ];

  // Game states.
  const [muted, setMuted] = useState(false);
  const [currency, setCurrency] = useState(10);
  const [bet, setBet] = useState(2);
  const [showModal, setShowModal] = useState(false);
  // Change history to store objects with payout and color.
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Store balls and animation frame.
  const ballsRef = useRef<BallState[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Peg configuration.
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

  // Landing slots configuration.
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
  const fixedDelta = 1 / 120; // fixed timestep.

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and draw background.
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
      ctx.fillStyle = multiplierColors[i];
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("x" + slotMultipliers[i], i * slotWidth + slotWidth / 2, canvas.height - 10);
    }

    // Draw each ball.
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
  }, [ballImgLoaded, ballRadius, slotCount, slotMultipliers, pegRadius, multiplierColors]);

  const updatePhysicsForBall = useCallback(
    (ball: BallState, delta: number) => {
      ball.vy += gravity * delta;
      ball.x += ball.vx * delta;
      ball.y += ball.vy * delta;

      if (ball.x < ballRadius) {
        ball.x = ballRadius;
        ball.vx = Math.abs(ball.vx);
      } else if (ball.x > CANVAS_WIDTH - ballRadius) {
        ball.x = CANVAS_WIDTH - ballRadius;
        ball.vx = -Math.abs(ball.vx);
      }

      pegs.current.forEach((peg) => {
        const dx = ball.x - peg.x;
        const dy = ball.y - peg.y;
        const dist = Math.hypot(dx, dy);
        const minDist = ballRadius + pegRadius;
        if (dist < minDist) {
          const nx = dx / dist;
          const ny = dy / dist;
          ball.x = peg.x + nx * minDist;
          ball.y = peg.y + ny * minDist;
          const dot = ball.vx * nx + ball.vy * ny;
          let rvx = ball.vx - (1 + restitution) * dot * nx;
          let rvy = ball.vy - (1 + restitution) * dot * ny;
          const currentAngle = Math.atan2(rvy, rvx);
          const jitter = (Math.random() - 0.5) * jitterRange;
          const newAngle = currentAngle + jitter;
          const speed = Math.hypot(rvx, rvy);
          ball.vx = speed * Math.cos(newAngle);
          ball.vy = speed * Math.sin(newAngle);
        }
      });

      ball.vx *= damping;
      ball.vy *= damping;
    },
    [gravity, ballRadius, CANVAS_WIDTH, pegRadius, restitution, jitterRange, damping]
  );

  const animate = useCallback(
    (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }
      let dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      dt = Math.min(dt, 0.05);

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
          const slotWidth = CANVAS_WIDTH / slotCount;
          const slotIndex = Math.min(Math.floor(ball.x / slotWidth), slotCount - 1);
          const multiplier = slotMultipliers[slotIndex];
          // Round payout to nearest .01.
          const payout = Math.round((ball.bet * multiplier) * 100) / 100;
          setCurrency((prev) => Math.round((prev + payout) * 100) / 100);

          // Choose and play multiplier sound.
          let soundToPlay: HTMLAudioElement | null = null;
          if (multiplier === 4) {
            soundToPlay = multiplierSounds[3];
          } else if (multiplier === 2) {
            soundToPlay = multiplierSounds[2];
          } else if (multiplier === 1) {
            soundToPlay = multiplierSounds[1];
          } else if (multiplier === 0.2) {
            soundToPlay = multiplierSounds[0];
          }
          if (soundToPlay && !muted) {
            soundToPlay.currentTime = 0;
            soundToPlay.play();
          }

          // Update history with a new unique history item.
          setHistory((prev) => {
            const newItem: HistoryItem = {
              id: Date.now() + Math.random(),
              payout,
              color: multiplierColors[slotIndex],
            };
            // Keep only the last 5 items.
            return [newItem, ...prev].slice(0, 5);
          });
        } else {
          remainingBalls.push(ball);
        }
      }
      ballsRef.current = remainingBalls;
      drawCanvas();

      if (ballsRef.current.length > 0) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        animationFrameId.current = null;
      }
    },
    [
      CANVAS_HEIGHT,
      ballRadius,
      CANVAS_WIDTH,
      updatePhysicsForBall,
      drawCanvas,
      fixedDelta,
      slotCount,
      slotMultipliers,
      muted,
      multiplierSounds,
      multiplierColors,
    ]
  );

  const handleDrop = () => {
    if (bet > currency) return;
    setCurrency((prev) => Math.round((prev - bet) * 100) / 100);
    ballsRef.current.push({ x: CANVAS_WIDTH / 2, y: 0, vx: 0, vy: 0, bet });

    if (!muted) {
      dropSoundRef.current.currentTime = 0;
      dropSoundRef.current.play();
    }

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
      <style>
        {`
          .history-container {
            display: flex;
            justify-content: center;
            margin-top: 1rem;
          }
          .history-item {
            background: #333;
            padding: 0.5rem;
            margin: 0 0.5rem;
            border-radius: 4px;
            animation: fadeIn 0.5s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <MuteButton onToggle={(newMuted) => setMuted(newMuted)} />
      <h3>Plinko Ball</h3>
      <p>{t("currency")} {currency.toFixed(2)}</p>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          {t("bet_amount")}{" "}
          <input
            type="number"
            value={bet}
            min="1"
            max={currency}
            onChange={(e) => setBet(Number(e.target.value))}
            style={{
              marginLeft: "0.5rem",
              width: "80px",
              padding: "0.2rem",
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
          style={buttonStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          {t("drop_ball")}
        </button>
        <button
          onClick={() => setShowModal(true)}
          style={buttonStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          {t("submit_score")}
        </button>
      </div>
      <p>{t("history")}</p>
      <div className="history-container">
        {history.map((item) => (
          <div
            key={item.id}
            className="history-item"
            style={{ color: item.color }}
          >
            {item.payout.toFixed(2)}
          </div>
        ))}
      </div>
      <GameOverModal
        isOpen={showModal}
        score={currency}
        gameName={"plinko"}
        onClose={() => setShowModal(false)}
        onRestart={() => {
          setCurrency(10);
          ballsRef.current = [];
          setShowModal(false);
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
