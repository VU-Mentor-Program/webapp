import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
  images?: readonly string[];
  currentIndex?: number;
  onNavigate?: (newIndex: number) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  src,
  alt,
  onClose,
  images = [],
  currentIndex = 0,
  onNavigate
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasMultipleImages = images.length > 1;

  // Create modal root if it doesn't exist
  useEffect(() => {
    let modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
    }

    // Prevent body scroll when modal is open
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Reset image loaded state when src changes
  useEffect(() => {
    setImageLoaded(false);
  }, [src]);

  // Close modal on Escape key, navigate with arrow keys
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (hasMultipleImages && onNavigate) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrevious();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onClose, hasMultipleImages, currentIndex, images.length]);

  const handlePrevious = () => {
    if (hasMultipleImages && onNavigate) {
      const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      onNavigate(newIndex);
    }
  };

  const handleNext = () => {
    if (hasMultipleImages && onNavigate) {
      const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
      onNavigate(newIndex);
    }
  };

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 2147483647,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: hasMultipleImages ? '60px 80px' : '40px',
        margin: 0,
      }}
      onClick={(e) => {
        // Only close if clicking the backdrop, not the image
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Navigation arrows - positioned in the padding area */}
      {hasMultipleImages && onNavigate && (
        <>
          {/* Previous button - positioned in left padding */}
          <button
            onClick={handlePrevious}
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              zIndex: 2147483648,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              target.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              target.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next button - positioned in right padding */}
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              zIndex: 2147483648,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              target.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              target.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Image container with close button and counter */}
      <div
        style={{
          position: 'relative',
          maxWidth: '100%',
          maxHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Loading indicator */}
        {!imageLoaded && (
          <div style={{
            position: 'absolute',
            color: 'white',
            fontSize: '18px',
            fontWeight: '500'
          }}>
            Loading...
          </div>
        )}

        <img
          src={src}
          alt={alt}
          onLoad={() => setImageLoaded(true)}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />

        {/* Image counter - positioned below image */}
        {hasMultipleImages && (
          <div
            style={{
              position: 'absolute',
              bottom: '-50px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return createPortal(modalContent, modalRoot);
};
