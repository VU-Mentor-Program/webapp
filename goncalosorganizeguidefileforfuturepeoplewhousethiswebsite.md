# website organization guide by goncalo 

hey future people who will work on this website. this is goncalo and i organized this mess so you dont have to suffer like we did

## basic structure 

```
src/
├── components/     all the ui pieces
├── routes/         pages (home, events, chess, etc)
├── mentorschess/   the chess page: daily puzzle, offline game, bot engine
├── assets/         logos and images 
├── translations/   english and dutch text
├── data/           team info and stuff
└── utils/          random helper functions

public/
└── assets/images/  all the pictures organized by type
    ├── team/       mentor photos
    ├── events/     event galleries 
    └── logos/      logo variations
```

## how to add new events (the easy way)

1. dump your images in `public/assets/images/events/[event-name]/`

2. edit `src/assets/images/index.ts` and add your gallery:
```
newEvent: {
  title: "your_event_title",
  description: "your_event_desc", 
  images: [
    '/webapp/assets/images/events/your-event/pic1.png',
    '/webapp/assets/images/events/your-event/pic2.png',
  ],
},
```

3. add translations in `src/translations/en.json` and `src/translations/nl.json`:
```
"your_event_title": "Cool Event Name",
"your_event_desc": "description of what happened"
```

done. the page updates automatically

## adding new team members

edit `src/data/mentorTeam.ts` and `src/assets/images/index.ts` 

put their photo in `public/assets/images/team/name.png`

## changing text on pages

all text is in `src/translations/en.json` and `src/translations/nl.json`

never hardcode text in components. always use the translation system so dutch people can read it too

## mentors chess (the old minigames page)

`#/chess` lives in `src/mentorschess/`. everything runs in the browser, no servers, no apis:

- `puzzle/` daily puzzle. the puzzles are bundled in `puzzle/puzzles.json` (7 difficulty buckets, monday easy -> sunday hard). to refresh the set run `npm run puzzles` (downloads the free lichess puzzle database once, ~300mb, then picks new puzzles)
- `game/` offline game. `engine.worker.ts` is our own little bot (alpha-beta search), the difficulty slider maps to levels 1-10 in there
- `board/` the chessboard component + piece svgs

streak and in-progress games are saved in localStorage only. the old minigames were deleted in 2026 (check git history if you ever want them back)

## css and styling

we use tailwind. if you dont know tailwind learn it first

custom styles are in `src/styles/theme.css` for colors and spacing

## important files

- `src/App.tsx` - adds new pages/routes
- `src/components/header.tsx` - navigation links
- `src/assets/images/index.ts` - all image paths
- `src/translations/*.json` - all text content

## building and deploying

```
npm run build    # test if it works
npm run deploy   # pushes to github pages
```

## things not to break

- dont delete the accept/decline routes. they handle event responses
- dont mess with the api stuff in utils 
- keep the existing folder structure unless you have a better idea , really you can do what you think is best after im gone , thanks 


## if something is broken

1. check console for errors
2. run `npm run build` to see typescript complaints  
3. check if image paths are correct
4. ask someone who knows react if youre lost

thats it. keep it simple and dont overthink it 

-- goncalo
