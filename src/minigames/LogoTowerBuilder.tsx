import React, { useEffect, useRef, useState } from "react";
import mpLogo from "../assets/mp_logo-CIRCLE.png";

export const LogoStackGame: React.FC = () => {
  // Canvas logical size
  const LOGICAL_WIDTH = 400;
  const LOGICAL_HEIGHT = 600;

  const BLOCK_WIDTH = 80;  // width of each logo block
  const BLOCK_HEIGHT = 40; // height of each logo block
  const SWING_MIN_ANGLE = -60; // degrees
  const SWING_MAX_ANGLE = 60;  // degrees
  const SWING_SPEED = 1.0;     // how fast the arm swings (deg per frame)

  // For comedic explosion
  const EXPLOSION_SPEED = 5;   // base horizontal velocity
  const GRAVITY = 0.3;         // downward acceleration in explosion

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // We’ll dynamically scale the canvas based on viewport size
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

  // Load the logo image
  const logoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = mpLogo;
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  // Each block in the tower
  interface TowerBlock {
    x: number;  // center X
    y: number;  // top Y
    w: number;  // width
    h: number;  // height
  }

  // The tower so far
  const [tower, setTower] = useState<TowerBlock[]>([]);

  // The "swing arm" block that is waiting to be dropped
  const [swingAngle, setSwingAngle] = useState(SWING_MIN_ANGLE); // degrees
  const [angleSpeed, setAngleSpeed] = useState(SWING_SPEED);
  const [dropping, setDropping] = useState(false);

  // The dropped block’s position (once you drop it, we use x,y for falling)
  const [dropX, setDropX] = useState(0);
  const [dropY, setDropY] = useState(0);
  const [dropSpeed, setDropSpeed] = useState(0);

  // Game states
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // For comedic explosion
  interface FlyingBlock {
    // start with same dimension as tower block
    x: number;
    y: number;
    w: number;
    h: number;
    vx: number;
    vy: number;
    rotation: number;
    vr: number; // rotation speed
  }
  const [flyingBlocks, setFlyingBlocks] = useState<FlyingBlock[]>([]);
  const [exploding, setExploding] = useState(false);

  // Start / restart
  function startGame() {
    setTower([]);
    setScore(0);
    setGameOver(false);
    setExploding(false);
    setFlyingBlocks([]);
    resetSwingArm();
  }

  useEffect(() => {
    // On mount, start game
    startGame();
  }, []);

  // A helper to reset the swing arm for the next block
  function resetSwingArm() {
    setSwingAngle(SWING_MIN_ANGLE);
    setAngleSpeed(SWING_SPEED);
    setDropping(false);
    setDropX(0);
    setDropY(0);
    setDropSpeed(0);
  }

  // Main loop
  useEffect(() => {
    let animId = 0;
    const loop = () => {
      update();
      draw();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
    // eslint-disable-next-line
  }, [tower, dropping, gameOver, exploding, flyingBlocks, swingAngle, angleSpeed]);

  function update() {
    if (gameOver) return;

    // If we're in comedic-explosion mode, just update flying blocks
    if (exploding) {
      setFlyingBlocks((old) =>
        old.map((block) => {
          // apply velocities
          const newX = block.x + block.vx;
          const newY = block.y + block.vy;
          const newVy = block.vy + GRAVITY; // gravity
          const newRotation = block.rotation + block.vr;
          return {
            ...block,
            x: newX,
            y: newY,
            vy: newVy,
            rotation: newRotation,
          };
        })
      );
      return;
    }

    // If not dropping, swing the arm
    if (!dropping) {
      let newAngle = swingAngle + angleSpeed;
      // bounce between min & max
      if (newAngle > SWING_MAX_ANGLE) {
        newAngle = SWING_MAX_ANGLE;
        setAngleSpeed(-Math.abs(angleSpeed));
      } else if (newAngle < SWING_MIN_ANGLE) {
        newAngle = SWING_MIN_ANGLE;
        setAngleSpeed(Math.abs(angleSpeed));
      }
      setSwingAngle(newAngle);
    } else {
      // The block is dropping
      const newY = dropY + dropSpeed;
      const newSpeed = dropSpeed + 0.5; // fall acceleration
      setDropY(newY);
      setDropSpeed(newSpeed);

      // check if it hit something
      // The block’s bottom is newY + BLOCK_HEIGHT
      // Tower block’s top is towerBlock.y
      // We'll assume tower blocks are stacked from bottom up
      const topBlock = tower[tower.length - 1];
      const groundY = LOGICAL_HEIGHT - BLOCK_HEIGHT;

      if (topBlock) {
        // the top of topBlock is topBlock.y
        // if newY + BLOCK_HEIGHT >= topBlock.y => we have a collision or pass
        if (newY + BLOCK_HEIGHT >= topBlock.y) {
          // Snap it so the bottom of dropping block = topBlock.y
          const finalY = topBlock.y - BLOCK_HEIGHT;
          placeBlock(finalY);
        }
      } else {
        // no tower => first block. If it hits ground, place it on the ground
        if (newY + BLOCK_HEIGHT >= LOGICAL_HEIGHT) {
          const finalY = groundY;
          placeBlock(finalY);
        }
      }

      // If it goes below ground -> you missed entirely
      if (newY > LOGICAL_HEIGHT) {
        // That means it never collided with the tower top
        // => game over
        setGameOver(true);
      }
    }
  }

  function placeBlock(finalY: number) {
    // We have a top block. Check overlap with the block below
    const topBlock = tower[tower.length - 1];
    const newBlockCenterX = dropX;
    const newBlockLeft = newBlockCenterX - BLOCK_WIDTH / 2;
    const newBlockRight = newBlockCenterX + BLOCK_WIDTH / 2;

    if (topBlock) {
      // compute overlap
      const topLeft = topBlock.x - topBlock.w / 2;
      const topRight = topBlock.x + topBlock.w / 2;

      const overlapLeft = Math.max(newBlockLeft, topLeft);
      const overlapRight = Math.min(newBlockRight, topRight);
      const overlapWidth = overlapRight - overlapLeft;

      // If there's NO overlap, block actually falls off (game over).
      if (overlapWidth <= 0) {
        // Missed the block completely => block falls
        setGameOver(true);
        return;
      }

      // If overlap is < 50% of the new block’s width => comedic explosion
      if (overlapWidth < 0.5 * BLOCK_WIDTH) {
        triggerExplosion();
        return;
      }
    }
    // Otherwise we place the new block
    const newBlock: TowerBlock = {
      x: dropX,
      y: finalY,
      w: BLOCK_WIDTH,
      h: BLOCK_HEIGHT,
    };
    setTower((prev) => [...prev, newBlock]);
    setDropping(false);
    setScore((s) => s + 1);
    resetSwingArm();
  }

  function triggerExplosion() {
    setExploding(true);
    // Convert entire tower + dropping block into flying blocks
    let blocksToFly: FlyingBlock[] = [];
    // Tower
    tower.forEach((tb) => {
      blocksToFly.push({
        x: tb.x - tb.w / 2,
        y: tb.y,
        w: tb.w,
        h: tb.h,
        vx: (Math.random() - 0.5) * EXPLOSION_SPEED * 2,
        vy: -Math.random() * EXPLOSION_SPEED,
        rotation: 0,
        vr: (Math.random() - 0.5) * 10,
      });
    });
    // The current dropping block (if any)
    blocksToFly.push({
      x: dropX - BLOCK_WIDTH / 2,
      y: dropY,
      w: BLOCK_WIDTH,
      h: BLOCK_HEIGHT,
      vx: (Math.random() - 0.5) * EXPLOSION_SPEED * 2,
      vy: -Math.random() * EXPLOSION_SPEED,
      rotation: 0,
      vr: (Math.random() - 0.5) * 10,
    });
    setFlyingBlocks(blocksToFly);
    // game over
    setGameOver(true);
  }

  // Draw
  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // scale to match LOGICAL dim
    const scaleX = canvasSize.width / LOGICAL_WIDTH;
    const scaleY = canvasSize.height / LOGICAL_HEIGHT;
    ctx.save();
    ctx.scale(scaleX, scaleY);

    // Draw ground
    ctx.fillStyle = "#333";
    ctx.fillRect(0, LOGICAL_HEIGHT - 10, LOGICAL_WIDTH, 10);

    // Draw tower blocks
    ctx.fillStyle = "skyblue";
    tower.forEach((block) => {
      drawLogoBlock(ctx, block.x, block.y, block.w, block.h);
    });

    // If exploding, draw flying blocks
    if (exploding) {
      ctx.fillStyle = "orange";
      flyingBlocks.forEach((fb) => {
        drawFlyingBlock(ctx, fb);
      });
    } else {
      // Draw the current swinging block if not dropped yet
      if (!dropping) {
        // The pivot is at the top center (x=LOGICAL_WIDTH/2, y=0) 
        // or we can keep it simpler and just assume pivot at (BLOCK_WIDTH,0). 
        // But let's do a real pivot:
        const pivotX = LOGICAL_WIDTH / 2;
        const pivotY = 0;
        const radius = 150; // distance from pivot to block center
        const rad = (swingAngle * Math.PI) / 180;

        const centerX = pivotX + radius * Math.cos(rad);
        const centerY = pivotY + radius * Math.sin(rad);

        // store them so we know where to drop from
        if (!gameOver) {
          setDropX(centerX);
          setDropY(centerY);
        }

        // Let’s draw a line for the “arm”
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();

        // Now draw the block centered at (centerX, centerY)
        drawLogoBlock(ctx, centerX, centerY, BLOCK_WIDTH, BLOCK_HEIGHT);
      } else {
        // The block is falling
        drawLogoBlock(ctx, dropX, dropY, BLOCK_WIDTH, BLOCK_HEIGHT);
      }
    }

    // Draw score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);

    // If game over, message
    if (gameOver) {
      ctx.fillStyle = "red";
      ctx.fillText("GAME OVER!", 120, 200);
    }

    ctx.restore();
  }

  function drawLogoBlock(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    topY: number,
    width: number,
    height: number
  ) {
    // If you have a logo, we can tile or just stretch the logo
    // Here, let's stretch the logo across the block for simplicity
    if (logoRef.current) {
      ctx.drawImage(
        logoRef.current,
        centerX - width / 2,
        topY,
        width,
        height
      );
    } else {
      // fallback
      ctx.fillStyle = "skyblue";
      ctx.fillRect(centerX - width / 2, topY, width, height);
    }
  }

  function drawFlyingBlock(ctx: CanvasRenderingContext2D, fb: FlyingBlock) {
    // rotate around block's center
    const cx = fb.x + fb.w / 2;
    const cy = fb.y + fb.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((fb.rotation * Math.PI) / 180);
    if (logoRef.current) {
      ctx.drawImage(logoRef.current, -fb.w / 2, -fb.h / 2, fb.w, fb.h);
    } else {
      ctx.fillStyle = "orange";
      ctx.fillRect(-fb.w / 2, -fb.h / 2, fb.w, fb.h);
    }
    ctx.restore();
  }

  // Handle user input to drop the block
  function handleClickOrKey() {
    if (gameOver) {
      startGame();
      return;
    }
    if (!exploding && !dropping) {
      setDropping(true);
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Spacebar") {
        handleClickOrKey();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, [gameOver, exploding, dropping]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ color: "white" }}>Swing-Arm Logo Stack</h2>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ background: "#222" }}
        onClick={handleClickOrKey}
      />
      <p style={{ color: "#ccc" }}>
        Click or press SPACE to drop the swinging logo block.<br/>
        Overlap ≥ 50% to stack. Miss or overlap less - meltdown!
      </p>
    </div>
  );
};
