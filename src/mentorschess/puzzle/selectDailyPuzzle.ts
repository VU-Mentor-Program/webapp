import puzzleData from "./puzzles.json";

export interface Puzzle {
  id: string;
  /** Position before the opponent's setup move (Lichess convention). */
  fen: string;
  /** Space-separated UCI moves; moves[0] is the opponent's setup move. */
  moves: string;
  rating: number;
}

interface PuzzleFile {
  buckets: Puzzle[][];
}

const { buckets } = puzzleData as PuzzleFile;

const TIME_ZONE = "Europe/Amsterdam";

/** `YYYY-MM-DD` for the given instant, in Amsterdam local time (so the puzzle flips at local midnight). */
export function amsterdamDayKey(date: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

const parseDayKey = (dayKey: string) => {
  const [y, m, d] = dayKey.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

export const daysSinceEpoch = (dayKey: string) => Math.floor(parseDayKey(dayKey) / 86_400_000);

/** 0 = Monday … 6 = Sunday */
export const weekdayIndex = (dayKey: string) => (new Date(parseDayKey(dayKey)).getUTCDay() + 6) % 7;

export const previousDayKey = (dayKey: string) => {
  const d = new Date(parseDayKey(dayKey) - 86_400_000);
  return d.toISOString().slice(0, 10);
};

export interface DailyPuzzle {
  puzzle: Puzzle;
  dayKey: string;
  weekday: number;
}

/**
 * Deterministic: everyone gets the same puzzle on the same day.
 * Weekday chooses the difficulty bucket (Monday easiest → Sunday hardest);
 * the week number walks through that bucket.
 */
export function selectDailyPuzzle(dayKey: string = amsterdamDayKey()): DailyPuzzle {
  const weekday = weekdayIndex(dayKey);
  const bucket = buckets[Math.min(weekday, buckets.length - 1)];
  const week = Math.floor(daysSinceEpoch(dayKey) / 7);
  const puzzle = bucket[week % bucket.length];
  return { puzzle, dayKey, weekday };
}
