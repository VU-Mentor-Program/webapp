// Carousel.tsx
import React, { useState, useEffect, useRef } from "react";

// The raw images array (without clones)
const rawImages = [
  "/webapp/IMG_2333.JPG",
  "/webapp/IMG_3302.JPG",
  "/webapp/IMG_3369.JPG",
  "/webapp/IMG_2220.JPEG",
  "/webapp/IMG_2591.JPG",
  "/webapp/IMG_2615.JPG",
  "/webapp/IMG_3086.JPG",
  "/webapp/IMG_3229.JPG",
  "/webapp/IMG_3354.JPG",
  "/webapp/IMG_4036.JPG",
  "/webapp/IMG_4028.JPG",
  "/webapp/IMG_4097.JPG",
];

// For a seamless loop, create a new array with the last image at the beginning and the first image at the end.
const images = [
  rawImages[rawImages.length - 1],
  ...rawImages,
  rawImages[0],
];

const Carousel: React.FC = () => {
  // Start at index 1, which is the first "real" image.
  const [currentIndex, setCurrentIndex] = useState(1);
  const sliderRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>();

  // Each slide takes 80% of the container's width.
  const slideWidthPercentage = 80;

  // Reset the auto-advance timer whenever called.
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = window.setInterval(() => {
      nextSlide();
    }, 8000);
  };

  // Manual navigation resets the timer.
  const prevSlide = () => {
    resetTimer();
    setCurrentIndex((prev) => prev - 1);
  };

  const nextSlide = () => {
    resetTimer();
    setCurrentIndex((prev) => prev + 1);
  };

  // Set up auto-advance when the component mounts.
  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  // Whenever currentIndex changes, update the transform.
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${currentIndex * slideWidthPercentage}%)`;
    }
  }, [currentIndex]);

  // When the transition ends, check if we've reached a cloned slide.
  const handleTransitionEnd = () => {
    if (currentIndex === 0) {
      // If at clone of last slide (index 0), jump to the real last image.
      setCurrentIndex(rawImages.length);
      // Temporarily disable transition to avoid animation on jump.
      if (sliderRef.current) {
        sliderRef.current.style.transition = "none";
        sliderRef.current.style.transform = `translateX(-${rawImages.length * slideWidthPercentage}%)`;
        // Force reflow, then re-enable transition.
        void sliderRef.current.offsetWidth;
        sliderRef.current.style.transition = "transform 500ms ease-in-out";
      }
    } else if (currentIndex === rawImages.length + 1) {
      // If at clone of first slide, jump to the real first image.
      setCurrentIndex(1);
      if (sliderRef.current) {
        sliderRef.current.style.transition = "none";
        sliderRef.current.style.transform = `translateX(-${slideWidthPercentage}%)`;
        void sliderRef.current.offsetWidth;
        sliderRef.current.style.transition = "transform 500ms ease-in-out";
      }
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto pb-10">
      {/* Carousel Container */}
      <div className="overflow-hidden rounded">
        {/* Slider */}
        <div
          ref={sliderRef}
          className="flex transition-transform duration-500 ease-in-out"
          onTransitionEnd={handleTransitionEnd}
        >
          {images.map((src, index) => (
            <div key={index} className="flex-shrink-0 w-[80%] h-96 mx-2 overflow-hidden">
              <img src={src} alt={`Slide ${index}`} className="w-full h-full object-cover rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
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
  );
};

export default Carousel;
