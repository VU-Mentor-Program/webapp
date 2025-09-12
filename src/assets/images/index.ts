// Centralized image path constants for better organization and maintenance
// This file acts as an index for all image paths used throughout the application

// Import existing logos from src/assets (parent directory)
import mpLogoPrimary from '../mp_logo.png';
import mpLogoCircle from '../mp_logo-CIRCLE.png';
import blackLogo from '../black_logo.png';

// Export the logo imports
export { mpLogoPrimary, mpLogoCircle, blackLogo };

// Event Images - now properly organized in events folder
export const eventImages = {
  studySession1: '/assets/images/events/studysession/studysession1.png',
  studySession2: '/assets/images/events/studysession/studysession2.png',
} as const;

// Event galleries - easy to extend with new events
export const eventGalleries = {
  studySession_10_09_2024: {
    title: "study_sessions_title", 
    subtitle: "study_sessions_date",
    description: "study_sessions_desc",
    images: [
      '/assets/images/events/studysession/studysession1.png',
      '/assets/images/events/studysession/studysession2.png',
    ],
  },
  // Easy to add new event categories:
  // socialEvents: {
  //   title: "social_events",
  //   description: "social_events_desc",
  //   images: [
  //     '/webapp/assets/images/events/social/event1.png',
  //     '/webapp/assets/images/events/social/event2.png',
  //   ],
  // },
  // workshops: {
  //   title: "workshops", 
  //   description: "workshops_desc",
  //   images: [
  //     '/webapp/assets/images/events/workshops/workshop1.png',
  //   ],
  // },
} as const;

// Team Photos - now properly organized in team folder
export const teamPhotos = {
  vitor: '/assets/images/team/vitor.png',
  noor: '/assets/images/team/noor.png',
  goncalo: '/assets/images/team/goncalo.png',
  nox: '/assets/images/team/nox.png',
  anastasia: '/assets/images/team/anastasia.png',
  mariana: '/assets/images/team/mariana.png',
  amina: '/assets/images/team/amina.png',
  defaultPerson: '/assets/images/team/default person.jpg',
} as const;

// Asset organization paths - now implemented!
export const ASSET_PATHS = {
  images: {
    events: '/assets/images/events/',
    team: '/assets/images/team/',
    logos: '/assets/images/logos/',
  },
  sounds: {
    games: '/assets/sounds/games/',
  },
} as const;

// Organized logo paths
export const logoImages = {
  primary: '/assets/images/logos/mp_logo-CIRCLE.png',
  black: '/assets/images/logos/black_logo.png',
} as const;
