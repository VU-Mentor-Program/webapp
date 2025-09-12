import React, { useState, useEffect, useRef } from "react";
import FadeIn from "./Fadein-Wrapper";

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
  const [modalImage, setModalImage] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>();
  const isAnimatingRef = useRef(false);

  const touchStartXRef = useRef<number>(0);
  const touchEndXRef = useRef<number>(0);
  const minSwipeDistance = 50;

  // Handle body scroll lock when modal is open
  useEffect(() => {
    if (modalImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalImage]);

  // Create infinite loop array
  const infiniteImages = [
    images[images.length - 1],
    ...images,
    images[0],
  ];

  // Simplified mobile-first approach - no complex calculations needed

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoPlay && images.length > 1) {
      timerRef.current = window.setInterval(() => {
        nextSlide();
      }, 6000); // 6 seconds for events
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
      // Dead simple: each slide is 100% wide, just move by 100% per slide
      const offset = currentIndex * 100;
      sliderRef.current.style.transform = `translateX(-${offset}%)`;
    }
  }, [currentIndex]);

  const handleTransitionEnd = () => {
    if (currentIndex === 0) {
      setCurrentIndex(images.length);
      if (sliderRef.current) {
        sliderRef.current.style.transition = "none";
        sliderRef.current.style.transform = `translateX(-${images.length * 100}%)`;
        void sliderRef.current.offsetWidth;
        sliderRef.current.style.transition = "transform 600ms ease-in-out";
      }
    } else if (currentIndex === images.length + 1) {
      setCurrentIndex(1);
      if (sliderRef.current) {
        sliderRef.current.style.transition = "none";
        sliderRef.current.style.transform = `translateX(-100%)`;
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
      <div className={`text-center py-12 w-full ${className}`}>
        <h3 className="text-xl font-semibold mb-3 w-full">{title}</h3>
        {subtitle && (
          <p className="text-lg text-blue-300 font-medium mb-4 w-full">{subtitle}</p>
        )}
        <div className="max-w-2xl mx-auto px-6 py-3 bg-gray-900/20 rounded-lg border border-gray-700/30 mb-4">
          <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
        <p className="text-gray-500 w-full">No images available yet</p>
      </div>
    );
  }

  return (
    <FadeIn duration={100} className={`w-full ${className}`}>
      <div className="text-center mb-8 w-full">
        <h3 className="text-2xl font-bold text-white mb-3 w-full">{title}</h3>
        {subtitle && (
          <p className="text-lg text-blue-300 font-medium mb-4 w-full">{subtitle}</p>
        )}
        <div className="max-w-lg mx-auto px-6 py-3 bg-gray-900/20 rounded-lg border border-gray-700/30" style={{maxWidth: '450px', whiteSpace: 'normal', wordBreak: 'normal', width: 'auto', display: 'block'}}>
          <p className="text-gray-300 leading-relaxed" style={{whiteSpace: 'normal', wordBreak: 'normal', width: 'auto', display: 'block'}}>{description}</p>
        </div>
      </div>

          <div className="relative w-full max-w-5xl mx-auto px-2">
            <div
              className="overflow-hidden rounded-xl -mx-2"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                ref={sliderRef}
                className="flex transition-transform duration-600 ease-in-out"
                onTransitionEnd={handleTransitionEnd}
              >
                {infiniteImages.map((src, index) => (
                  <div 
                    key={index} 
                    className="flex-shrink-0 w-full h-72 md:h-96 lg:h-[28rem] px-2"
                  >
                    <div className="w-full h-full rounded-lg overflow-hidden border border-white/15 shadow-lg">
                      <img
                        src={src}
                        alt={`${title} ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onError={(e) => {
                          console.error('Event image failed to load:', src);
                          e.currentTarget.style.display = 'none';
                        }}
                        onClick={() => setModalImage(src)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

        {/* Navigation buttons - only show if more than one image */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 z-20
                         bg-black/40 backdrop-blur-md text-white p-3 rounded-full 
                         hover:bg-black/60 hover:scale-110 transition-all duration-300
                         border border-white/30 shadow-lg hover:shadow-xl
                         focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 z-20
                         bg-black/40 backdrop-blur-md text-white p-3 rounded-full 
                         hover:bg-black/60 hover:scale-110 transition-all duration-300
                         border border-white/30 shadow-lg hover:shadow-xl
                         focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
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

        {/* Modal for full image view */}
        {modalImage && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModalImage(null)}
          >
            <div className="relative max-w-7xl max-h-full">
              <img
                src={modalImage}
                alt="Full size image"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setModalImage(null)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </FadeIn>
  );
};

export default EventCarousel;
