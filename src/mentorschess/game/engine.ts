// Mentors Chess bot — a small alpha-beta engine. Pure functions, no DOM: runs in the Web Worker
// (engine.worker.ts) and can be imported from Node for testing. chess.js provides the rules.
import { Chess, type Move, type PieceSymbol } from "chess.js";

export interface EngineRequest {
  id: number;
  fen: string;
  level: number; // 1..10
}

export interface EngineResponse {
  id: number;
  move: string | null; // UCI, e.g. "e7e8q"
}

interface LevelConfig {
  depth: number;
  timeMs: number;
  blunder: number; // probability of deliberately playing a weaker move
}

const LEVELS: LevelConfig[] = [
  { depth: 1, timeMs: 300, blunder: 0.35 },
  { depth: 1, timeMs: 400, blunder: 0.28 },
  { depth: 2, timeMs: 500, blunder: 0.21 },
  { depth: 2, timeMs: 700, blunder: 0.14 },
  { depth: 3, timeMs: 900, blunder: 0.07 },
  { depth: 3, timeMs: 1200, blunder: 0.03 },
  { depth: 4, timeMs: 1500, blunder: 0 },
  { depth: 4, timeMs: 1800, blunder: 0 },
  { depth: 5, timeMs: 1800, blunder: 0 },
  { depth: 5, timeMs: 2000, blunder: 0 },
];

const MATE = 100_000;
const INF = 1_000_000;
const QUIESCENCE_DEPTH = 4;

const PIECE_VALUE: Record<PieceSymbol, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

// Piece-square tables (Simplified Evaluation Function, white's perspective, a8 first).
// prettier-ignore
const PST: Record<Exclude<PieceSymbol, "k">, number[]> = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
};
// prettier-ignore
const KING_MIDDLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20,
];
// prettier-ignore
const KING_END = [
  -50,-40,-30,-20,-20,-30,-40,-50,
  -30,-20,-10,  0,  0,-10,-20,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-30,  0,  0,  0,  0,-30,-30,
  -50,-30,-30,-30,-30,-30,-30,-50,
];

class TimeUp extends Error {}

let nodes = 0;
let deadline = Number.POSITIVE_INFINITY;

const checkTime = () => {
  if ((++nodes & 511) === 0 && Date.now() > deadline) throw new TimeUp();
};

/** Static evaluation from the side-to-move's point of view (centipawns). */
export function evaluate(chess: Chess): number {
  const board = chess.board();
  let white = 0;
  let black = 0;
  let nonPawnMaterial = 0;
  const kings: { color: "w" | "b"; index: number }[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = board[row][col];
      if (!cell) continue;
      const whiteIndex = row * 8 + col; // a8 = 0 … h1 = 63
      if (cell.type === "k") {
        kings.push({ color: cell.color, index: cell.color === "w" ? whiteIndex : (7 - row) * 8 + col });
        continue;
      }
      const value = PIECE_VALUE[cell.type];
      if (cell.type !== "p") nonPawnMaterial += value;
      if (cell.color === "w") white += value + PST[cell.type][whiteIndex];
      else black += value + PST[cell.type][(7 - row) * 8 + col];
    }
  }

  const endgame = nonPawnMaterial <= 1300;
  const kingTable = endgame ? KING_END : KING_MIDDLE;
  for (const k of kings) {
    if (k.color === "w") white += kingTable[k.index];
    else black += kingTable[k.index];
  }

  const score = white - black;
  return chess.turn() === "w" ? score : -score;
}

function orderMoves(moves: Move[], preferred?: string): Move[] {
  const scoreOf = (m: Move) => {
    let s = 0;
    if (preferred && m.lan === preferred) s += 100_000;
    if (m.captured) s += 10 * PIECE_VALUE[m.captured] - PIECE_VALUE[m.piece];
    if (m.promotion) s += 800 + PIECE_VALUE[m.promotion];
    return s;
  };
  return moves
    .map((m) => ({ m, s: scoreOf(m) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.m);
}

function quiesce(chess: Chess, alpha: number, beta: number, depth: number): number {
  checkTime();
  // Fail-soft: always return a real evaluation, never the window edge, so root scores stay meaningful.
  const stand = evaluate(chess);
  if (stand >= beta) return stand;
  let best = stand;
  if (stand > alpha) alpha = stand;
  if (depth === 0) return best;

  const captures = orderMoves(chess.moves({ verbose: true }).filter((m) => m.captured || m.promotion));
  for (const m of captures) {
    chess.move(m);
    const score = -quiesce(chess, -beta, -alpha, depth - 1);
    chess.undo();
    if (score > best) best = score;
    if (score > alpha) alpha = score;
    if (alpha >= beta) break;
  }
  return best;
}

function search(chess: Chess, depth: number, alpha: number, beta: number, ply: number): number {
  checkTime();
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return chess.inCheck() ? -(MATE - ply) : 0;
  if (chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) return 0;
  if (depth === 0) return quiesce(chess, alpha, beta, QUIESCENCE_DEPTH);

  let best = -INF;
  for (const m of orderMoves(moves)) {
    chess.move(m);
    const score = -search(chess, depth - 1, -beta, -alpha, ply + 1);
    chess.undo();
    if (score > best) best = score;
    if (score > alpha) alpha = score;
    if (alpha >= beta) break;
  }
  return best;
}

export interface RankedMove {
  move: Move;
  score: number;
  /** False when the score is only an upper bound (the move was refuted by a null-window probe). */
  exact: boolean;
}

export interface RootResult {
  best: Move;
  ranked: RankedMove[];
}

/**
 * Principal-variation search at the root: the first (best-ordered) move gets a full window, every
 * other move is probed with a null window and only re-searched when it beats the current best.
 * That keeps alpha-beta pruning while still producing exact scores for the moves that matter.
 */
export function searchRoot(chess: Chess, depth: number, previousBest?: string): RootResult {
  const moves = orderMoves(chess.moves({ verbose: true }), previousBest);
  const ranked: RankedMove[] = [];
  let alpha = -INF;
  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    chess.move(m);
    let score: number;
    let exact = true;
    if (i === 0) {
      score = -search(chess, depth - 1, -INF, INF, 1);
    } else {
      score = -search(chess, depth - 1, -alpha - 1, -alpha, 1);
      if (score > alpha) score = -search(chess, depth - 1, -INF, -alpha, 1);
      else exact = false;
    }
    chess.undo();
    ranked.push({ move: m, score, exact });
    if (score > alpha) alpha = score;
  }
  ranked.sort((a, b) => (a.exact !== b.exact ? (a.exact ? -1 : 1) : b.score - a.score));
  return { best: ranked[0].move, ranked };
}

export function chooseMove(fen: string, level: number): string | null {
  const cfg = LEVELS[Math.min(LEVELS.length, Math.max(1, Math.round(level))) - 1];
  const chess = new Chess(fen);
  const legal = chess.moves({ verbose: true });
  if (legal.length === 0) return null;
  if (legal.length === 1) return legal[0].lan;

  nodes = 0;
  deadline = Date.now() + cfg.timeMs;

  // Deliberate weakness for low levels: sometimes a random move (very low) or a top-3 pick.
  if (Math.random() < cfg.blunder) {
    if (cfg.depth <= 1 && Math.random() < 0.5) {
      return legal[Math.floor(Math.random() * legal.length)].lan;
    }
    const shallow = searchRoot(chess, 1);
    const pool = shallow.ranked.slice(0, Math.min(3, shallow.ranked.length));
    return pool[Math.floor(Math.random() * pool.length)].move.lan;
  }

  let result: RootResult | null = null;
  for (let depth = 1; depth <= cfg.depth; depth++) {
    try {
      result = searchRoot(chess, depth, result?.best.lan);
    } catch (e) {
      if (e instanceof TimeUp) break;
      throw e;
    }
  }
  if (!result) return legal[0].lan;

  // Among near-equal best moves (exact scores only) pick randomly so games don't repeat.
  const top = result.ranked[0].score;
  const candidates = result.ranked.filter((r) => r.exact && r.score >= top - 10);
  return candidates[Math.floor(Math.random() * candidates.length)].move.lan;
}
