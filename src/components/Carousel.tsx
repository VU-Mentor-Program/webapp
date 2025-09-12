import React, { useState, useEffect, useRef } from "react";
import FadeIn from "./Fadein-Wrapper";
import LazyImage from "./LazyImage";

// Import organized image constants
import { eventImages } from '../assets/images';
import { useTranslations } from '../contexts/TranslationContext';

// Use the same images as events for consistency
const rawImages = [
  eventImages.studySession1,
  eventImages.studySession2,
];

// Handle edge case: ensure we have images
const safeRawImages = rawImages.filter(Boolean);

// Create infinite loop array only if we have images
const images = safeRawImages.length > 0 ? [
  safeRawImages[safeRawImages.length - 1],
  ...safeRawImages,
  safeRawImages[0],
] : [];

const HomeCarousel: React.FC = () => {
  const t = useTranslations("home_carousel");
  const [currentIndex, setCurrentIndex] = useState(1);
  const sliderRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>();
  const isAnimatingRef = useRef(false); // Prevent rapid clicks

  const touchStartXRef = useRef<number>(0);
  const touchEndXRef = useRef<number>(0);
  const minSwipeDistance = 50; // pixels

  const slideWidthPercentage = 82; // Slightly adjusted for better spacing

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    // Only auto-play if we have multiple images
    if (safeRawImages.length > 1) {
      timerRef.current = window.setInterval(() => {
        nextSlide();
      }, 8000);
    }
  };

  const prevSlide = () => {
    if (isAnimatingRef.current || safeRawImages.length <= 1) return; // block if animating or single image
    resetTimer();
    isAnimatingRef.current = true;
    setCurrentIndex((prev) => prev - 1);
  };

  const nextSlide = () => {
    if (isAnimatingRef.current || safeRawImages.length <= 1) return; // block if animating or single image
    resetTimer();
    isAnimatingRef.current = true;
    setCurrentIndex((prev) => prev + 1);
  };

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, []); // resetTimer is stable, doesn't need to be in deps

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${currentIndex * slideWidthPercentage}%)`;
    }
  }, [currentIndex]);

  const handleTransitionEnd = () => {
    if (currentIndex === 0) {
      setCurrentIndex(safeRawImages.length);
      if (sliderRef.current) {
        sliderRef.current.style.transition = "none";
        sliderRef.current.style.transform = `translateX(-${safeRawImages.length * slideWidthPercentage}%)`;
        void sliderRef.current.offsetWidth; // force reflow
        sliderRef.current.style.transition = "transform 700ms ease-in-out";
      }
    } else if (currentIndex === safeRawImages.length + 1) {
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
    if (isAnimatingRef.current || safeRawImages.length <= 1) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > minSwipeDistance) nextSlide();
    else if (distance < -minSwipeDistance) prevSlide();
  };

  // Handle empty state
  if (!images.length) {
    return (
      <FadeIn duration={100}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">{t("title")}</h2>
          <p className="text-lg text-blue-300 font-medium mb-2">{t("subtitle")}</p>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">{t("description")}</p>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">No images available yet</p>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn duration={100}>
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">{t("title")}</h2>
        <p className="text-lg text-blue-300 font-medium mb-2">{t("subtitle")}</p>
        <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">{t("description")}</p>
      </div>

      {/* Full-width container that breaks out of normal layout */}
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pb-16 overflow-hidden">
        {/* Inner container for the carousel */}
        <div className="relative w-full max-w-7xl mx-auto px-4">
          <div
            className="relative overflow-visible"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              ref={sliderRef}
              className="flex transition-transform duration-700 ease-in-out"
              style={{ gap: "2rem" }}
              onTransitionEnd={handleTransitionEnd}
            >
              {images.map((src, index) => {
                // Calculate if this is the center image
                const isCenterImage = index === currentIndex;
                const isLeftSide = index === currentIndex - 1;
                const isRightSide = index === currentIndex + 1;
                const isVisible = isCenterImage || isLeftSide || isRightSide;
                
                return (
                  <div 
                    key={index} 
                    className={`flex-shrink-0 w-[80%] transition-all duration-700 ease-in-out ${
                      isCenterImage 
                        ? 'h-[28rem] scale-110 z-20 opacity-100 shadow-2xl' 
                        : 'h-96 scale-90 z-10 opacity-70'
                    } ${
                      isLeftSide || isRightSide 
                        ? 'shadow-xl' 
                        : isVisible ? 'shadow-lg' : 'opacity-40'
                    }`}
                    style={{
                      filter: isCenterImage 
                        ? 'brightness(1.1) contrast(1.05)' 
                        : 'brightness(0.8) contrast(0.95)'
                    }}
                  >
                    <div className={`w-full h-full rounded-xl overflow-hidden ${
                      isCenterImage 
                        ? 'border-4 border-white/20 shadow-2xl ring-1 ring-white/10' 
                        : isLeftSide || isRightSide 
                          ? 'border-2 border-white/10 shadow-xl' 
                          : 'border border-white/5'
                    }`}>
                      <LazyImage 
                        src={src} 
                        alt={`Event slide ${index}`}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                    
                    {/* Side image shadows/overlays */}
                    {(isLeftSide || isRightSide) && (
                      <div className={`absolute inset-0 rounded-xl ${
                        isLeftSide 
                          ? 'bg-gradient-to-r from-transparent via-transparent to-black/20' 
                          : 'bg-gradient-to-l from-transparent via-transparent to-black/20'
                      } pointer-events-none`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        {/* Enhanced Navigation Buttons - only show if more than one image */}
        {safeRawImages.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute top-1/2 -left-4 transform -translate-y-1/2 z-30
                         bg-white/10 backdrop-blur-md text-white p-4 rounded-full 
                         hover:bg-white/20 hover:scale-110 transition-all duration-300
                         border border-white/20 shadow-xl hover:shadow-2xl
                         focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-30
                         bg-white/10 backdrop-blur-md text-white p-4 rounded-full 
                         hover:bg-white/20 hover:scale-110 transition-all duration-300
                         border border-white/20 shadow-xl hover:shadow-2xl
                         focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
          
          {/* Slide indicators - only show if more than one image */}
          {safeRawImages.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {safeRawImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isAnimatingRef.current) {
                      resetTimer();
                      setCurrentIndex(index + 1);
                    }
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index + 1 === currentIndex
                      ? 'bg-white scale-125 shadow-lg'
                      : 'bg-white/40 hover:bg-white/60 hover:scale-110'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
};

export default HomeCarousel;
