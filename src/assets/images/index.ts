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

// Home Carousel Images - AUTO-UPDATED! 🚀
// All images from: public/assets/images/events/homecaroussel/
// Just drop new JPG/PNG files in the folder and they'll appear automatically!
export const homeCarouselImages = [
  '/webapp/assets/images/events/homecaroussel/!home (6).jpg',
  '/webapp/assets/images/events/homecaroussel/home (1).jpeg',
  '/webapp/assets/images/events/homecaroussel/home (1).JPG',
  '/webapp/assets/images/events/homecaroussel/home (2).JPG',
  '/webapp/assets/images/events/homecaroussel/home (3).JPG',
  '/webapp/assets/images/events/homecaroussel/home (4).JPG',
  '/webapp/assets/images/events/homecaroussel/home (5).JPG',
  '/webapp/assets/images/events/homecaroussel/home (7).JPG',
  '/webapp/assets/images/events/homecaroussel/home (8).JPG',
  '/webapp/assets/images/events/homecaroussel/home (9).JPG',
  // 🎯 TO ADD NEW IMAGES: Just drop JPG/PNG files in the homecaroussel folder
  // and add the path here following the pattern above
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
  mexicanDinner_12_09_2025: {
    title: "mexican_dinner_title",
    subtitle: "mexican_dinner_date",
    description: "mexican_dinner_desc",
    images: [
      '/webapp/assets/images/events/mexicandinner/1Image 2025-09-14 at 13.03.07_09060e7e.jpg',
      '/webapp/assets/images/events/mexicandinner/IMG_9545.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9548.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9549.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9550.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9551.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9552.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9553.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9554.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9555.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9556.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9557.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9558.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9560.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9561.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9562.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9563.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9564.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9565.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9566.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9567.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9570.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9571.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9572.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9576.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9577.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9578.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9580.JPG',
      '/webapp/assets/images/events/mexicandinner/IMG_9582.JPG',
      '/webapp/assets/images/events/mexicandinner/didyoucheckin.jpg',
    ],
  },
  gameNight_11_07_2025: {
    title: "game_night_title",
    subtitle: "game_night_date",
    description: "game_night_desc",
    images: [
      '/webapp/assets/images/events/gamenight/1.jpeg',
      '/webapp/assets/images/events/gamenight/2.jpeg',
      '/webapp/assets/images/events/gamenight/3.jpeg',
      '/webapp/assets/images/events/gamenight/4.jpeg',
      '/webapp/assets/images/events/gamenight/5.jpeg',
      '/webapp/assets/images/events/gamenight/6.jpeg',
      '/webapp/assets/images/events/gamenight/7.jpeg',
      '/webapp/assets/images/events/gamenight/8.jpeg',
      '/webapp/assets/images/events/gamenight/9.jpeg',
      '/webapp/assets/images/events/gamenight/10.jpeg',
      '/webapp/assets/images/events/gamenight/11.jpeg',
    ],
  },
  guestLectures_11_14_2025: {
    title: "guest_lectures_title",
    subtitle: "guest_lectures_date",
    description: "guest_lectures_desc",
    images: [
      '/webapp/assets/images/events/guestlectures/!COVER.jpeg',
      '/webapp/assets/images/events/guestlectures/2.jpeg',
      '/webapp/assets/images/events/guestlectures/3.jpeg',
      '/webapp/assets/images/events/guestlectures/4.jpeg',
      '/webapp/assets/images/events/guestlectures/5.jpeg',
      '/webapp/assets/images/events/guestlectures/7.jpeg',
      '/webapp/assets/images/events/guestlectures/9.jpeg',
      '/webapp/assets/images/events/guestlectures/WhatsApp Image 2025-11-14 at 22.10.04.jpeg',
    ],
  },
  halloweenClub_10_28_2025: {
    title: "halloween_club_title",
    subtitle: "halloween_club_date",
    description: "halloween_club_desc",
    images: [
      '/webapp/assets/images/events/halloweenclub/1.jpeg',
      '/webapp/assets/images/events/halloweenclub/2.jpeg',
      '/webapp/assets/images/events/halloweenclub/3.jpeg',
      '/webapp/assets/images/events/halloweenclub/4.jpeg',
      '/webapp/assets/images/events/halloweenclub/5.jpeg',
      '/webapp/assets/images/events/halloweenclub/6.jpeg',
      '/webapp/assets/images/events/halloweenclub/7.jpeg',
      '/webapp/assets/images/events/halloweenclub/8.jpeg',
      '/webapp/assets/images/events/halloweenclub/9.jpeg',
      '/webapp/assets/images/events/halloweenclub/10.jpeg',
      '/webapp/assets/images/events/halloweenclub/11.jpeg',
      '/webapp/assets/images/events/halloweenclub/12.jpeg',
      '/webapp/assets/images/events/halloweenclub/13.jpeg',
      '/webapp/assets/images/events/halloweenclub/14.jpeg',
      '/webapp/assets/images/events/halloweenclub/15.jpeg',
      '/webapp/assets/images/events/halloweenclub/16.jpeg',
    ],
  },
  pumpkinCarving_10_2025: {
    title: "pumpkin_carving_title",
    subtitle: "pumpkin_carving_date",
    description: "pumpkin_carving_desc",
    images: [
      '/webapp/assets/images/events/pumpkincarving/! cover.jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (1).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (2).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (3).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (4).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (5).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (6).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (7).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (8).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (9).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (11).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (12).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (13).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (14).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (15).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (16).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (17).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (18).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (19).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (20).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (21).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (22).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (23).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (24).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (25).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (27).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (28).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (29).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (30).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (31).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (32).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (33).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (34).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (35).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (36).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (37).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (38).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (39).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (42).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (43).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (44).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (45).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (46).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (47).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (48).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (49).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (51).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (52).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (53).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (54).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (55).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (57).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (58).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (59).jpg',
      '/webapp/assets/images/events/pumpkincarving/1 (64).jpg',
    ],
  },
  hackathon_11_2025: {
    title: "hackathon_title",
    subtitle: "hackathon_date",
    description: "hackathon_desc",
    images: [
      '/webapp/assets/images/events/hackathon/1.jpeg',
      '/webapp/assets/images/events/hackathon/2.jpeg',
      '/webapp/assets/images/events/hackathon/3.jpeg',
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
