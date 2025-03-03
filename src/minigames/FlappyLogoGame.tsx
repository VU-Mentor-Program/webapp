import React, { useEffect, useRef, useState } from "react";
import mpLogo from "../assets/mp_logo-CIRCLE.png";
import GameOverModal from "../components/minigame page/GameOverModal";
import PauseButton from "../components/minigame page/PauseButton";
import sfx_die from "../assets/flappy_sounds/sfx_die.mp3";
import sfx_hit from "../assets/flappy_sounds/sfx_hit.mp3";
import sfx_point from "../assets/flappy_sounds/sfx_point.mp3";
import sfx_swooshing from "../assets/flappy_sounds/sfx_swooshing.mp3";
import sfx_wing from "../assets/flappy_sounds/sfx_wing.mp3";

export const FlappyLogoGame: React.FC = () => {
  // ---------------- Constants ----------------
  const LOGICAL_WIDTH = 800;
  const LOGICAL_HEIGHT = 600;
  const FLOOR_Y = 540;
  const FLOOR_HEIGHT = 80;

  // Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Game states
  const [hasStarted, setHasStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Frame rate: 60 or 120
  const [frameRateMode, setFrameRateMode] = useState<60 | 120>(60);

  // Audio refs
  const wingSoundRef = useRef(new Audio(sfx_wing));
  const pointSoundRef = useRef(new Audio(sfx_point));
  const hitSoundRef = useRef(new Audio(sfx_hit));
  const dieSoundRef = useRef(new Audio(sfx_die));
  const swooshSoundRef = useRef(new Audio(sfx_swooshing));

  // Adjust volumes on mount
  useEffect(() => {
    wingSoundRef.current.volume = 0.5;
    pointSoundRef.current.volume = 0.5;
    hitSoundRef.current.volume = 0.5;
    dieSoundRef.current.volume = 0.5;
    swooshSoundRef.current.volume = 0.5;
  }, []);

  // ---------------- Gameplay parameters ----------------
  const birdSize = 40;
  const birdX = 100;
  const gravity = 0.15; // gentle gravity
  const pipeWidth = 50;
  const pipeSpeed = 2;
  const gapHeight = 140;

  // Bird, pipe, score
  const birdYRef = useRef(300);
  const birdVYRef = useRef(0);
  const pipeXRef = useRef(LOGICAL_WIDTH);
  const gapYRef = useRef(200);
  const rotationRef = useRef(0);
  const passedPipeRef = useRef(false);
  const scoreRef = useRef(0);

  // BG parallax
  const bgXRef = useRef(0);

  // Clouds
  interface Cloud {
    x: number;
    y: number;
    speed: number;
  }
  const cloudsRef = useRef<Cloud[]>([]);

  // Stars
  interface Star {
    x: number;
    y: number;
    offset: number;
  }
  const starsRef = useRef<Star[]>([]);

  // City silhouette segments (for a more interesting silhouette)
  interface CitySegment {
    xOffset: number;
    width: number;
    height: number;
  }
  const citySegmentsRef = useRef<CitySegment[]>([]);

  // Load the bird (logo) image
  const logoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  // On mount, create clouds, stars, city segments
  useEffect(() => {
    // Clouds
    const clouds: Cloud[] = [];
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: Math.random() * LOGICAL_WIDTH,
        y: 30 + Math.random() * 150,
        speed: 0.4 + Math.random() * 0.3,
      });
    }
    cloudsRef.current = clouds;

    // Flickering stars
    const stars: Star[] = [];
    for (let i = 0; i < 20; i++) {
      stars.push({
        x: Math.random() * LOGICAL_WIDTH,
        y: Math.random() * 150,
        offset: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;

    // City silhouette segments
    const segments: CitySegment[] = [];
    // We fill up ~8 segments across the screen
    let curX = 0;
    for (let i = 0; i < 8; i++) {
      const segWidth = 100 + Math.random() * 40; // random widths
      const segHeight = 80 + Math.random() * 60; // random heights
      segments.push({
        xOffset: curX,
        width: segWidth,
        height: segHeight,
      });
      curX += segWidth;
    }
    citySegmentsRef.current = segments;
  }, []);

  // Responsive resize
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

  // Start / Jump
  const handleCanvasClick = () => {
    if (!hasStarted) {
      setHasStarted(true);
      swooshSoundRef.current.currentTime = 0;
      swooshSoundRef.current.play();
    } else if (!gameOver) {
      wingSoundRef.current.currentTime = 0;
      wingSoundRef.current.play();
      birdVYRef.current = -5;
    }
  };

  // The main animation loop with delta-time
  const lastTimeRef = useRef<number>(0);
  useEffect(() => {
    let animId: number;
    const loop = (timestamp: number) => {
      if (!isPaused) {
        if (hasStarted && !gameOver) {
          const factor = frameRateMode === 120 ? 1 : 2;
          updateGame(timestamp, factor);
        }
        drawGame();
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [hasStarted, gameOver, isPaused, frameRateMode]);

  function updateGame(timestamp: number, factor: number) {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    lastTimeRef.current = timestamp;

    // Bird
    rotationRef.current += 1 * factor;
    birdYRef.current += birdVYRef.current * factor;
    birdVYRef.current += gravity * factor;

    // Pipe
    pipeXRef.current -= pipeSpeed * factor;
    if (pipeXRef.current < -pipeWidth) {
      pipeXRef.current = LOGICAL_WIDTH;
      gapYRef.current = Math.random() * 300 + 100;
      passedPipeRef.current = false;
    }

    // BG
    bgXRef.current -= 1 * factor;
    if (bgXRef.current < -LOGICAL_WIDTH) {
      bgXRef.current += LOGICAL_WIDTH;
    }

    // Clouds
    cloudsRef.current.forEach((cloud) => {
      cloud.x -= cloud.speed * factor;
      if (cloud.x < -120) {
        cloud.x = LOGICAL_WIDTH + Math.random() * 100;
        cloud.y = 30 + Math.random() * 150;
      }
    });

    // Score
    if (!passedPipeRef.current && pipeXRef.current + pipeWidth < birdX) {
      scoreRef.current += 100;
      setScore(scoreRef.current);
      passedPipeRef.current = true;
      pointSoundRef.current.currentTime = 0;
      pointSoundRef.current.play();
    }

    checkCollision();
  }

  function checkCollision() {
    const birdTop = birdYRef.current;
    const birdBottom = birdTop + birdSize;
    const px = pipeXRef.current;
    const holeStart = gapYRef.current;
    const holeEnd = holeStart + gapHeight;

    // Floor / Ceiling
    if (birdTop < 0 || birdBottom > FLOOR_Y) {
      if (!gameOver) {
        hitSoundRef.current.currentTime = 0;
        hitSoundRef.current.play();
        dieSoundRef.current.currentTime = 0;
        dieSoundRef.current.play();
      }
      setGameOver(true);
      return;
    }

    // Pipe collision
    const birdLeft = birdX;
    const birdRight = birdLeft + birdSize;
    if (birdRight > px && birdLeft < px + pipeWidth) {
      if (birdTop < holeStart || birdBottom > holeEnd) {
        if (!gameOver) {
          hitSoundRef.current.currentTime = 0;
          hitSoundRef.current.play();
          dieSoundRef.current.currentTime = 0;
          dieSoundRef.current.play();
        }
        setGameOver(true);
      }
    }
  }

  // ---------- Drawing in order of Z-index from farthest to nearest ----------
  function drawGame() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;

    // 1) Sky
    drawSky(ctx);

    // 2) Flickering stars
    drawStars(ctx, scaleX, scaleY);

    // 3) City silhouette
    drawCitySilhouette(ctx, scaleX, scaleY);

    // 4) Clouds
    drawClouds(ctx, scaleX, scaleY);

    // 5) Ground
    drawGround(ctx, scaleX);

    // 6) Pipes
    drawPipes(ctx, scaleX, scaleY);

    // 7) Bird (logo)
    drawBird(ctx, scaleX, scaleY);

    // 8) Score / Start overlay
    drawScoreAndOverlay(ctx, scaleX, scaleY);
  }

  function drawSky(ctx: CanvasRenderingContext2D) {
    // Sky color
    ctx.fillStyle = "#0A0A32";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
  }

  function drawStars(ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number) {
    // Flickering star brightness
    const timeSec = Date.now() / 1000;
    starsRef.current.forEach((star) => {
      const brightness = 0.3 + 0.7 * ((Math.sin(timeSec + star.offset) + 1) / 2);
      ctx.fillStyle = `rgba(255,255,255,${brightness.toFixed(2)})`;
      ctx.fillRect(star.x * scaleX, star.y * scaleY, 4, 4);
    });
  }

  function drawCitySilhouette(ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number) {
    // We shift by bgXRef for parallax
    const baseX = bgXRef.current;
    ctx.save();
    ctx.translate(baseX * scaleX, 0);

    // City silhouette is drawn from left to right
    ctx.fillStyle = "#1E1E4C";
    // Use the array of random segments
    let currentX = 0;
    citySegmentsRef.current.forEach((seg) => {
      ctx.fillRect(currentX * scaleX, (LOGICAL_HEIGHT - seg.height) * scaleY, seg.width * scaleX, seg.height * scaleY);
      // Also draw a second copy offset by LOGICAL_WIDTH for smooth looping
      ctx.fillRect((currentX + LOGICAL_WIDTH) * scaleX, (LOGICAL_HEIGHT - seg.height) * scaleY, seg.width * scaleX, seg.height * scaleY);
      currentX += seg.width;
    });

    ctx.restore();
  }

  function drawClouds(ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number) {
    ctx.fillStyle = "#CCCCCC";
    cloudsRef.current.forEach((cloud) => {
      ctx.beginPath();
      ctx.arc(cloud.x * scaleX, cloud.y * scaleY, 40 * scaleX, 0, Math.PI * 2);
      ctx.arc((cloud.x + 60) * scaleX, (cloud.y + 10) * scaleY, 30 * scaleX, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawGround(ctx: CanvasRenderingContext2D, scaleY: number) {
    ctx.fillStyle = "#008000";
    ctx.fillRect(0, FLOOR_Y * scaleY, canvasSize.width, FLOOR_HEIGHT * scaleY);
  }

  function drawPipes(ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number) {
    ctx.fillStyle = "#004d00";
    const pxScaled = pipeXRef.current * scaleX;
    ctx.fillRect(pxScaled, 0, pipeWidth * scaleX, gapYRef.current * scaleY);
    ctx.fillRect(
      pxScaled,
      (gapYRef.current + gapHeight) * scaleY,
      pipeWidth * scaleX,
      canvasSize.height - (gapYRef.current + gapHeight) * scaleY
    );
  }

  function drawBird(ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number) {
    const img = logoRef.current;
    if (!img) return;
    ctx.save();
    const cx = (birdX + birdSize / 2) * scaleX;
    const cy = (birdYRef.current + birdSize / 2) * scaleY;
    ctx.translate(cx, cy);
    ctx.rotate((rotationRef.current * Math.PI) / 180);
    ctx.drawImage(
      img,
      -((birdSize * scaleX) / 2),
      -((birdSize * scaleY) / 2),
      birdSize * scaleX,
      birdSize * scaleY
    );
    ctx.restore();
  }

  function drawScoreAndOverlay(ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number) {
    // Score
    ctx.fillStyle = "white";
    ctx.font = `${30 * Math.min(scaleX, scaleY)}px Arial`;
    ctx.fillText(`Score: ${scoreRef.current}`, 20 * scaleX, 40 * scaleY);

    // Start overlay
    if (!hasStarted && !gameOver) {
      ctx.fillStyle = "white";
      ctx.font = `${40 * Math.min(scaleX, scaleY)}px Arial`;
      const message = "Click to Start";
      const textWidth = ctx.measureText(message).width;
      ctx.fillText(message, (ctx.canvas.width - textWidth) / 2, ctx.canvas.height / 2);
    }
  }

  // ------------------- Collision & Reset -------------------
  function restart() {
    birdYRef.current = 300;
    birdVYRef.current = 0;
    pipeXRef.current = LOGICAL_WIDTH;
    gapYRef.current = 200;
    rotationRef.current = 0;
    passedPipeRef.current = false;
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setIsPaused(false);
    setHasStarted(false);
    lastTimeRef.current = 0; // reset timing
  }

  // Possibly a second "start area" logic
  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || hasStarted) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;
    if (x >= 360 * scaleX && x <= 400 * scaleX && y >= 500 * scaleY && y <= 600 * scaleY) {
      setHasStarted(true);
      setIsPaused(false);
      setGameOver(false);
    }
  }

  return (
    <div style={{ textAlign: "center", color: "white", overflow: "hidden" }}>
      <h3>Flappy Logo</h3>
      <div style={{ margin: "10px" }}>
        <button onClick={() => setFrameRateMode(60)} className="bg-gray-600 rounded p-2 m-1">60Hz Mode</button>
        <button onClick={() => setFrameRateMode(120)} className="bg-gray-600 rounded p-2 m-1">120Hz Mode</button>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasClick}
        onMouseDown={handleMouseDown}
        style={{ touchAction: "none" }}
      />
      <GameOverModal
        isOpen={gameOver}
        score={score}
        gameName={"flappy"}
        onClose={restart}
        onRestart={restart}
      />
      <PauseButton isPaused={isPaused} onTogglePause={() => setIsPaused((prev) => !prev)} />
    </div>
  );
};

export default FlappyLogoGame;
