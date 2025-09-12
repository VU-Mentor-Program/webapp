import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  toggleMusic: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
  volume?: number;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children, volume = 0.1 }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.volume = volume;
    audio.preload = 'auto';
    
    // No auto-play - music only starts when user clicks the button
  }, [volume]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      // Stop music completely
      audio.pause();
      setIsPlaying(false);
    } else {
      // Start playing music (only when user explicitly clicks)
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.log('Failed to play background music:', error);
        // You might want to show a user-friendly message here
      });
    }
  };

  return (
    <AudioContext.Provider value={{ isPlaying, toggleMusic, audioRef }}>
      <audio
        ref={audioRef}
        src="/webapp/assets/music/backroundsong.mp3"
        preload="auto"
        loop
      />
      {children}
    </AudioContext.Provider>
  );
};
