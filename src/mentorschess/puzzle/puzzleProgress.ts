import { previousDayKey } from "./selectDailyPuzzle";

const STORAGE_KEY = "mentorsChessPuzzle";

export interface TodayState {
  day: string;
  attempts: number;
  solved: boolean;
  revealed: boolean;
}

export interface PuzzleProgress {
  lastSolvedDay: string | null;
  streak: number;
  bestStreak: number;
  today: TodayState | null;
}

const EMPTY: PuzzleProgress = { lastSolvedDay: null, streak: 0, bestStreak: 0, today: null };

export function loadProgress(): PuzzleProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<PuzzleProgress>;
    return {
      lastSolvedDay: parsed.lastSolvedDay ?? null,
      streak: parsed.streak ?? 0,
      bestStreak: parsed.bestStreak ?? 0,
      today: parsed.today ?? null,
    };
  } catch {
    return EMPTY;
  }
}

function save(progress: PuzzleProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // storage unavailable (private mode etc.) — progress just won't persist
  }
}

/** Ensures `today` refers to the given day, resetting stale state from a previous day. */
export function todayFor(progress: PuzzleProgress, day: string): TodayState {
  return progress.today?.day === day ? progress.today : { day, attempts: 0, solved: false, revealed: false };
}

export function recordAttempt(day: string): PuzzleProgress {
  const p = loadProgress();
  const today = todayFor(p, day);
  const next = { ...p, today: { ...today, attempts: today.attempts + 1 } };
  save(next);
  return next;
}

export function markRevealed(day: string): PuzzleProgress {
  const p = loadProgress();
  const next = { ...p, today: { ...todayFor(p, day), revealed: true } };
  save(next);
  return next;
}

export function markSolved(day: string): PuzzleProgress {
  const p = loadProgress();
  const today = todayFor(p, day);
  if (today.solved) return p;

  let { streak, lastSolvedDay } = p;
  if (!today.revealed) {
    if (lastSolvedDay === previousDayKey(day)) streak += 1;
    else if (lastSolvedDay !== day) streak = 1;
    lastSolvedDay = day;
  }

  const next: PuzzleProgress = {
    lastSolvedDay,
    streak,
    bestStreak: Math.max(p.bestStreak, streak),
    today: { ...today, solved: true },
  };
  save(next);
  return next;
}

/** The streak to display: still alive if solved today or yesterday, otherwise 0. */
export function currentStreak(progress: PuzzleProgress, day: string): number {
  const last = progress.lastSolvedDay;
  if (last === day || last === previousDayKey(day)) return progress.streak;
  return 0;
}
