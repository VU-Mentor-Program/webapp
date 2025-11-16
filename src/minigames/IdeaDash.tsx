import React, { useEffect, useRef, useState } from "react";
import GameOverModal from "../components/minigame page/GameOverModal";
import PauseButton from "../components/minigame page/PauseButton";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export const IdeaDashGame: React.FC = () => {
  const LOGICAL_WIDTH = 800;
  const LOGICAL_HEIGHT = 400;
  const GRAVITY = 0.6;
  const JUMP_FORCE = -14; // Increased from -12 for better jump height
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

  // Enhanced jump mechanics
  const coyoteTimeRef = useRef(0);
  const jumpBufferRef = useRef(0);

  // Game objects
  interface GameObject {
    x: number;
    y: number;
    type: "obstacle" | "idea" | "powerup";
    label?: string;
    rotation?: number; // For animations
  }
  const [objects, setObjects] = useState<GameObject[]>([]);

  const [powerUpActive, setPowerUpActive] = useState<string | null>(null);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  const [invincible, setInvincible] = useState(false);
  const [invincibleTimer, setInvincibleTimer] = useState(0);

  // Visual effects
  const [particles, setParticles] = useState<Particle[]>([]);
  const [screenShake, setScreenShake] = useState(0);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [bgHue, setBgHue] = useState(220); // Blue starting hue

  // Parallax layers
  const [cloudOffset, setCloudOffset] = useState(0);
  const [buildingOffset, setBuildingOffset] = useState(0);
  const [gridOffset, setGridOffset] = useState(0);

  const frameRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const lastPowerUpTimeRef = useRef(0);
  const animFrameRef = useRef(0);

  const obstacleEmojis = ["😰", "😱", "😤", "💀", "😵", "😨"];

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
  }, [gameOver, isPaused, hasStarted, playerY, playerVelY, objects, hearts, score, speed, ideasCollected, powerUpActive, particles, screenShake, flashColor, bgHue, invincible, invincibleTimer]);

  function updateGame(elapsedSeconds: number) {
    frameRef.current++;
    animFrameRef.current++;

    // Update timers
    if (coyoteTimeRef.current > 0) coyoteTimeRef.current--;
    if (jumpBufferRef.current > 0) jumpBufferRef.current--;
    if (screenShake > 0) setScreenShake(screenShake - 1);
    if (flashColor) {
      setTimeout(() => setFlashColor(null), 100);
    }

    // Invincibility timer
    if (invincible && invincibleTimer > 0) {
      setInvincibleTimer((t) => t - 0.016);
    } else if (invincibleTimer <= 0) {
      setInvincible(false);
    }

    // Update player physics
    let newVelY = playerVelY + GRAVITY;
    let newY = playerY + newVelY;

    const wasOnGround = playerY >= GROUND_Y;

    if (newY >= GROUND_Y) {
      newY = GROUND_Y;
      newVelY = 0;
      setIsJumping(false);
      coyoteTimeRef.current = 6; // 6 frames of coyote time (~100ms at 60fps)

      // Jump buffering - if player pressed jump recently, execute it now
      if (jumpBufferRef.current > 0) {
        newVelY = JUMP_FORCE;
        setIsJumping(true);
        jumpBufferRef.current = 0;
      }
    }

    if (wasOnGround && newY < GROUND_Y) {
      coyoteTimeRef.current = 0; // Left ground, no more coyote time
    }

    setPlayerY(newY);
    setPlayerVelY(newVelY);

    // Update parallax and passive score
    const speedFactor = Math.min(speed / 4, 2.5);
    setCloudOffset((o) => (o - 0.5 * speedFactor) % LOGICAL_WIDTH);
    setBuildingOffset((o) => (o - 1 * speedFactor) % LOGICAL_WIDTH);
    setGridOffset((o) => (o - speed) % 50);

    // Update background hue based on speed
    const targetHue = 220 - (speedFactor - 1) * 60; // Blue -> Purple -> Red
    setBgHue((h) => h + (targetHue - h) * 0.05);

    // Passive score increase based on speed (faster = more points)
    setScore((s) => s + speedFactor * 0.01);

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
            label: obstacleEmojis[Math.floor(Math.random() * obstacleEmojis.length)],
            rotation: 0,
          },
        ]);
      } else if (rand < 0.8) {
        // Spawn idea (lightbulb) - FIXED: now always reachable
        const yPos = GROUND_Y - Math.random() * 80 - 30; // Between 30-110 pixels high
        setObjects((o) => [
          ...o,
          {
            x: LOGICAL_WIDTH,
            y: yPos,
            type: "idea",
            rotation: 0,
          },
        ]);
      }
    }

    // Spawn power-up every 10 seconds - FIXED: now reachable
    if (elapsedSeconds - lastPowerUpTimeRef.current > 10) {
      lastPowerUpTimeRef.current = elapsedSeconds;
      setObjects((o) => [
        ...o,
        {
          x: LOGICAL_WIDTH,
          y: GROUND_Y - 80, // Was 100, now 80 (reachable)
          type: "powerup",
          rotation: 0,
        },
      ]);
    }

    // Update object rotations for animation
    setObjects((obs) =>
      obs.map((o) => ({
        ...o,
        rotation: (o.rotation || 0) + (o.type === "powerup" ? 0.1 : o.type === "idea" ? 0.05 : 0),
      }))
    );

    // Move objects with speed cap
    const cappedSpeed = Math.min(speed, 4 * 2.5); // Cap at 2.5x base speed
    setObjects((obs) =>
      obs
        .map((o) => ({ ...o, x: o.x - cappedSpeed }))
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
          if (powerUpActive !== "shield" && !invincible) {
            setHearts((h) => {
              const newHearts = h - 1;
              if (newHearts <= 0) {
                endGame();
              }
              return newHearts;
            });
            // Visual feedback
            setScreenShake(10);
            setFlashColor("rgba(255, 0, 0, 0.3)");
            createParticleBurst(obj.x, obj.y, "#e94560", 15);

            // Grant invincibility for 2 seconds after taking damage
            setInvincible(true);
            setInvincibleTimer(2);
          } else {
            createParticleBurst(obj.x, obj.y, "#00ff00", 10);
          }
          setObjects((o) => o.filter((item) => item !== obj));
        } else if (obj.type === "idea") {
          setScore((s) => s + 1);
          setIdeasCollected((i) => {
            const newIdeas = i + 1;
            if (newIdeas % 5 === 0) {
              setSpeed((s) => Math.min(s * 1.1, 4 * 2.5)); // Cap speed
              setFlashColor("rgba(255, 215, 0, 0.2)");
            }
            return newIdeas;
          });
          // Visual feedback
          createParticleBurst(obj.x, obj.y, "#ffd700", 12);
          setObjects((o) => o.filter((item) => item !== obj));
        } else if (obj.type === "powerup") {
          const powerups = ["shield", "magnet", "slowmo"];
          const randomPowerup = powerups[Math.floor(Math.random() * powerups.length)];
          setPowerUpActive(randomPowerup);
          setPowerUpTimer(5);
          setFlashColor("rgba(0, 212, 255, 0.3)");
          createParticleBurst(obj.x, obj.y, "#00d4ff", 20);
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

    // Update particles
    setParticles((p) =>
      p
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.2, // Gravity for particles
          life: particle.life - 1,
        }))
        .filter((particle) => particle.life > 0)
    );
  }

  function createParticleBurst(x: number, y: number, color: string, count: number) {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 20,
        color,
      });
    }
    setParticles((p) => [...p, ...newParticles]);
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

    // Apply screen shake
    if (screenShake > 0) {
      ctx.save();
      ctx.translate(
        (Math.random() - 0.5) * screenShake,
        (Math.random() - 0.5) * screenShake
      );
    }

    // Background - Dynamic gradient based on speed
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `hsl(${bgHue}, 40%, 15%)`);
    gradient.addColorStop(1, `hsl(${bgHue - 20}, 40%, 10%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Parallax Layer 1: Distant buildings
    ctx.fillStyle = `hsla(${bgHue}, 30%, 20%, 0.3)`;
    for (let i = -1; i < 4; i++) {
      const x = (i * 250 + buildingOffset) * scaleX;
      const heights = [60, 80, 70, 90];
      const h = heights[i % heights.length];
      ctx.fillRect(x, (GROUND_Y - h) * scaleY, 200 * scaleX, h * scaleY);
    }

    // Parallax Layer 2: Clouds
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    for (let i = -1; i < 6; i++) {
      const x = (i * 150 + cloudOffset) * scaleX;
      const y = (50 + Math.sin(i) * 30) * scaleY;
      ctx.beginPath();
      ctx.ellipse(x, y, 40 * scaleX, 20 * scaleY, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground with perspective grid
    ctx.fillStyle = `hsl(${bgHue - 40}, 50%, 15%)`;
    ctx.fillRect(0, GROUND_Y * scaleY, canvas.width, canvas.height - GROUND_Y * scaleY);

    // Grid lines
    ctx.strokeStyle = `hsla(${bgHue}, 50%, 30%, 0.3)`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const x = ((i * 50 + gridOffset) * scaleX) % (canvas.width + 50 * scaleX);
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y * scaleY);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw objects
    objects.forEach((obj) => {
      if (obj.type === "obstacle") {
        // Styled thought bubble obstacle
        const x = obj.x * scaleX;
        const y = obj.y * scaleY;
        const w = 40 * scaleX;
        const h = 40 * scaleY;

        // Shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(x + 5 * scaleX, y + 5 * scaleY, w, h);

        // Gradient bubble
        const obsGradient = ctx.createRadialGradient(
          x + w / 2,
          y + h / 2,
          0,
          x + w / 2,
          y + h / 2,
          w
        );
        obsGradient.addColorStop(0, "#e94560");
        obsGradient.addColorStop(1, "#7a1f3d");
        ctx.fillStyle = obsGradient;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 10 * scaleX);
        ctx.fill();

        // Glow
        ctx.strokeStyle = "rgba(233, 69, 96, 0.5)";
        ctx.lineWidth = 3 * scaleX;
        ctx.stroke();

        // Emoji inside
        ctx.font = `${28 * Math.min(scaleX, scaleY)}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(obj.label || "😰", x + w / 2, y + h / 2 + 10 * scaleY);
        ctx.textAlign = "left";

      } else if (obj.type === "idea") {
        // Enhanced lightbulb with glow and rotation
        const x = obj.x * scaleX;
        const y = obj.y * scaleY;
        const pulse = Math.sin(animFrameRef.current * 0.1) * 0.2 + 1;

        // Outer glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 25 * scaleX * pulse);
        glowGradient.addColorStop(0, "rgba(255, 215, 0, 0.8)");
        glowGradient.addColorStop(1, "rgba(255, 215, 0, 0)");
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, 25 * scaleX * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Lightbulb circle
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(x, y, 15 * scaleX, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.arc(x - 5 * scaleX, y - 5 * scaleY, 5 * scaleX, 0, Math.PI * 2);
        ctx.fill();

        // Emoji
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((obj.rotation || 0) * 0.3);
        ctx.font = `${20 * Math.min(scaleX, scaleY)}px Arial`;
        ctx.fillText("💡", -10 * scaleX, 10 * scaleY);
        ctx.restore();

      } else if (obj.type === "powerup") {
        // Rotating power-up with electric effect
        const x = obj.x * scaleX;
        const y = obj.y * scaleY;

        // Electric particles
        for (let i = 0; i < 3; i++) {
          const angle = (obj.rotation || 0) + (i * Math.PI * 2) / 3;
          const px = x + Math.cos(angle) * 25 * scaleX;
          const py = y + Math.sin(angle) * 25 * scaleY;
          ctx.fillStyle = "rgba(0, 212, 255, 0.5)";
          ctx.beginPath();
          ctx.arc(px, py, 3 * scaleX, 0, Math.PI * 2);
          ctx.fill();
        }

        // Power-up circle
        ctx.fillStyle = "#00d4ff";
        ctx.beginPath();
        ctx.arc(x, y, 17.5 * scaleX, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        ctx.strokeStyle = "rgba(0, 212, 255, 0.8)";
        ctx.lineWidth = 3 * scaleX;
        ctx.stroke();

        // Rotating emoji
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(obj.rotation || 0);
        ctx.font = `${20 * Math.min(scaleX, scaleY)}px Arial`;
        ctx.fillText("⚡", -10 * scaleX, 10 * scaleY);
        ctx.restore();
      }
    });

    // Draw particles
    particles.forEach((particle) => {
      const alpha = particle.life / 50;
      ctx.fillStyle = particle.color.replace(")", `, ${alpha})`).replace("rgb", "rgba");
      ctx.beginPath();
      ctx.arc(particle.x * scaleX, particle.y * scaleY, 3 * scaleX, 0, Math.PI * 2);
      ctx.fill();
    });

    // Player with running animation
    const runCycle = Math.floor(animFrameRef.current / 10) % 3;
    const tilt = isJumping ? -0.2 : Math.sin(runCycle * Math.PI) * 0.1;

    ctx.save();
    ctx.translate(50 * scaleX + PLAYER_SIZE * scaleX / 2, playerY * scaleY + PLAYER_SIZE * scaleY / 2);
    ctx.rotate(tilt);

    // Shield effect
    if (powerUpActive === "shield") {
      const shieldGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 30 * scaleX);
      shieldGradient.addColorStop(0, "rgba(0, 255, 0, 0.3)");
      shieldGradient.addColorStop(1, "rgba(0, 255, 0, 0)");
      ctx.fillStyle = shieldGradient;
      ctx.beginPath();
      ctx.arc(0, 0, 30 * scaleX, 0, Math.PI * 2);
      ctx.fill();
    }

    // Invincibility blink effect
    const blinkVisible = !invincible || Math.floor(animFrameRef.current / 5) % 2 === 0;

    if (blinkVisible) {
      // Draw pixel art running human
      const pixelSize = 3 * scaleX;
      const px = -PLAYER_SIZE * scaleX / 2;
      const py = -PLAYER_SIZE * scaleY / 2;

      // Simple pixel art human (12x14 grid)
      const runFrame = Math.floor(animFrameRef.current / 8) % 2;

      // Head
      ctx.fillStyle = "#ffdbac";
      ctx.fillRect(px + pixelSize * 4, py + pixelSize * 1, pixelSize * 4, pixelSize * 4);

      // Eyes
      ctx.fillStyle = "#000";
      ctx.fillRect(px + pixelSize * 5, py + pixelSize * 2, pixelSize, pixelSize);
      ctx.fillRect(px + pixelSize * 7, py + pixelSize * 2, pixelSize, pixelSize);

      // Body
      ctx.fillStyle = "#53a8e2";
      ctx.fillRect(px + pixelSize * 3, py + pixelSize * 5, pixelSize * 6, pixelSize * 5);

      // Arms (animated)
      ctx.fillStyle = "#ffdbac";
      if (runFrame === 0 || isJumping) {
        // Left arm up, right arm down
        ctx.fillRect(px + pixelSize * 2, py + pixelSize * 5, pixelSize * 1, pixelSize * 3);
        ctx.fillRect(px + pixelSize * 9, py + pixelSize * 8, pixelSize * 1, pixelSize * 3);
      } else {
        // Right arm up, left arm down
        ctx.fillRect(px + pixelSize * 2, py + pixelSize * 8, pixelSize * 1, pixelSize * 3);
        ctx.fillRect(px + pixelSize * 9, py + pixelSize * 5, pixelSize * 1, pixelSize * 3);
      }

      // Legs (animated)
      ctx.fillStyle = "#2d5f8a";
      if (runFrame === 0 && !isJumping) {
        // Left leg forward, right leg back
        ctx.fillRect(px + pixelSize * 3, py + pixelSize * 10, pixelSize * 2, pixelSize * 4);
        ctx.fillRect(px + pixelSize * 7, py + pixelSize * 10, pixelSize * 2, pixelSize * 4);
      } else if (!isJumping) {
        // Right leg forward, left leg back
        ctx.fillRect(px + pixelSize * 4, py + pixelSize * 10, pixelSize * 2, pixelSize * 4);
        ctx.fillRect(px + pixelSize * 6, py + pixelSize * 10, pixelSize * 2, pixelSize * 4);
      } else {
        // Both legs together when jumping
        ctx.fillRect(px + pixelSize * 4, py + pixelSize * 10, pixelSize * 4, pixelSize * 4);
      }

      // Shoes
      ctx.fillStyle = "#000";
      ctx.fillRect(px + pixelSize * 3, py + pixelSize * 13, pixelSize * 2, pixelSize * 1);
      ctx.fillRect(px + pixelSize * 7, py + pixelSize * 13, pixelSize * 2, pixelSize * 1);
    }
    ctx.restore();

    // Speed lines effect when going fast
    if (speed > 6) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const y = Math.random() * canvas.height;
        const length = 20 + Math.random() * 40;
        ctx.beginPath();
        ctx.moveTo(canvas.width, y);
        ctx.lineTo(canvas.width - length * scaleX, y);
        ctx.stroke();
      }
    }

    // HUD with semi-transparent background
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(5, 5, 150 * scaleX, 135 * scaleY);

    ctx.fillStyle = "white";
    ctx.font = `bold ${18 * Math.min(scaleX, scaleY)}px Arial`;
    ctx.fillText(`💡 ${score}`, 10, 30 * scaleY);

    // Animated hearts
    for (let i = 0; i < 3; i++) {
      if (i < hearts) {
        const heartPulse = hearts === 1 ? Math.sin(animFrameRef.current * 0.2) * 0.2 + 1 : 1;
        ctx.font = `${(18 * heartPulse) * Math.min(scaleX, scaleY)}px Arial`;
        ctx.fillText("❤️", 10 + i * 25 * scaleX, 55 * scaleY);
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.font = `${18 * Math.min(scaleX, scaleY)}px Arial`;
        ctx.fillText("🖤", 10 + i * 25 * scaleX, 55 * scaleY);
        ctx.fillStyle = "white";
      }
    }

    ctx.font = `${18 * Math.min(scaleX, scaleY)}px Arial`;
    ctx.fillText(`🏆 ${highScore}`, 10, 80 * scaleY);
    ctx.fillText(`🔥 ${streak}`, 10, 105 * scaleY);

    if (powerUpActive) {
      const powerUpColor = powerUpActive === "shield" ? "#00ff00" : powerUpActive === "magnet" ? "#ff00ff" : "#00d4ff";
      ctx.fillStyle = powerUpColor;
      ctx.fillText(`⚡ ${powerUpActive.toUpperCase()}`, 10, 130 * scaleY);

      // Timer bar
      const barWidth = (powerUpTimer / 5) * 140 * scaleX;
      ctx.fillStyle = powerUpColor;
      ctx.fillRect(10, 135 * scaleY, barWidth, 5 * scaleY);
    }

    // Flash overlay
    if (flashColor) {
      ctx.fillStyle = flashColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (screenShake > 0) {
      ctx.restore();
    }

    // Start screen overlay
    if (!hasStarted && !gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "white";
      ctx.font = `bold ${40 * Math.min(scaleX, scaleY)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText("💡 IDEA DASH", canvas.width / 2, canvas.height / 2 - 60 * scaleY);

      ctx.font = `${22 * Math.min(scaleX, scaleY)}px Arial`;
      ctx.fillText("TAP or SPACE to Start", canvas.width / 2, canvas.height / 2 - 10 * scaleY);

      ctx.font = `${16 * Math.min(scaleX, scaleY)}px Arial`;
      ctx.fillStyle = "#ffd700";
      ctx.fillText("Collect 💡 ideas, dodge obstacles", canvas.width / 2, canvas.height / 2 + 30 * scaleY);

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = `${14 * Math.min(scaleX, scaleY)}px Arial`;
      ctx.fillText("Speed increases every 5 ideas!", canvas.width / 2, canvas.height / 2 + 60 * scaleY);

      ctx.textAlign = "left";
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
    setInvincible(false);
    setInvincibleTimer(0);
    setParticles([]);
    setScreenShake(0);
    setFlashColor(null);
    setBgHue(220);
    setCloudOffset(0);
    setBuildingOffset(0);
    setGridOffset(0);
    frameRef.current = 0;
    animFrameRef.current = 0;
    startTimeRef.current = null;
    lastPowerUpTimeRef.current = 0;
    coyoteTimeRef.current = 0;
    jumpBufferRef.current = 0;
    setHasStarted(false);
  }

  function handleJump() {
    if (gameOver || isPaused) return;

    // Start the game if not started
    if (!hasStarted) {
      setHasStarted(true);
      return;
    }

    // Jump with coyote time
    if (!isJumping && (playerY >= GROUND_Y || coyoteTimeRef.current > 0)) {
      setPlayerVelY(JUMP_FORCE);
      setIsJumping(true);
      coyoteTimeRef.current = 0;
    } else if (isJumping && playerY < GROUND_Y) {
      // Jump buffering - store the jump input
      jumpBufferRef.current = 6;
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
  }, [hasStarted, gameOver, isJumping, isPaused, playerY]);

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
          boxShadow: "0 4px 20px rgba(83, 168, 226, 0.3)",
        }}
      />

      <p style={{ marginTop: "10px", fontSize: "14px" }}>
        Press <strong>SPACE</strong> or <strong>TAP</strong> to jump • Collect ideas 💡 • Dodge obstacles!
      </p>

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
