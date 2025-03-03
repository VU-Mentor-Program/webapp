import React, { useEffect, useRef, useState, useMemo } from "react";
import Confetti from "react-confetti";
import mpLogo from "../assets/mp_logo-CIRCLE.png";
import PauseButton from "../components/minigame page/PauseButton";
import RestartButton from "../components/minigame page/RestartButton";
import GameOverModal from "../components/minigame page/GameOverModal";
import { useTranslations } from "../contexts/TranslationContext";

// --- Import sound assets ---
import game_over from "../assets/game-over.mp3";
import sfx_powerup from "../assets/brickbreaker_sounds/sfx_powerup.mp3";
import sfx_extend from "../assets/brickbreaker_sounds/sfx_extend.mp3";
import sfx_shrink from "../assets/brickbreaker_sounds/sfx_shrink.mp3";
import sfx_speedup from "../assets/brickbreaker_sounds/sfx_speedup.mp3";
import sfx_speeddown from "../assets/brickbreaker_sounds/sfx_speeddown.mp3";
import sfx_multiball from "../assets/brickbreaker_sounds/sfx_multiball.mp3";

//
// Type definitions
//
interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  rotation: number;
}

interface Brick {
  x: number;
  y: number;
  destroyed: boolean;
  isPowerup: boolean;
}

interface Powerup {
  x: number;
  y: number;
  dy: number;
  type: string;
  color: string;
}

interface BrickSetup {
  brickCols: number;
  brickRows: number;
  brickWidth: number;
  brickHeight: number;
  padding: number;
  offsetLeft: number;
  offsetTop: number;
}

export const OnePersonPong: React.FC = () => {
  const t = useTranslations("minigames");

  // --- Global Mute State ---
  const [isMuted, setIsMuted] = useState(false);

  // --- Logical game dimensions ---
  const LOGICAL_WIDTH = 700;
  const LOGICAL_HEIGHT = 600;
  const ballRadius = 15;

  // --- Responsive Canvas ---
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 600 });
  useEffect(() => {
    function handleResize() {
      const maxWidth = Math.min(window.innerWidth * 0.9, LOGICAL_WIDTH);
      const scale = maxWidth / LOGICAL_WIDTH;
      const scaledHeight = LOGICAL_HEIGHT * scale;
      setCanvasSize({ width: maxWidth, height: scaledHeight });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Game state ---
  const [hasStarted, setHasStarted] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  function togglePause() {
    setIsPaused((prev) => !prev);
  }

  // --- Adjustable settings ---
  const [initialBallSpeed, setInitialBallSpeed] = useState(8);
  const [customBrickRows, setCustomBrickRows] = useState(4);
  const [customBrickCols, setCustomBrickCols] = useState(8);

  // --- Paddle state ---
  const [paddleX, setPaddleX] = useState(350);
  const paddleWidthDefault = 100;
  const [paddleWidth, setPaddleWidth] = useState(paddleWidthDefault);
  const paddleHeight = 20;
  const paddleY = 550;

  // --- Brick Setup ---
  function getBrickSetup(): BrickSetup {
    if (canvasSize.width < 500) {
      const brickWidth = 40;
      const brickHeight = 15;
      const padding = 20;
      const totalWidth = customBrickCols * brickWidth + (customBrickCols - 1) * padding;
      return {
        brickCols: customBrickCols,
        brickRows: customBrickRows,
        brickWidth,
        brickHeight,
        padding,
        offsetLeft: (LOGICAL_WIDTH - totalWidth) / 2,
        offsetTop: 40,
      };
    } else {
      const brickWidth = 60;
      const brickHeight = 20;
      const padding = 10;
      const totalWidth = customBrickCols * brickWidth + (customBrickCols - 1) * padding;
      return {
        brickCols: customBrickCols,
        brickRows: customBrickRows,
        brickWidth,
        brickHeight,
        padding,
        offsetLeft: (LOGICAL_WIDTH - totalWidth) / 2,
        offsetTop: 50,
      };
    }
  }
  const [brickSetup, setBrickSetup] = useState<BrickSetup>(getBrickSetup());

  // Generate bricks with a 10% chance to be a powerup brick.
  function generateBricks(setup: BrickSetup): Brick[] {
    const { brickCols, brickRows, brickWidth, brickHeight, padding, offsetLeft, offsetTop } = setup;
    const arr: Brick[] = [];
    for (let r = 0; r < brickRows; r++) {
      for (let c = 0; c < brickCols; c++) {
        arr.push({
          x: offsetLeft + c * (brickWidth + padding),
          y: offsetTop + r * (brickHeight + padding),
          destroyed: false,
          isPowerup: Math.random() < 0.1,
        });
      }
    }
    return arr;
  }
  const [bricks, setBricks] = useState<Brick[]>(generateBricks(brickSetup));

  // --- Ball state (as an array for multiball support) ---
  const initialBallX = LOGICAL_WIDTH / 2;
  const initialBallY =
    brickSetup.offsetTop +
    brickSetup.brickRows * (brickSetup.brickHeight + brickSetup.padding) +
    ballRadius +
    10;
  const [balls, setBalls] = useState<Ball[]>([
    { x: initialBallX, y: initialBallY, dx: initialBallSpeed, dy: -initialBallSpeed, rotation: 0 },
  ]);

  // --- Update brick setup and reset balls if settings change (and game not started) ---
  useEffect(() => {
    if (hasStarted) return;
    const newSetup = getBrickSetup();
    setBrickSetup(newSetup);
    setBricks(generateBricks(newSetup));
    setBalls([
      {
        x: LOGICAL_WIDTH / 2,
        y:
          newSetup.offsetTop +
          newSetup.brickRows * (newSetup.brickHeight + newSetup.padding) +
          ballRadius +
          10,
        dx: initialBallSpeed,
        dy: -initialBallSpeed,
        rotation: 0,
      },
    ]);
  }, [customBrickRows, customBrickCols, canvasSize, hasStarted, initialBallSpeed]);

  // --- Score and win/loss ---
  const [score, setScore] = useState(0);
  useEffect(() => {
    if (bricks.every((b) => b.destroyed)) {
      setHasWon(true);
    }
  }, [bricks]);

  // --- Logo image for the ball ---
  const logoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  // --- Create audio objects (using useMemo so they’re created only once) ---
  const gameOverSound = useMemo(() => {
    const audio = new Audio(game_over);
    audio.preload = "auto";
    return audio;
  }, []);
  const powerupSound = useMemo(() => {
    const audio = new Audio(sfx_powerup);
    audio.preload = "auto";
    return audio;
  }, []);
  const extendSound = useMemo(() => {
    const audio = new Audio(sfx_extend);
    audio.preload = "auto";
    return audio;
  }, []);
  const shrinkSound = useMemo(() => {
    const audio = new Audio(sfx_shrink);
    audio.preload = "auto";
    return audio;
  }, []);
  const speedupSound = useMemo(() => {
    const audio = new Audio(sfx_speedup);
    audio.preload = "auto";
    return audio;
  }, []);
  const speeddownSound = useMemo(() => {
    const audio = new Audio(sfx_speeddown);
    audio.preload = "auto";
    return audio;
  }, []);
  const multiballSound = useMemo(() => {
    const audio = new Audio(sfx_multiball);
    audio.preload = "auto";
    return audio;
  }, []);

  // --- Powerup state ---
  const [powerups, setPowerups] = useState<Powerup[]>([]);

  // --- Effect flags to prevent stacking ---
  const paddleEffectActiveRef = useRef<boolean>(false);
  const speedEffectActiveRef = useRef<boolean>(false);

  // --- Helper: clamp ---
  function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, val));
  }

  // --- Spawn a powerup from a brick ---
  function spawnPowerup(brick: Brick) {
    const types = ["extend", "shrink", "speed_up", "speed_down", "multiball"];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors: { [key: string]: string } = {
      extend: "green",
      shrink: "red",
      speed_up: "orange",
      speed_down: "blue",
      multiball: "purple",
    };
    setPowerups((prev) => [
      ...prev,
      {
        x: brick.x + brickSetup.brickWidth / 2,
        y: brick.y,
        dy: 2,
        type,
        color: colors[type],
      },
    ]);
  }

  // --- (Removed bounce-tone code) ---
  // The bounce sound function has been removed.

  // --- Apply powerup effect when the paddle collects it ---
  function applyPowerup(p: Powerup) {
    if (!isMuted) {
      powerupSound.currentTime = 0;
      powerupSound.play();
    }
    switch (p.type) {
      case "extend":
        if (!paddleEffectActiveRef.current) {
          paddleEffectActiveRef.current = true;
          // Increase paddle width noticeably
          setPaddleWidth(paddleWidthDefault + 50);
          if (!isMuted) {
            extendSound.currentTime = 0;
            extendSound.play();
          }
          setTimeout(() => {
            setPaddleWidth(paddleWidthDefault);
            paddleEffectActiveRef.current = false;
          }, 10000);
        }
        break;
      case "shrink":
        if (!paddleEffectActiveRef.current) {
          paddleEffectActiveRef.current = true;
          // Decrease paddle width noticeably
          setPaddleWidth(Math.max(50, paddleWidthDefault - 30));
          if (!isMuted) {
            shrinkSound.currentTime = 0;
            shrinkSound.play();
          }
          setTimeout(() => {
            setPaddleWidth(paddleWidthDefault);
            paddleEffectActiveRef.current = false;
          }, 10000);
        }
        break;
      case "speed_up":
        if (!speedEffectActiveRef.current) {
          speedEffectActiveRef.current = true;
          setBalls((prev) =>
            prev.map((ball) => ({ ...ball, dx: ball.dx * 1.5, dy: ball.dy * 1.5 }))
          );
          if (!isMuted) {
            speedupSound.currentTime = 0;
            speedupSound.play();
          }
          setTimeout(() => {
            setBalls((prev) =>
              prev.map((ball) => ({ ...ball, dx: ball.dx / 1.5, dy: ball.dy / 1.5 }))
            );
            speedEffectActiveRef.current = false;
          }, 10000);
        }
        break;
      case "speed_down":
        if (!speedEffectActiveRef.current) {
          speedEffectActiveRef.current = true;
          setBalls((prev) =>
            prev.map((ball) => ({ ...ball, dx: ball.dx * 0.7, dy: ball.dy * 0.7 }))
          );
          if (!isMuted) {
            speeddownSound.currentTime = 0;
            speeddownSound.play();
          }
          setTimeout(() => {
            setBalls((prev) =>
              prev.map((ball) => ({ ...ball, dx: ball.dx / 0.7, dy: ball.dy / 0.7 }))
            );
            speedEffectActiveRef.current = false;
          }, 10000);
        }
        break;
      case "multiball":
        if (!isMuted) {
          multiballSound.currentTime = 0;
          multiballSound.play();
        }
        // Spawn one extra ball (up to a max of 3 balls)
        setBalls((prev) => {
          if (prev.length < 3) {
            const extra = { ...prev[0] };
            extra.x += 10;
            extra.dx = -extra.dx;
            extra.rotation = 0;
            return [...prev, extra];
          }
          return prev;
        });
        break;
      default:
        break;
    }
  }

  // --- Main game update loop ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let animationFrameId: number;
    function render() {
      if (!isPaused) {
        updateGame();
      }
      drawAll();
      animationFrameId = requestAnimationFrame(render);
    }
    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, hasStarted, hasWon, hasLost, balls, bricks, powerups, paddleX, paddleWidth, canvasSize]);

  function updateGame() {
    if (!hasStarted || hasWon || hasLost) return;

    // --- Update each ball ---
    setBalls((prevBalls) =>
      prevBalls.map((ball) => {
        let { x, y, dx, dy, rotation } = ball;
        let bounced = false;
        x += dx;
        y += dy;
        rotation += 2;

        // --- Wall collisions ---
        if (x + dx < ballRadius) {
          dx = Math.abs(dx);
          bounced = true;
        } else if (x + dx > LOGICAL_WIDTH - ballRadius) {
          dx = -Math.abs(dx);
          bounced = true;
        }
        if (y + dy < ballRadius) {
          dy = Math.abs(dy);
          bounced = true;
        }

        // --- Paddle collision ---
        if (dy > 0 && y + dy >= paddleY - ballRadius) {
          if (x >= paddleX - paddleWidth / 2 && x <= paddleX + paddleWidth / 2) {
            dy = -Math.abs(dy);
            const offset = (x - paddleX) / (paddleWidth / 2);
            dx += offset * 1.5;
            y = paddleY - ballRadius;
            bounced = true;
          }
        }

        // --- Brick collisions for this ball ---
        let brickHit = false;
        const newBricks = bricks.map((br) => {
          if (!br.destroyed) {
            const rx = br.x;
            const ry = br.y;
            const rw = brickSetup.brickWidth;
            const rh = brickSetup.brickHeight;
            const closestX = clamp(x, rx, rx + rw);
            const closestY = clamp(y, ry, ry + rh);
            const distX = x - closestX;
            const distY = y - closestY;
            if (distX * distX + distY * distY < ballRadius * ballRadius) {
              brickHit = true;
              if (br.isPowerup) spawnPowerup(br);
              return { ...br, destroyed: true };
            }
          }
          return br;
        });
        if (brickHit) {
          setScore((prev) => prev + Math.round(10 * initialBallSpeed));
          setBricks(newBricks);
          dy = -dy;
          bounced = true;
        }

        // (Bounce sound removed)

        return { x, y, dx, dy, rotation };
      })
    );

    // --- Remove balls that fall below the screen ---
    setBalls((prevBalls) => {
      const remaining = prevBalls.filter((ball) => ball.y <= LOGICAL_HEIGHT - ballRadius);
      if (remaining.length === 0) {
        setHasLost(true);
        if (!isMuted) {
          gameOverSound.currentTime = 0;
          gameOverSound.play();
        }
      }
      return remaining;
    });

    // --- Update falling powerups ---
    setPowerups((prev) =>
      prev.reduce((acc, p) => {
        const newP = { ...p, y: p.y + p.dy };
        if (newP.y + 10 >= paddleY && newP.x >= paddleX - paddleWidth / 2 && newP.x <= paddleX + paddleWidth / 2) {
          applyPowerup(newP);
          return acc;
        }
        if (newP.y < LOGICAL_HEIGHT) {
          acc.push(newP);
        }
        return acc;
      }, [] as Powerup[])
    );
  }

  // --- Drawing function ---
  function drawAll() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;

    // --- Draw background gradient ---
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#1a2a6c");
    gradient.addColorStop(0.5, "#b21f1f");
    gradient.addColorStop(1, "#fdbb2d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- Draw bricks ---
    for (const b of bricks) {
      if (!b.destroyed) {
        ctx.fillStyle = b.isPowerup ? "gold" : "lightblue";
        ctx.fillRect(b.x * scaleX, b.y * scaleY, brickSetup.brickWidth * scaleX, brickSetup.brickHeight * scaleY);
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x * scaleX, b.y * scaleY, brickSetup.brickWidth * scaleX, brickSetup.brickHeight * scaleY);
      }
    }

    // --- Draw paddle ---
    ctx.fillStyle = "darkblue";
    ctx.fillRect((paddleX - paddleWidth / 2) * scaleX, paddleY * scaleY, paddleWidth * scaleX, paddleHeight * scaleY);

    // --- Draw balls ---
    const logo = logoRef.current;
    balls.forEach((ball) => {
      if (logo && logo.complete) {
        ctx.save();
        ctx.translate(ball.x * scaleX, ball.y * scaleY);
        ctx.rotate((ball.rotation * Math.PI) / 180);
        const sizeX = ballRadius * 2 * scaleX;
        const sizeY = ballRadius * 2 * scaleY;
        ctx.drawImage(logo, -sizeX / 2, -sizeY / 2, sizeX, sizeY);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.fillStyle = "orange";
        ctx.arc(ball.x * scaleX, ball.y * scaleY, ballRadius * Math.min(scaleX, scaleY), 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      }
    });

    // --- Draw powerups ---
    powerups.forEach((p) => {
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.arc(p.x * scaleX, p.y * scaleY, 10 * Math.min(scaleX, scaleY), 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    });

    // --- Draw score and messages ---
    ctx.fillStyle = "white";
    ctx.font = `${24 * scaleX}px Arial`;
    ctx.fillText(`Score: ${score}`, 20 * scaleX, 30 * scaleY);
    if (hasWon) {
      const winMsg = "YOU WIN!!!";
      const textWidth = ctx.measureText(winMsg).width;
      ctx.fillText(winMsg, (canvas.width - textWidth) / 2, canvas.height / 2);
    } else if (hasLost) {
      const loseMsg = "GAME OVER";
      const textWidth = ctx.measureText(loseMsg).width;
      ctx.fillText(loseMsg, (canvas.width - textWidth) / 2, canvas.height / 2);
    }

    // --- Draw start overlay ---
    if (!hasStarted && !hasWon && !hasLost) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = `${30 * scaleX}px Arial`;
      const message = "Click to Start";
      const textWidth = ctx.measureText(message).width;
      ctx.fillText(message, (canvas.width - textWidth) / 2, canvas.height / 2);
    }
  }

  // --- Restart the game ---
  function restartGame() {
    setHasWon(false);
    setHasLost(false);
    setScore(0);
    const newSetup = getBrickSetup();
    setBrickSetup(newSetup);
    setBricks(generateBricks(newSetup));
    setPaddleX(350);
    setPaddleWidth(paddleWidthDefault);
    setBalls([
      {
        x: LOGICAL_WIDTH / 2,
        y:
          newSetup.offsetTop +
          newSetup.brickRows * (newSetup.brickHeight + newSetup.padding) +
          ballRadius +
          10,
        dx: initialBallSpeed,
        dy: -initialBallSpeed,
        rotation: 0,
      },
    ]);
    setPowerups([]);
    setHasStarted(false);
  }

  // --- Handle pointer movement for the paddle ---
  function handlePointerMove(e: React.MouseEvent | React.TouchEvent) {
    if ("touches" in e) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const scaleX = LOGICAL_WIDTH / rect.width;
    const xPosLogical = (clientX - rect.left) * scaleX;
    const half = paddleWidth / 2;
    const minX = half;
    const maxX = LOGICAL_WIDTH - half;
    setPaddleX(Math.min(Math.max(xPosLogical, minX), maxX));
  }

  function handleStart() {
    if (!hasStarted) setHasStarted(true);
  }

  // --- Render powerup legend above the canvas ---
  const powerupMapping = {
    extend: { label: "Extend", color: "green" },
    shrink: { label: "Shrink", color: "red" },
    speed_up: { label: "Speed Up", color: "orange" },
    speed_down: { label: "Speed Down", color: "blue" },
    multiball: { label: "Multiball", color: "purple" },
  };

  return (
    <div style={{ textAlign: "center", marginTop: "1rem", color: "white" }}>
      <h2>{t("brickBreaker_title")}</h2>
      
      {/* Global Mute Button (outside the game) */}
      <button onClick={() => setIsMuted(!isMuted)} style={{ marginBottom: "1rem" }}>
        {isMuted ? "Unmute" : "Mute"}
      </button>

      {/* Display powerup types and colors */}
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        {Object.keys(powerupMapping).map((key) => (
          <div key={key} style={{ color: powerupMapping[key as keyof typeof powerupMapping].color }}>
            {powerupMapping[key as keyof typeof powerupMapping].label}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ marginRight: "1rem" }}>Initial Ball Speed: {initialBallSpeed}</label>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={initialBallSpeed}
            onChange={(e) => setInitialBallSpeed(Number(e.target.value))}
          />
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ marginRight: "1rem" }}>Brick Rows: {customBrickRows}</label>
          <input
            type="range"
            min="1"
            max="15"
            step="1"
            value={customBrickRows}
            onChange={(e) => setCustomBrickRows(Number(e.target.value))}
          />
        </div>
        <div>
          <label style={{ marginRight: "1rem" }}>Brick Columns: {customBrickCols}</label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={customBrickCols}
            onChange={(e) => setCustomBrickCols(Number(e.target.value))}
          />
        </div>
      </div>

      <p style={{ fontSize: "1.2rem" }}>Score: {score}</p>
      {hasWon && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={500}
          recycle={false}
        />
      )}

      <GameOverModal
        isOpen={hasWon || hasLost}
        score={score}
        gameName={"brickBreaker"}
        onClose={restartGame}
        onRestart={restartGame}
      />

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          background: "#333",
          border: "2px solid #fff",
          touchAction: "none",
        }}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        onClick={handleStart}
        onTouchStart={handleStart}
      />

      <p>{t("brickBreaker_instruction")}</p>
      <PauseButton isPaused={isPaused} onTogglePause={togglePause} />
      <RestartButton onRestart={restartGame} />
    </div>
  );
};

export default OnePersonPong;
