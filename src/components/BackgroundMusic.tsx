import React, { useEffect, useRef, useState } from 'react';

interface BackgroundMusicProps {
  volume?: number;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ volume = 0.1 }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.volume = isMuted ? 0 : volume;
    audio.preload = 'auto';

    // Auto-play when component mounts (with user interaction consideration)
    const startAudio = () => {
      if (audio && !isPlaying) {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Silently fail if autoplay is blocked
          console.log('Background music autoplay blocked by browser');
        });
      }
    };

    // Try to start audio on first user interaction
    const handleFirstInteraction = () => {
      startAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [volume, isPlaying, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        console.log('Failed to play background music');
      });
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/webapp/assets/music/backroundsong.mp3"
        preload="auto"
        loop
      />
      
      {/* Music Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={toggleMute}
          className="bg-gray-800/80 hover:bg-gray-700/80 text-white p-2 rounded-full transition-colors duration-200 backdrop-blur-sm"
          title={isMuted ? "Unmute background music" : "Mute background music"}
        >
          {isMuted ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.97 13.5H3.5a1 1 0 01-1-1v-3a1 1 0 011-1h1.47l3.413-3.293a1 1 0 011.617.793zM13.5 8.293l2.207-2.207a1 1 0 011.414 1.414L15.914 9.5l1.207 1.207a1 1 0 01-1.414 1.414L13.5 10.914l-1.207 1.207a1 1 0 01-1.414-1.414L12.086 9.5l-1.207-1.207a1 1 0 011.414-1.414L13.5 8.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.97 13.5H3.5a1 1 0 01-1-1v-3a1 1 0 011-1h1.47l3.413-3.293a1 1 0 011.617.793zM12 8v3.765a2 2 0 002.243 1.99c.533-.066 1.757-.242 1.757-1.99V9.01c0-1.748-1.224-1.924-1.757-1.99A2 2 0 0012 8zm0-2v.5c.623-.316 1.5-.5 2-.5V5c0-2.761-3.104-4.5-5-4.5S4 2.239 4 5v.5c.5 0 1.377.184 2 .5V5c0-1.657 2.015-3 3-3s3 1.343 3 3z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <button
          onClick={togglePlay}
          className="bg-gray-800/80 hover:bg-gray-700/80 text-white p-2 rounded-full transition-colors duration-200 backdrop-blur-sm"
          title={isPlaying ? "Pause background music" : "Play background music"}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
};
