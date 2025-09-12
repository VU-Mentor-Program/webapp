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
  studySession1: '/webapp/assets/images/events/studysession/studysession1.png',
  studySession2: '/webapp/assets/images/events/studysession/studysession2.png',
} as const;

// Home Carousel Images - supports both JPG and PNG formats
// To add new images: 
// 1. Place JPG/PNG files in: public/assets/images/events/homecaroussel/
// 2. Add the path below (use correct extension: .jpg or .png)
export const homeCarouselImages = [
  '/webapp/assets/images/events/homecaroussel/IMG_4260.JPG',
  '/webapp/assets/images/events/homecaroussel/IMG_6402.JPG',
  '/webapp/assets/images/events/homecaroussel/IMG_6462.JPG',
  '/webapp/assets/images/events/homecaroussel/IMG_6479.JPG',
  // Add more images here - both .jpg and .png supported:
  // '/webapp/assets/images/events/homecaroussel/your-image.jpg',
  // '/webapp/assets/images/events/homecaroussel/another-image.png',
] as const;

// Event galleries - easy to extend with new events
export const eventGalleries = {
  studySession_10_09_2024: {
    title: "study_sessions_title", 
    subtitle: "study_sessions_date",
    description: "study_sessions_desc",
    images: [
      '/webapp/assets/images/events/studysession/studysession1.png',
      '/webapp/assets/images/events/studysession/studysession2.png',
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
  vitor: '/webapp/assets/images/team/vitor.png',
  noor: '/webapp/assets/images/team/noor.png',
  goncalo: '/webapp/assets/images/team/goncalo.png',
  nox: '/webapp/assets/images/team/nox.png',
  anastasia: '/webapp/assets/images/team/anastasia.png',
  mariana: '/webapp/assets/images/team/mariana.png',
  amina: '/webapp/assets/images/team/amina.png',
  defaultPerson: '/webapp/assets/images/team/default person.jpg',
} as const;

// Asset organization paths - now implemented!
export const ASSET_PATHS = {
  images: {
    events: '/webapp/assets/images/events/',
    team: '/webapp/assets/images/team/',
    logos: '/webapp/assets/images/logos/',
  },
  sounds: {
    games: '/webapp/assets/sounds/games/',
  },
} as const;

// Organized logo paths
export const logoImages = {
  primary: '/webapp/assets/images/logos/mp_logo-CIRCLE.png',
  black: '/webapp/assets/images/logos/black_logo.png',
} as const;
