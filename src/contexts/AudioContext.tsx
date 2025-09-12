import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Global audio instance to ensure only one exists across the entire app
let globalAudio: HTMLAudioElement | null = null;
let globalAudioListeners: (() => void)[] = [];

interface AudioContextType {
  isPlaying: boolean;
  toggleMusic: () => void;
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
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize global audio instance only once
  useEffect(() => {
    if (!globalAudio) {
      globalAudio = new Audio('/webapp/assets/music/backroundsong.mp3');
      globalAudio.loop = true;
      globalAudio.volume = volume;
      globalAudio.preload = 'auto';
      
      // Set up event listeners for state synchronization
      const handlePlay = () => {
        globalAudioListeners.forEach(callback => callback());
      };
      const handlePause = () => {
        globalAudioListeners.forEach(callback => callback());
      };
      
      globalAudio.addEventListener('play', handlePlay);
      globalAudio.addEventListener('pause', handlePause);
      globalAudio.addEventListener('ended', handlePause);
    }

    // Register this component for state updates
    const updateState = () => {
      setIsPlaying(globalAudio ? !globalAudio.paused : false);
    };
    
    globalAudioListeners.push(updateState);
    updateState(); // Set initial state

    return () => {
      // Cleanup listener on unmount
      const index = globalAudioListeners.indexOf(updateState);
      if (index > -1) {
        globalAudioListeners.splice(index, 1);
      }
    };
  }, [volume]);

  const toggleMusic = () => {
    if (!globalAudio) return;

    if (isPlaying) {
      // Stop music completely
      globalAudio.pause();
    } else {
      // Start playing music (only when user explicitly clicks)
      globalAudio.play().catch((error) => {
        console.log('Failed to play background music:', error);
      });
    }
  };

  return (
    <AudioContext.Provider value={{ isPlaying, toggleMusic }}>
      {children}
    </AudioContext.Provider>
  );
};
