import React, { useEffect, useState, useRef } from "react";
import Confetti from "react-confetti";

interface Burst {
  id: number;
  pieces: number;
  source: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

export const SuccessAnimation: React.FC = () => {
  const { width, height } = useWindowSize();

  const [mainConfettiPieces, setMainConfettiPieces] = useState(200);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMainConfettiPieces(0);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const [bursts, setBursts] = useState<Burst[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleBurst = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const id = Date.now() + Math.random();

    setBursts((prev) => [
      ...prev,
      {
        id,
        pieces: 300, 
        source: { x: centerX, y: centerY, w: 10, h: 10 },
      },
    ]);

    setTimeout(() => {
      setBursts((prev) =>
        prev.map((burst) =>
          burst.id === id ? { ...burst, pieces: 0 } : burst
        )
      );
    }, 1000);

    setTimeout(() => {
      setBursts((prev) => prev.filter((burst) => burst.id !== id));
    }, 6000);
  };

  return (
    <div className="relative pb-10">
      <Confetti
        width={width}
        height={height}
        numberOfPieces={mainConfettiPieces}
        recycle={false}
        className="!fixed !top-0 !left-0 !z-[9999] pointer-events-none"
      />

      {bursts.map((burst) => (
        <Confetti
          key={burst.id}
          width={width}
          height={height}
          numberOfPieces={burst.pieces}
          recycle={false}
          confettiSource={burst.source}
          className="!fixed !top-0 !left-0 !z-[9999] pointer-events-none"
        />
      ))}

      <div style={{ textAlign: "center", marginTop: "2rem", color: "green" }}>
        <div style={{ fontSize: "3rem" }}>✓</div>
        <p>Success!</p>

        <button
          ref={buttonRef}
          onClick={handleBurst}
          style={{
            marginTop: "2rem",
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Confetti Burst!
        </button>
      </div>
    </div>
  );
};
