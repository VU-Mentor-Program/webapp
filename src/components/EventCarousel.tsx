import React, { useState, useEffect, useRef } from "react";
import FadeIn from "./Fadein-Wrapper";
import LazyImage from "./LazyImage";

interface EventCarouselProps {
  images: readonly string[];
  title: string;
  subtitle?: string;
  description: string;
  autoPlay?: boolean;
  showIndicators?: boolean;
  className?: string;
}

const EventCarousel: React.FC<EventCarouselProps> = ({
  images,
  title,
  subtitle,
  description,
  autoPlay = true,
  showIndicators = true,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const sliderRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>();
  const isAnimatingRef = useRef(false);

  const touchStartXRef = useRef<number>(0);
  const touchEndXRef = useRef<number>(0);
  const minSwipeDistance = 50;

  // Create infinite loop array
  const infiniteImages = [
    images[images.length - 1],
    ...images,
    images[0],
  ];

  const slideWidthPercentage = 85;

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoPlay && images.length > 1) {
      timerRef.current = window.setInterval(() => {
        nextSlide();
      }, 5000); // 5 seconds for events
    }
  };

  const prevSlide = () => {
    if (isAnimatingRef.current || images.length <= 1) return;
    resetTimer();
    isAnimatingRef.current = true;
    setCurrentIndex((prev) => prev - 1);
  };

  const nextSlide = () => {
    if (isAnimatingRef.current || images.length <= 1) return;
    resetTimer();
    isAnimatingRef.current = true;
    setCurrentIndex((prev) => prev + 1);
  };

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [autoPlay, images.length]);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${currentIndex * slideWidthPercentage}%)`;
    }
  }, [currentIndex]);

  const handleTransitionEnd = () => {
    if (currentIndex === 0) {
      setCurrentIndex(images.length);
      if (sliderRef.current) {
        sliderRef.current.style.transition = "none";
        sliderRef.current.style.transform = `translateX(-${images.length * slideWidthPercentage}%)`;
        void sliderRef.current.offsetWidth;
        sliderRef.current.style.transition = "transform 600ms ease-in-out";
      }
    } else if (currentIndex === images.length + 1) {
      setCurrentIndex(1);
      if (sliderRef.current) {
        sliderRef.current.style.transition = "none";
        sliderRef.current.style.transform = `translateX(-${slideWidthPercentage}%)`;
        void sliderRef.current.offsetWidth;
        sliderRef.current.style.transition = "transform 600ms ease-in-out";
      }
    }
    isAnimatingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (isAnimatingRef.current || images.length <= 1) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > minSwipeDistance) nextSlide();
    else if (distance < -minSwipeDistance) prevSlide();
  };

  const goToSlide = (index: number) => {
    if (!isAnimatingRef.current && images.length > 1) {
      resetTimer();
      setCurrentIndex(index + 1);
    }
  };

  if (!images.length) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        {subtitle && (
          <p className="text-lg text-blue-300 font-medium mb-3">{subtitle}</p>
        )}
        <p className="text-gray-400 mb-4">{description}</p>
        <p className="text-gray-500">No images available yet</p>
      </div>
    );
  }

  return (
    <FadeIn duration={100} className={`w-full ${className}`}>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        {subtitle && (
          <p className="text-lg text-blue-300 font-medium mb-3">{subtitle}</p>
        )}
        <p className="text-gray-300 max-w-2xl mx-auto">{description}</p>
      </div>

      <div className="relative w-full max-w-5xl mx-auto">
        <div
          className="overflow-hidden rounded-xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={sliderRef}
            className="flex transition-transform duration-600 ease-in-out"
            style={{ gap: "1rem" }}
            onTransitionEnd={handleTransitionEnd}
          >
            {infiniteImages.map((src, index) => {
              const isCenterImage = index === currentIndex;
              const isVisible = Math.abs(index - currentIndex) <= 1;
              
              return (
                <div 
                  key={index} 
                  className={`flex-shrink-0 w-[85%] transition-all duration-600 ease-in-out ${
                    isCenterImage 
                      ? 'h-80 scale-105 opacity-100 z-10' 
                      : 'h-72 scale-95 opacity-75 z-5'
                  } ${isVisible ? 'shadow-xl' : 'opacity-40'}`}
                >
                  <div className={`w-full h-full rounded-xl overflow-hidden ${
                    isCenterImage 
                      ? 'border-2 border-white/30 shadow-2xl' 
                      : 'border border-white/20 shadow-lg'
                  }`}>
                    <LazyImage 
                      src={src} 
                      alt={`${title} - Image ${(index % images.length) + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons - only show if more than one image */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute top-1/2 -left-6 transform -translate-y-1/2 z-20
                         bg-white/10 backdrop-blur-md text-white p-3 rounded-full 
                         hover:bg-white/20 hover:scale-110 transition-all duration-300
                         border border-white/20 shadow-lg hover:shadow-xl
                         focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 -right-6 transform -translate-y-1/2 z-20
                         bg-white/10 backdrop-blur-md text-white p-3 rounded-full 
                         hover:bg-white/20 hover:scale-110 transition-all duration-300
                         border border-white/20 shadow-lg hover:shadow-xl
                         focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Slide indicators - only show if more than one image and showIndicators is true */}
        {images.length > 1 && showIndicators && (
          <div className="flex justify-center mt-6 space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index + 1 === currentIndex
                    ? 'bg-white scale-125 shadow-md'
                    : 'bg-white/50 hover:bg-white/70 hover:scale-110'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </FadeIn>
  );
};

export default EventCarousel;
