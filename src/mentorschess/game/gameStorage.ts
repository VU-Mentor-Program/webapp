import type { Color } from "../theme";

const STORAGE_KEY = "mentorsChessGame";

export type GameMode = "human" | "bot";

export interface SavedGame {
  pgn: string;
  mode: GameMode;
  level: number;
  humanColor: Color;
  orientation: Color;
}

export function loadGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedGame>;
    if (typeof parsed.pgn !== "string") return null;
    return {
      pgn: parsed.pgn,
      mode: parsed.mode === "bot" ? "bot" : "human",
      level: Math.min(10, Math.max(1, Number(parsed.level) || 4)),
      humanColor: parsed.humanColor === "b" ? "b" : "w",
      orientation: parsed.orientation === "b" ? "b" : "w",
    };
  } catch {
    return null;
  }
}

export function saveGame(game: SavedGame) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  } catch {
    // ignore — refresh just won't resume
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
