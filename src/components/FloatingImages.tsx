import { useMemo } from "react";
import { homeCarouselImages, eventGalleries } from "../assets/images";

const FLOAT_COUNT = 18;

interface FloatConfig {
  src: string;
  top: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
  rotate: string;
  driftX: string;
  driftY: string;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildPool(): string[] {
  const pool: string[] = [...homeCarouselImages];
  for (const gallery of Object.values(eventGalleries)) {
    const pick = Math.min(gallery.images.length, 2);
    for (let i = 0; i < pick; i++) {
      pool.push(gallery.images[i]);
    }
  }
  return pool;
}

function pickImages(pool: string[], count: number): string[] {
  const rand = seededRandom(42);
  const shuffled = [...pool].sort(() => rand() - 0.5);
  return shuffled.slice(0, count);
}

const positions = [
  // Left column
  { top: "-3%",  left: "-6%" },
  { top: "18%",  left: "-4%" },
  { top: "38%",  left: "2%" },
  { top: "58%",  left: "-5%" },
  { top: "78%",  left: "3%" },
  // Left-center
  { top: "8%",   left: "15%" },
  { top: "48%",  left: "12%" },
  { top: "72%",  left: "18%" },
  // Top center (above content)
  { top: "-4%",  left: "42%" },
  { top: "2%",   left: "58%" },
  // Right-center
  { top: "12%",  left: "72%" },
  { top: "42%",  left: "78%" },
  { top: "68%",  left: "70%" },
  // Right column
  { top: "-2%",  left: "88%" },
  { top: "22%",  left: "92%" },
  { top: "45%",  left: "90%" },
  { top: "62%",  left: "94%" },
  { top: "82%",  left: "85%" },
];

const sizes = [
  "w-20 h-20",
  "w-24 h-24",
  "w-28 h-28",
  "w-32 h-32",
  "w-36 h-36",
];

export default function FloatingImages() {
  const configs = useMemo<FloatConfig[]>(() => {
    const pool = buildPool();
    const chosen = pickImages(pool, FLOAT_COUNT);
    const rand = seededRandom(99);

    return chosen.map((src, i) => {
      const pos = positions[i % positions.length];
      const duration = 18 + rand() * 10;
      const delay = rand() * 12;
      const rotate = -15 + rand() * 30;
      const driftX = -30 + rand() * 60;
      const driftY = -20 + rand() * 40;

      return {
        src,
        top: pos.top,
        left: pos.left,
        size: sizes[Math.floor(rand() * sizes.length)],
        duration: `${duration}s`,
        delay: `${delay}s`,
        rotate: `${rotate}deg`,
        driftX: `${driftX}px`,
        driftY: `${driftY}px`,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block" aria-hidden="true">
      {configs.map((cfg, i) => (
        <div
          key={i}
          className={`absolute ${cfg.size} rounded-2xl overflow-hidden hero-float`}
          style={{
            top: cfg.top,
            left: cfg.left,
            animationDuration: cfg.duration,
            animationDelay: cfg.delay,
            "--float-rotate": cfg.rotate,
            "--float-drift-x": cfg.driftX,
            "--float-drift-y": cfg.driftY,
          } as React.CSSProperties}
        >
          <img
            src={cfg.src}
            alt=""
            className="w-full h-full object-cover rounded-2xl"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
