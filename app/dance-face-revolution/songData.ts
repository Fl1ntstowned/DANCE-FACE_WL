export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration?: number; // Will be set dynamically
  genre: string;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
    extreme: number;
  };
  file: string;
}

// Tutorial track only for development
const tutorialTrack: Song = {
  id: 'tutorial',
  title: 'Tutorial Track',
  artist: 'DanceFace',
  bpm: 120,
  genre: 'Tutorial',
  difficulty: { easy: 1, medium: 2, hard: 3, extreme: 4 },
  file: '/Untitled video - Made with Clipchamp.m4a'
};

// Main song list
const mainSongs: Song[] = [
  {
    id: '1988',
    title: '1988',
    artist: 'Ruzer',
    bpm: 128,
    genre: 'Electronic',
    difficulty: { easy: 3, medium: 5, hard: 7, extreme: 9 },
    file: '/ES_1988 - Ruzer.mp3'
  },
  {
    id: 'could-have-been',
    title: 'Could Have Been Your Friend',
    artist: 'spring gang',
    bpm: 125,
    genre: 'Pop',
    difficulty: { easy: 2, medium: 4, hard: 6, extreme: 8 },
    file: '/ES_Could Have Been Your Friend - spring gang.mp3'
  },
  {
    id: 'danc3',
    title: 'Danc3',
    artist: 'rh3a bluu',
    bpm: 130,
    genre: 'Dance',
    difficulty: { easy: 3, medium: 5, hard: 7, extreme: 9 },
    file: '/ES_Danc3 - rh3a bluu.mp3'
  },
  {
    id: 'emotion',
    title: 'E-Motion',
    artist: 'Cackie Jhen',
    bpm: 135,
    genre: 'Electronic',
    difficulty: { easy: 4, medium: 6, hard: 8, extreme: 10 },
    file: '/ES_E-Motion - Cackie Jhen.mp3'
  },
  {
    id: 'feel-like',
    title: 'Feel Like',
    artist: 'Heyson',
    bpm: 122,
    genre: 'Chill',
    difficulty: { easy: 2, medium: 4, hard: 6, extreme: 7 },
    file: '/ES_Feel Like - Heyson.mp3'
  },
  {
    id: 'funky',
    title: "I'm so Funky",
    artist: 'Peachwood',
    bpm: 116,
    genre: 'Funk',
    difficulty: { easy: 2, medium: 4, hard: 6, extreme: 8 },
    file: "/ES_I'm so Funky - Peachwood.mp3"
  },
  {
    id: 'last-summer',
    title: 'Last Summer',
    artist: 'Akibakid',
    bpm: 124,
    genre: 'Summer',
    difficulty: { easy: 2, medium: 4, hard: 6, extreme: 8 },
    file: '/ES_Last Summer - Akibakid.mp3'
  },
  {
    id: 'talk-about-ex',
    title: "Let's Talk About Your Ex (Remix)",
    artist: 'jeonghyeon',
    bpm: 126,
    genre: 'Pop',
    difficulty: { easy: 3, medium: 5, hard: 7, extreme: 9 },
    file: "/ES_Let's Talk About Your Ex (jeonghyeon  Remix) (Instrumental Version) - jeonghyeon.mp3"
  },
  {
    id: 'me-vs-world',
    title: 'Me Vs. World',
    artist: 'MV Archives',
    bpm: 132,
    genre: 'Rock',
    difficulty: { easy: 3, medium: 5, hard: 8, extreme: 10 },
    file: '/ES_Me Vs. World - MV Archives.mp3'
  },
  {
    id: 'neon-lights',
    title: 'Neon Lights',
    artist: 'Trinity',
    bpm: 140,
    genre: 'Synthwave',
    difficulty: { easy: 4, medium: 6, hard: 8, extreme: 10 },
    file: '/ES_Neon Lights - Trinity.mp3'
  },
  {
    id: 'night-drive',
    title: 'Night Drive to Hell',
    artist: 'Ruzer',
    bpm: 138,
    genre: 'Dark Electronic',
    difficulty: { easy: 4, medium: 6, hard: 9, extreme: 10 },
    file: '/ES_Night Drive to Hell - Ruzer.mp3'
  },
  {
    id: 'planet-rave',
    title: 'pLaNeT rAvE',
    artist: 'Cackie Jhen',
    bpm: 145,
    genre: 'Rave',
    difficulty: { easy: 5, medium: 7, hard: 9, extreme: 10 },
    file: '/ES_pLaNeT rAvE - Cackie Jhen.mp3'
  },
  {
    id: 'ribbon-sky',
    title: 'Ribbon of the Sky',
    artist: 'Cackie Jhen',
    bpm: 128,
    genre: 'Ambient',
    difficulty: { easy: 2, medium: 4, hard: 6, extreme: 8 },
    file: '/ES_Ribbon of the Sky - Cackie Jhen.mp3'
  },
  {
    id: 'rush',
    title: 'Rush',
    artist: 'Blue Saga',
    bpm: 150,
    genre: 'Hardcore',
    difficulty: { easy: 5, medium: 7, hard: 9, extreme: 10 },
    file: '/ES_Rush - Blue Saga.mp3'
  },
  {
    id: 'supernovas',
    title: 'Supernovas',
    artist: 'Hallman',
    bpm: 128,
    genre: 'Electronic',
    difficulty: { easy: 3, medium: 5, hard: 7, extreme: 9 },
    file: '/ES_Supernovas (Instrumental Version) - Hallman.mp3'
  },
  {
    id: 'universe-grass',
    title: "Universe in Every Blade of Grass",
    artist: 'Everything',
    bpm: 120,
    genre: 'Ambient',
    difficulty: { easy: 2, medium: 3, hard: 5, extreme: 7 },
    file: "/ES_There's a Universe in Every Blade of Grass - Everything..mp3"
  },
  {
    id: 'thrust',
    title: 'Thrust',
    artist: 'Aleph One',
    bpm: 142,
    genre: 'Techno',
    difficulty: { easy: 4, medium: 6, hard: 8, extreme: 10 },
    file: '/ES_Thrust - Aleph One.mp3'
  },
  {
    id: 'xtra',
    title: 'Xtra',
    artist: 'rh3a bluu',
    bpm: 134,
    genre: 'Electronic',
    difficulty: { easy: 3, medium: 5, hard: 7, extreme: 9 },
    file: '/ES_Xtra - rh3a bluu.mp3'
  }
];

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' ||
                      (typeof window !== 'undefined' &&
                       (window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1'));

// Export songs with tutorial track in development, without in production
export const songs: Song[] = isDevelopment
  ? [tutorialTrack, ...mainSongs]
  : mainSongs;