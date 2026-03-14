import React, { useState, useEffect, useRef, useMemo } from "react";
import FadeIn from "./Fadein-Wrapper";
import { ImageModal } from "./ImageModal";

// Import organized image constants
import { homeCarouselImages } from '../assets/images';
import { useTranslations } from '../contexts/TranslationContext';

const HomeCarousel: React.FC = () => {
  const t = useTranslations("home_carousel");

  // Image data — useMemo so it's only computed once, but lives inside the component
  const safeRawImages = useMemo(() => [...homeCarouselImages].filter(Boolean), []);
  const images = useMemo(() =>
    safeRawImages.length > 0
      ? [safeRawImages[safeRawImages.length - 1], ...safeRawImages, safeRawImages[0]]
      : [],
    [safeRawImages]
  );
  const [currentIndex, setCurrentIndex] = useState(1);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState<number>(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>();
  const isAnimatingRef = useRef(false); // Prevent rapid clicks

  const touchStartXRef = useRef<number>(0);
  const touchEndXRef = useRef<number>(0);
  const minSwipeDistance = 50; // pixels

  // Simplified mobile-first approach - no complex calculations needed

  // Pause auto-play when modal is open (scroll lock handled by ImageModal)
  useEffect(() => {
    if (modalImage) {
      if (timerRef.current) clearInterval(timerRef.current); // Pause auto-play
    } else {
      resetTimer(); // Resume auto-play when modal closes
    }
  }, [modalImage]);

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




  // Preload all home carousel images on mount (only ~10 images, small after compression)
  useEffect(() => {
    safeRawImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Pause auto-play when tab is hidden, resume when visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current);
      } else if (!modalImage) {
        resetTimer(); // Only resume if modal isn't open
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [modalImage]);

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
      </div>

          {/* Simple reliable carousel with side preview */}
          <div className="relative w-full pb-16 overflow-hidden">
            <div className="relative w-full max-w-6xl mx-auto px-2">
              <div
                className="relative overflow-hidden rounded-xl -mx-2"
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
                      className="flex-shrink-0 w-full h-80 md:h-[28rem] lg:h-[36rem] px-2"
                    >
                      <div className="w-full h-full rounded-xl overflow-hidden border border-white/15 shadow-lg">
                        <img 
                          src={src} 
                          alt={`Event slide ${index}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onError={(e) => {
                            console.error('Image failed to load:', src);
                            e.currentTarget.style.display = 'none';
                          }}
                          onClick={() => {
                            // Calculate the actual image index (account for infinite scroll)
                            const actualIndex = index === 0 ? safeRawImages.length - 1 :
                                              index === safeRawImages.length + 1 ? 0 :
                                              index - 1;
                            setModalImageIndex(actualIndex);
                            setModalImage(src);
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
              className="absolute top-1/2 left-4 transform -translate-y-1/2 z-30
                         bg-black/40 backdrop-blur-md text-white p-3 rounded-full 
                         hover:bg-black/60 hover:scale-110 transition-all duration-300
                         border border-white/30 shadow-xl hover:shadow-2xl
                         focus:outline-none focus:ring-2 focus:ring-white/50
                         hidden md:block"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
        </button>
        <button
          onClick={nextSlide}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 z-30
                         bg-black/40 backdrop-blur-md text-white p-3 rounded-full 
                         hover:bg-black/60 hover:scale-110 transition-all duration-300
                         border border-white/30 shadow-xl hover:shadow-2xl
                         focus:outline-none focus:ring-2 focus:ring-white/50
                         hidden md:block"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
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

        {/* Modal for full image view using Portal */}
        {modalImage && (
          <ImageModal
            src={modalImage}
            alt="Full size image"
            onClose={() => setModalImage(null)}
            images={safeRawImages}
            currentIndex={modalImageIndex}
            onNavigate={(newIndex) => {
              setModalImageIndex(newIndex);
              setModalImage(safeRawImages[newIndex]);
            }}
          />
        )}
        </div>
      </div>
    </FadeIn>
  );
};

export default HomeCarousel;
