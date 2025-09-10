import React, { useState, useEffect, useRef } from "react";
import FadeIn from "./Fadein-Wrapper";
import LazyImage from "./LazyImage";

const rawImages = 
[
  "/webapp/studysession1.png",
  "/webapp/studysession2.png",
];

const images = [
  rawImages[rawImages.length - 1],
  ...rawImages,
  rawImages[0],
];

const Carousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const sliderRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>();
  const isAnimatingRef = useRef(false); // Prevent rapid clicks

  const touchStartXRef = useRef<number>(0);
  const touchEndXRef = useRef<number>(0);
  const minSwipeDistance = 50; // pixels

  const slideWidthPercentage = 80;

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      nextSlide();
    }, 8000);
  };

  const prevSlide = () => {
    if (isAnimatingRef.current) return; // block if animating
    resetTimer();
    isAnimatingRef.current = true;
    setCurrentIndex((prev) => prev - 1);
  };

  const nextSlide = () => {
    if (isAnimatingRef.current) return; // block if animating
    resetTimer();
    isAnimatingRef.current = true;
    setCurrentIndex((prev) => prev + 1);
  };

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${currentIndex * slideWidthPercentage}%)`;
    }
  }, [currentIndex]);

  const handleTransitionEnd = () => {
    if (currentIndex === 0) {
      setCurrentIndex(rawImages.length);
      if (sliderRef.current) {
        sliderRef.current.style.transition = "none";
        sliderRef.current.style.transform = `translateX(-${rawImages.length * slideWidthPercentage}%)`;
        void sliderRef.current.offsetWidth; // force reflow
        sliderRef.current.style.transition = "transform 700ms ease-in-out";
      }
    } else if (currentIndex === rawImages.length + 1) {
      setCurrentIndex(1);
      if (sliderRef.current) {
        sliderRef.current.style.transition = "none";
        sliderRef.current.style.transform = `translateX(-${slideWidthPercentage}%)`;
        void sliderRef.current.offsetWidth;
        sliderRef.current.style.transition = "transform 700ms ease-in-out";
      }
    }
    isAnimatingRef.current = false;
  };

  // Touch handlers for swiping.
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (isAnimatingRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > minSwipeDistance) nextSlide();
    else if (distance < -minSwipeDistance) prevSlide();
  };

  return (
    <FadeIn duration={100}>
      <div className="relative w-full max-w-4xl mx-auto pb-10">
        <div
          className="overflow-hidden rounded"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={sliderRef}
            className="flex transition-transform duration-700 ease-in-out"
            style={{ gap: "1rem" }}
            onTransitionEnd={handleTransitionEnd}
          >
            {images.map((src, index) => (
              <div key={index} className="flex-shrink-0 w-[80%] h-96 overflow-hidden">
                <LazyImage src={src} alt={`Slide ${index}`} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-0 transform -translate-y-1/2 text-white p-2 hover:text-gray-300 transition"
        >
          &#10094;
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-0 transform -translate-y-1/2 text-white p-2 hover:text-gray-300 transition"
        >
          &#10095;
        </button>
      </div>
    </FadeIn>
  );
};

export default Carousel;
