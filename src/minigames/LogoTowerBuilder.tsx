import React, { useEffect, useRef, useState } from "react";
import mpLogo from "../assets/mp_logo.png";
import GameOverModal from "../components/minigame page/GameOverModal";

export const LogoStackGame: React.FC = () => {
  /*** CONSTANTS ***/
  const LOGICAL_WIDTH = 400;
  const LOGICAL_HEIGHT = 600;
  const BLOCK_SIZE = 80; // square block dimensions
  const GRAVITY = 0.5;
  const EXPLOSION_SPEED = 5;
  const LEFT_BOUND = BLOCK_SIZE / 2;
  const RIGHT_BOUND = LOGICAL_WIDTH - BLOCK_SIZE / 2;
  // Vertical gap (in world coordinates) between the swing block and the last placed block:
  const SWING_DISTANCE = 300;
  // Desired top margin (in world coordinates) before we start scrolling the camera:
  const DESIRED_TOP_MARGIN = 10;
  // Tower sway factor (applied only when game is over)
  const TOWER_SWAY_SPEED = 0.005;

  /*** CANVAS SETUP ***/
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT });
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

  /*** LOAD THE LOGO IMAGE (square mp_logo.png) ***/
  const logoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  /*** INTERFACES ***/
  interface TowerBlock {
    x: number;         // center x (world coordinate)
    y: number;         // top y (world coordinate)
    rotation: number;  // tilt (degrees) based on misalignment
  }
  interface FlyingBlock {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    vr: number; // rotation speed (degrees per frame)
  }
  interface Building {
    x: number;
    width: number;
    height: number;
    color: string;
  }
  interface Cloud {
    x: number;
    y: number;
    speed: number;
  }
  interface Bird {
    x: number;
    y: number;
    speed: number;
  }

  /*** STATIC CITY BUILDINGS ***/
  const [buildings] = useState<Building[]>(() => {
    const blds: Building[] = [];
    const colors = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#845EC2"];
    let x = 0;
    while (x < LOGICAL_WIDTH) {
      const width = 30 + Math.random() * 40; // between 30 and 70
      const height = 50 + Math.random() * 150; // between 50 and 200
      blds.push({
        x,
        width,
        height,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
      x += width + 10; // gap between buildings
    }
    return blds;
  });

  /*** MOVING CLOUDS & BIRDS (Background Elements) ***/
  const [clouds, setClouds] = useState<Cloud[]>(() => {
    const arr: Cloud[] = [];
    for (let i = 0; i < 3; i++) {
      arr.push({
        x: Math.random() * LOGICAL_WIDTH,
        y: 20 + Math.random() * 50,
        speed: 0.2 + Math.random() * 0.3,
      });
    }
    return arr;
  });
  const [birds, setBirds] = useState<Bird[]>(() => {
    const arr: Bird[] = [];
    for (let i = 0; i < 5; i++) {
      arr.push({
        x: Math.random() * LOGICAL_WIDTH,
        y: 80 + Math.random() * 40,
        speed: 0.5 + Math.random() * 0.5,
      });
    }
    return arr;
  });

  /*** GAME STATE ***/
  const [tower, setTower] = useState<TowerBlock[]>([]);
  const [swingX, setSwingX] = useState(LEFT_BOUND); // world x for the swing block
  const [swingArmSpeed, setSwingArmSpeed] = useState(10); // tweakable horizontal swing speed
  const [dropping, setDropping] = useState(false);
  const [dropY, setDropY] = useState(0); // world y of the falling block (set when drop starts)
  const [dropSpeed, setDropSpeed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [exploding, setExploding] = useState(false);
  const [flyingBlocks, setFlyingBlocks] = useState<FlyingBlock[]>([]);
  const [score, setScore] = useState(0);

  /*** MAIN ANIMATION LOOP ***/
  useEffect(() => {
    let animId: number;
    const startTime = performance.now();
    function loop() {
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;
      update(elapsed);
      draw(elapsed);
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    tower,
    swingX,
    swingArmSpeed,
    dropping,
    dropY,
    dropSpeed,
    gameOver,
    exploding,
    flyingBlocks,
    clouds,
    birds,
    canvasSize,
  ]);

  /*** UPDATE GAME LOGIC ***/
  function update(time: number) {
    if (gameOver) return;

    // Update background clouds and birds.
    setClouds((prev) =>
      prev.map((cloud) => {
        let newX = cloud.x + cloud.speed;
        if (newX > LOGICAL_WIDTH + 50) newX = -50;
        return { ...cloud, x: newX };
      })
    );
    setBirds((prev) =>
      prev.map((bird) => {
        let newX = bird.x + bird.speed;
        if (newX > LOGICAL_WIDTH + 20) newX = -20;
        return { ...bird, x: newX };
      })
    );

    // When not dropping, update the swing block’s horizontal position.
    if (!dropping) {
      let newSwingX = swingX + swingArmSpeed;
      if (newSwingX > RIGHT_BOUND) {
        newSwingX = RIGHT_BOUND;
        setSwingArmSpeed(-Math.abs(swingArmSpeed));
      } else if (newSwingX < LEFT_BOUND) {
        newSwingX = LEFT_BOUND;
        setSwingArmSpeed(Math.abs(swingArmSpeed));
      }
      setSwingX(newSwingX);
    } else {
      // When dropping, update the falling block’s vertical position.
      const newDropY = dropY + dropSpeed;
      const newDropSpeed = dropSpeed + GRAVITY;
      setDropY(newDropY);
      setDropSpeed(newDropSpeed);

      // Determine landing target: If there’s a tower, land on top of the last block; else, land on the ground.
      let targetY = LOGICAL_HEIGHT - BLOCK_SIZE;
      if (tower.length > 0) {
        const topBlock = tower[tower.length - 1];
        targetY = topBlock.y - BLOCK_SIZE;
      }
      if (newDropY >= targetY) {
        placeBlock(targetY);
      }
      if (newDropY > LOGICAL_HEIGHT) {
        setGameOver(true);
      }
    }
  }

  /*** PLACE THE DROPPED BLOCK INTO THE TOWER ***/
  function placeBlock(finalY: number) {
    const newBlockX = swingX;
    if (tower.length > 0) {
      const topBlock = tower[tower.length - 1];
      const misalignment = Math.abs(newBlockX - topBlock.x);
      const overlap = BLOCK_SIZE - misalignment;
      if (overlap <= 0) {
        setGameOver(true);
        return;
      }
      if (overlap < 0.5 * BLOCK_SIZE) {
        triggerExplosion();
        return;
      }
      // Compute a tilt (up to 15°) based on misalignment.
      const blockTilt = ((newBlockX - topBlock.x) / (BLOCK_SIZE / 2)) * 15;
      const newBlock: TowerBlock = { x: newBlockX, y: finalY, rotation: blockTilt };
      setTower((prev) => [...prev, newBlock]);
    } else {
      // First block lands on the ground.
      const newBlock: TowerBlock = { x: newBlockX, y: finalY, rotation: 0 };
      setTower([newBlock]);
    }
    setScore((s) => s + 100);
    setDropping(false);
    setDropSpeed(0);
  }

  /*** TRIGGER EXPLOSION (if overlap is insufficient) ***/
  function triggerExplosion() {
    setExploding(true);
    const blocksToFly: FlyingBlock[] = [];
    tower.forEach((tb) => {
      blocksToFly.push({
        x: tb.x - BLOCK_SIZE / 2,
        y: tb.y,
        vx: (Math.random() - 0.5) * EXPLOSION_SPEED * 2,
        vy: -Math.random() * EXPLOSION_SPEED,
        rotation: 0,
        vr: (Math.random() - 0.5) * 10,
      });
    });
    // Also include the current (dropping) block.
    blocksToFly.push({
      x: swingX - BLOCK_SIZE / 2,
      y: dropY,
      vx: (Math.random() - 0.5) * EXPLOSION_SPEED * 2,
      vy: -Math.random() * EXPLOSION_SPEED,
      rotation: 0,
      vr: (Math.random() - 0.5) * 10,
    });
    setFlyingBlocks(blocksToFly);
    setGameOver(true);
  }

  /*** DRAWING FUNCTION ***/
  function draw(time: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;

    // --- Draw Background (Sky, Buildings, Clouds, Birds) in Fixed Screen Coordinates ---
    ctx.save();
    ctx.scale(scaleX, scaleY);
    const skyGradient = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    skyGradient.addColorStop(0, "#0f2027");
    skyGradient.addColorStop(1, "#203a43");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    buildings.forEach((bld) => {
      ctx.fillStyle = bld.color;
      const bldY = LOGICAL_HEIGHT - 10 - bld.height;
      ctx.fillRect(bld.x, bldY, bld.width, bld.height);
    });
    clouds.forEach((cloud) => {
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cloud.x + 25, cloud.y + 5, 15, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    birds.forEach((bird) => {
      ctx.beginPath();
      ctx.moveTo(bird.x, bird.y);
      ctx.lineTo(bird.x + 10, bird.y - 5);
      ctx.moveTo(bird.x + 10, bird.y - 5);
      ctx.lineTo(bird.x + 20, bird.y);
      ctx.stroke();
    });
    ctx.restore();

    // --- Compute World Coordinates for the Swing Block ---
    const swingWorldY =
      tower.length > 0
        ? tower[tower.length - 1].y - SWING_DISTANCE
        : (LOGICAL_HEIGHT - BLOCK_SIZE) - SWING_DISTANCE;
    // Effective top is the swing block’s world y when not dropping,
    // or the falling block’s y when dropping.
    const effectiveTopY = dropping ? dropY : swingWorldY;
    const cameraOffsetY = effectiveTopY < DESIRED_TOP_MARGIN ? DESIRED_TOP_MARGIN - effectiveTopY : 0;

    // --- Draw the World (Tower, Falling Block, Ground) with Camera Translation ---
    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.translate(0, cameraOffsetY);
    // If game over, apply extra tower sway to simulate instability.
    let towerSwayOffset = 0;
    if (gameOver) {
      const towerHeight =
        tower.length > 0 ? (LOGICAL_HEIGHT - BLOCK_SIZE) - tower[tower.length - 1].y : 0;
      const dynamicSwayAmplitude = Math.min(20, 5 + towerHeight / 50);
      towerSwayOffset = dynamicSwayAmplitude * Math.sin(time * TOWER_SWAY_SPEED);
    }
    ctx.save();
    ctx.translate(towerSwayOffset, 0);
    // Draw tower blocks.
    tower.forEach((block) => {
      ctx.save();
      ctx.translate(block.x, block.y + BLOCK_SIZE / 2);
      ctx.rotate((block.rotation * Math.PI) / 180);
      drawLogoBlock(ctx, -BLOCK_SIZE / 2, -BLOCK_SIZE / 2, BLOCK_SIZE, BLOCK_SIZE);
      ctx.restore();
    });
    // Draw the current block: if dropping, use dropY; if not, use swingWorldY.
    if (dropping) {
      ctx.save();
      ctx.translate(swingX, dropY + BLOCK_SIZE / 2);
      drawLogoBlock(ctx, -BLOCK_SIZE / 2, -BLOCK_SIZE / 2, BLOCK_SIZE, BLOCK_SIZE);
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(swingX, swingWorldY + BLOCK_SIZE / 2);
      drawLogoBlock(ctx, -BLOCK_SIZE / 2, -BLOCK_SIZE / 2, BLOCK_SIZE, BLOCK_SIZE);
      ctx.restore();
    }
    // Draw ground line.
    ctx.fillStyle = "#333";
    ctx.fillRect(0, LOGICAL_HEIGHT - 10, LOGICAL_WIDTH, 10);
    ctx.restore();
    ctx.restore();

    // --- If in Explosion Mode, Draw Flying Blocks (in world coordinates) ---
    if (exploding) {
      ctx.save();
      ctx.scale(scaleX, scaleY);
      flyingBlocks.forEach((fb) => {
        ctx.save();
        ctx.translate(fb.x + BLOCK_SIZE / 2, fb.y + BLOCK_SIZE / 2);
        ctx.rotate((fb.rotation * Math.PI) / 180);
        if (logoRef.current) {
          ctx.drawImage(logoRef.current, -BLOCK_SIZE / 2, -BLOCK_SIZE / 2, BLOCK_SIZE, BLOCK_SIZE);
        } else {
          ctx.fillStyle = "orange";
          ctx.fillRect(-BLOCK_SIZE / 2, -BLOCK_SIZE / 2, BLOCK_SIZE, BLOCK_SIZE);
        }
        ctx.restore();
      });
      ctx.restore();
    }

    // --- Draw UI (Score and Game Over Message) Fixed to the Screen ---
    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
    if (gameOver) {
      ctx.fillStyle = "red";
      ctx.fillText("GAME OVER!", 120, 200);
    }
    ctx.restore();
  }

  function drawLogoBlock(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    if (logoRef.current) {
      ctx.drawImage(logoRef.current, x, y, w, h);
    } else {
      ctx.fillStyle = "skyblue";
      ctx.fillRect(x, y, w, h);
    }
  }

  const restart = () => {
    setTower([]);
    setScore(0);
    setGameOver(false);
    setExploding(false);
    setFlyingBlocks([]);
    setSwingX(LEFT_BOUND);
    setSwingArmSpeed(10);
    setDropping(false);
    setDropY(0);
    setDropSpeed(0);
    return;
  }

  /*** CLICK HANDLER: DROP THE BLOCK ***/
  function handleClick() {
    if (gameOver) {
      // Restart the game.
      restart();
    }
    if (!dropping && !exploding) {
      // Begin dropping. Compute the swing block's world y coordinate.
      const swingWorldY =
        tower.length > 0
          ? tower[tower.length - 1].y - SWING_DISTANCE
          : (LOGICAL_HEIGHT - BLOCK_SIZE) - SWING_DISTANCE;
      setDropY(swingWorldY);
      setDropSpeed(2);
      setDropping(true);
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ color: "white" }}>Logo Tower Builder</h2>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ background: "#222" }}
        onClick={handleClick}
      />
      <p style={{ color: "#ccc" }}>
        Click to drop the logo block from above (always {SWING_DISTANCE}px above the last piece).
        <br />
        Stack blocks with at least 50% overlap to build your tower!
      </p>
      <GameOverModal isOpen={gameOver} score={score} gameName={"tower"} onClose={restart} onRestart={restart}/>
    </div>
  );
};
