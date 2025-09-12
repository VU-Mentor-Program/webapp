import React from 'react';

interface BackgroundMusicProps {
  volume?: number;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ volume = 0.1 }) => {
  // This component is now minimal - just provides compatibility
  // All music controls are handled by AudioControlButton components
  return null;
};