import React, { useEffect, useRef, useState } from "react";
import mpLogo from "../assets/mp_logo-CIRCLE.png";

// ---------- Types ----------
interface Bullet {
  x: number;
  y: number;
}
interface Enemy {
  x: number;
  y: number;
}
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number; // used for fade-out
}

// ---------- Component ----------
export const LogoSpaceShooterGame: React.FC = () => {
  // Logical "game world" dimensions
  const LOGICAL_WIDTH = 400;
  const LOGICAL_HEIGHT = 600;

  // Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT });

  // For UI
  // const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Load the ship/logo
  const logoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  // ------------ Refs to store "live" game data ------------
  // We'll store everything in here to avoid stale closures:
  const gameRef = useRef({
    // Player
    shipX: 200,
    shipY: 550,
    shipSize: 40,

    // Entities
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    particles: [] as Particle[],

    // Speed ramp
    speedFactor: 2, // you had speedFactor: 2

    // For timing/spawning
    frameCount: 0,
  });

  // ----------- Setup responsive canvas -----------
  useEffect(() => {
    function handleResize() {
      const maxWidth = Math.min(window.innerWidth * 0.9, LOGICAL_WIDTH);
      const scale = maxWidth / LOGICAL_WIDTH;
      setCanvasSize({
        width: maxWidth,
        height: LOGICAL_HEIGHT * scale,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize(); // initial
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ----------- Keyboard & pointer controls -----------
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      const st = gameRef.current;
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        st.shipX = Math.max(0, st.shipX - 10);
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        st.shipX = Math.min(LOGICAL_WIDTH - st.shipSize, st.shipX + 10);
      } else if (e.key === " " || e.key.toLowerCase() === "w") {
        shoot();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver]);

  // Pointer => move ship
  function handlePointerMove(e: React.MouseEvent | React.TouchEvent) {
    if (gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const scale = LOGICAL_WIDTH / rect.width;
    const st = gameRef.current;
    st.shipX = clientX - rect.left;
    st.shipX = st.shipX * scale - st.shipSize / 2;
    // clamp
    st.shipX = Math.max(0, Math.min(LOGICAL_WIDTH - st.shipSize, st.shipX));
  }

  // Click => shoot
  function handleCanvasClick() {
    shoot();
  }

  // ------------- Main Loop -------------
  useEffect(() => {
    let animId = 0;

    const loop = () => {
      updateGame();
      drawGame();
      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => cancelAnimationFrame(animId);
    // no dependency array => run once
  }, []);

  // ------------- updateGame() -------------
  function updateGame() {
    if (gameOver) return;

    const st = gameRef.current;

    // Speed ramp
    st.speedFactor += 0.001;

    // Move bullets
    st.bullets = st.bullets
      .map((b) => ({
        x: b.x,
        y: b.y - 8 * st.speedFactor,
      }))
      .filter((b) => b.y > -20);

    // Spawn enemies
    st.frameCount++;
    if (st.frameCount % 60 === 0) {
      st.enemies.push({
        x: Math.random() * (LOGICAL_WIDTH - 30),
        y: -30,
      });
    }

    // Move enemies
    st.enemies = st.enemies
      .map((e) => ({
        x: e.x,
        y: e.y + 3 * st.speedFactor,
      }))
      .filter((e) => e.y < LOGICAL_HEIGHT + 30);

    // Update particles (explosions)
    st.particles = st.particles
      .map((p) => {
        const nx = p.x + p.vx;
        const ny = p.y + p.vy;
        const nvx = p.vx * 0.98;
        const nvy = p.vy + 0.2; // slight gravity
        const life = p.life - 1;
        return { ...p, x: nx, y: ny, vx: nvx, vy: nvy, life };
      })
      .filter((p) => p.life > 0);

    // Collisions: bullets vs enemies
    for (let i = st.enemies.length - 1; i >= 0; i--) {
      const e = st.enemies[i];
      for (let j = st.bullets.length - 1; j >= 0; j--) {
        const b = st.bullets[j];
        if (checkCollide(e, b, 30, 30)) {
          // remove enemy & bullet
          st.enemies.splice(i, 1);
          st.bullets.splice(j, 1);
          // add 10 points to score
          // setScore((prev) => prev + 10);
          // trigger explosion
          createExplosion(e.x + 15, e.y + 15);
          break;
        }
      }
    }

    // Collisions: enemies vs player or bottom
    for (let i = 0; i < st.enemies.length; i++) {
      const e = st.enemies[i];
      // if enemy hits ship
      if (checkCollide(e, { x: st.shipX, y: st.shipY }, 30, st.shipSize)) {
        setGameOver(true);
        return;
      }
      // if enemy hits bottom => immediate game over
      if (e.y >= LOGICAL_HEIGHT - 30) {
        setGameOver(true);
        return;
      }
    }
  }

  // ------------- drawGame() -------------
  function drawGame() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;
    ctx.save();
    ctx.scale(scaleX, scaleY);

    const st = gameRef.current;
    // Draw ship
    if (logoRef.current) {
      ctx.drawImage(logoRef.current, st.shipX, st.shipY, st.shipSize, st.shipSize);
    } else {
      ctx.fillStyle = "yellow";
      ctx.fillRect(st.shipX, st.shipY, st.shipSize, st.shipSize);
    }

    // Draw bullets
    ctx.fillStyle = "cyan";
    for (const b of st.bullets) {
      ctx.fillRect(b.x, b.y, 5, 10);
    }

    // Draw enemies
    ctx.fillStyle = "red";
    for (const e of st.enemies) {
      ctx.fillRect(e.x, e.y, 30, 30);
    }

    // Draw particles (explosions)
    for (const p of st.particles) {
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = `rgba(255,165,0,${alpha.toFixed(2)})`;
      ctx.fillRect(p.x, p.y, 3, 3);
    }

    // UI
    // ctx.fillStyle = "white";
    // ctx.font = "20px Arial";
    // ctx.fillText(`Score: ${score}`, 10, 30);

    if (gameOver) {
      ctx.fillText("GAME OVER!", 100, 200);
    }

    ctx.restore();
  }

  // ------------- shoot() -------------
  function shoot() {
    if (gameOver) return;
    const st = gameRef.current;
    st.bullets.push({
      x: st.shipX + st.shipSize / 2 - 2,
      y: st.shipY,
    });
  }

  // ------------- checkCollide() -------------
  // a & b have { x, y }, plus we pass in their bounding box sizes
  function checkCollide(
    a: { x: number; y: number },
    b: { x: number; y: number },
    sizeA: number,
    sizeB: number
  ) {
    return !(
      a.x + sizeA < b.x ||
      a.x > b.x + sizeB ||
      a.y + sizeA < b.y ||
      a.y > b.y + sizeB
    );
  }

  // ------------- createExplosion() -------------
  function createExplosion(x: number, y: number) {
    const st = gameRef.current;
    const count = 20;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const life = Math.floor(Math.random() * 30) + 30; // 30-60 frames
      st.particles.push({
        x,
        y,
        vx,
        vy,
        life,
        maxLife: life,
      });
    }
  }

  // ------------- restart() -------------
  function restart() {
    setGameOver(false);
    // setScore(0);
    gameRef.current = {
      shipX: 200,
      shipY: 550,
      shipSize: 40,
      bullets: [],
      enemies: [],
      particles: [],
      speedFactor: 2, // keep same initial speed factor as above
      frameCount: 0,
    };
  }

  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h3>Logo Space Shooter</h3>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ background: "#000" }}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        onClick={handleCanvasClick}
      />
      <p style={{ fontSize: "0.9rem" }}>
        Move with mouse/finger. Click or press Space to shoot.
      </p>
      {gameOver && (
        <button onClick={restart} style={{ marginTop: "1rem" }}>
          Restart
        </button>
      )}
    </div>
  );
};
