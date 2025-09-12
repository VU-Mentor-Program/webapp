// Centralized sound exports for better organization
// This organizes all game sounds used in minigames

// Flappy Bird Game Sounds
export const flappySounds = {
  die: '/src/assets/flappy_sounds/sfx_die.mp3',
  hit: '/src/assets/flappy_sounds/sfx_hit.mp3',
  point: '/src/assets/flappy_sounds/sfx_point.mp3',
  swooshing: '/src/assets/flappy_sounds/sfx_swooshing.mp3',
  wing: '/src/assets/flappy_sounds/sfx_wing.mp3',
} as const;

// Plinko Game Sounds  
export const plinkoSounds = {
  beep: '/src/assets/plinko_sounds/beep.mp3',
  drop: '/src/assets/plinko_sounds/drop.mp3',
  ping: '/src/assets/plinko_sounds/ping.mp3',
  ping2: '/src/assets/plinko_sounds/ping2.mp3',
  stop: '/src/assets/plinko_sounds/stop.mp3',
} as const;

// Sound utility functions
export const preloadSound = (url: string): HTMLAudioElement => {
  const audio = new Audio(url);
  audio.preload = 'auto';
  return audio;
};

export const playSound = (audio: HTMLAudioElement, volume = 0.5) => {
  audio.volume = volume;
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Silently fail if sound can't play (browser restrictions)
  });
};
