import React, { useState, useEffect, useRef } from "react";
import FadeIn from "./Fadein-Wrapper";

// Import organized image constants
import { homeCarouselImages } from '../assets/images';
import { useTranslations } from '../contexts/TranslationContext';

// Use dedicated home carousel images
const rawImages = [
  ...homeCarouselImages
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

  // Simplified mobile-first approach - no complex calculations needed

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (safeRawImages.length > 1) {
      timerRef.current = window.setInterval(() => {
        nextSlide();
      }, 8000);
    }
  };

  const prevSlide = () => {
    if (isAnimatingRef.current || safeRawImages.length <= 1) return;
    resetTimer();
    isAnimatingRef.current = true;
    setCurrentIndex((prev) => prev - 1);
  };

  const nextSlide = () => {
    if (isAnimatingRef.current || safeRawImages.length <= 1) return;
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
      // Dead simple: each slide is 100% wide, just move by 100% per slide
      const offset = currentIndex * 100;
      sliderRef.current.style.transform = `translateX(-${offset}%)`;
    }
  }, [currentIndex]);

  const handleTransitionEnd = () => {
    if (currentIndex === 0) {
      setCurrentIndex(safeRawImages.length);
      if (sliderRef.current) {
        sliderRef.current.style.transition = "none";
        sliderRef.current.style.transform = `translateX(-${safeRawImages.length * 100}%)`;
        void sliderRef.current.offsetWidth;
        sliderRef.current.style.transition = "transform 700ms ease-in-out";
      }
    } else if (currentIndex === safeRawImages.length + 1) {
      setCurrentIndex(1);
      if (sliderRef.current) {
        sliderRef.current.style.transition = "none";
        sliderRef.current.style.transform = `translateX(-100%)`;
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
        <div className="text-center mb-8 w-full">
          <h2 className="text-3xl font-bold text-white mb-4 w-full">{t("title")}</h2>
          <p className="text-lg text-blue-300 font-medium mb-4 w-full">{t("subtitle")}</p>
          <div className="max-w-xl mx-auto px-6 py-4 bg-gray-900/20 rounded-lg border border-gray-700/30" style={{maxWidth: '500px', whiteSpace: 'normal', wordBreak: 'normal', width: 'auto', display: 'block'}}>
            <p className="text-gray-300 leading-relaxed" style={{whiteSpace: 'normal', wordBreak: 'normal', width: 'auto', display: 'block'}}>{t("description")}</p>
          </div>
        </div>
        <div className="text-center py-12 w-full">
          <p className="text-gray-500 w-full">No images available yet</p>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn duration={100}>
      {/* Header Section */}
      <div className="text-center mb-8 w-full">
        <h2 className="text-3xl font-bold text-white mb-4 w-full">{t("title")}</h2>
        <p className="text-lg text-blue-300 font-medium mb-4 w-full">{t("subtitle")}</p>
        <div className="max-w-xl mx-auto px-6 py-4 bg-gray-900/20 rounded-lg border border-gray-700/30" style={{maxWidth: '500px', whiteSpace: 'normal', wordBreak: 'normal', width: 'auto', display: 'block'}}>
          <p className="text-gray-300 leading-relaxed" style={{whiteSpace: 'normal', wordBreak: 'normal', width: 'auto', display: 'block'}}>{t("description")}</p>
        </div>
      </div>

          {/* Simple reliable carousel with side preview */}
          <div className="relative w-full pb-16 overflow-hidden">
            <div className="relative w-full max-w-6xl mx-auto">
              <div
                className="relative overflow-hidden rounded-xl"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  ref={sliderRef}
                  className="flex transition-transform duration-700 ease-in-out"
                  onTransitionEnd={handleTransitionEnd}
                >
                  {images.map((src, index) => (
                    <div 
                      key={index} 
                      className="flex-shrink-0 w-full h-64 md:h-96 lg:h-[32rem]"
                    >
                      <div className="w-full h-full rounded-xl overflow-hidden border border-white/15 shadow-lg mx-2">
                        <img 
                          src={src} 
                          alt={`Event slide ${index}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            console.error('Image failed to load:', src);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  ))}
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
