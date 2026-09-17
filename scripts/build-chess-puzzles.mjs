// Builds src/mentorschess/puzzle/puzzles.json from the Lichess open puzzle database (CC0).
//
//   npm run puzzles                      # downloads the DB (~300 MB) to your temp folder, then extracts
//   npm run puzzles -- path/to/lichess_db_puzzle.csv.zst   # reuse an already-downloaded copy
//
// Output: 7 difficulty buckets (Mon → Sun) × 60 puzzles, chosen with a fixed seed so re-runs are
// reproducible unless you change SEED or the filters below. Only the first part of the database is
// read — it stops as soon as every bucket has enough candidates.
import { createReadStream, createWriteStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { Decompress } from "fzstd";
import { Chess, validateFen } from "chess.js";

const DB_URL = "https://database.lichess.org/lichess_db_puzzle.csv.zst";
const SEED = 20262027;
const PER_BUCKET = 60;
const CANDIDATES_PER_BUCKET = 300;
const MAX_PLIES = 8;
const MIN_POPULARITY = 90;
const MIN_PLAYS = 1000;
const MAX_RATING_DEVIATION = 90;
// Monday → Sunday. Upper bounds are exclusive; last bucket is open-ended.
const BUCKET_UPPER_BOUNDS = [1000, 1200, 1400, 1600, 1800, 2000, Infinity];

const here = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = resolve(here, "../src/mentorschess/puzzle/puzzles.json");

async function ensureDatabase(argPath) {
  const target = argPath ? resolve(argPath) : join(tmpdir(), "lichess_db_puzzle.csv.zst");
  if (existsSync(target)) return target;
  console.log(`Downloading ${DB_URL}\n  → ${target}`);
  const res = await fetch(DB_URL);
  if (!res.ok || !res.body) throw new Error(`Download failed: ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(target));
  return target;
}

function bucketIndex(rating) {
  return BUCKET_UPPER_BOUNDS.findIndex((upper) => rating < upper);
}

/**
 * Replays the whole line so we only ship puzzles where every move is legal, the setup move
 * (moves[0]) belongs to the side to move in the FEN, and the solver — the other colour —
 * makes every odd-indexed move. Returns false on any inconsistency.
 */
function lineIsConsistent(fen, moves) {
  try {
    const chess = new Chess(fen);
    const opponent = chess.turn();
    const solver = opponent === "w" ? "b" : "w";
    for (let i = 0; i < moves.length; i++) {
      const uci = moves[i];
      const expectedColor = i % 2 === 0 ? opponent : solver;
      if (chess.turn() !== expectedColor) return false;
      const piece = chess.get(uci.slice(0, 2));
      if (!piece || piece.color !== expectedColor) return false;
      chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4) || undefined });
    }
    return true;
  } catch {
    return false;
  }
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(items, rand) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function collectCandidates(dbPath) {
  const buckets = BUCKET_UPPER_BOUNDS.map(() => []);
  const decoder = new TextDecoder();
  let pending = "";
  let headerSkipped = false;
  let linesSeen = 0;
  let done = false;

  const handleLine = (line) => {
    if (!headerSkipped) {
      headerSkipped = true;
      return;
    }
    if (!line) return;
    linesSeen++;
    const [id, fen, moves, rating, deviation, popularity, plays, themes] = line.split(",");
    const ratingNum = Number(rating);
    if (Number(popularity) < MIN_POPULARITY || Number(plays) < MIN_PLAYS || Number(deviation) > MAX_RATING_DEVIATION) return;
    const moveList = moves.split(" ");
    const plies = moveList.length;
    if (plies < 2 || plies > MAX_PLIES || plies % 2 !== 0) return;
    if (themes && themes.includes("veryLong")) return;
    const bucket = buckets[bucketIndex(ratingNum)];
    if (bucket.length >= CANDIDATES_PER_BUCKET) return;
    if (!validateFen(fen).ok || !lineIsConsistent(fen, moveList)) return;
    bucket.push({ id, fen, moves, rating: ratingNum });
    if (buckets.every((b) => b.length >= CANDIDATES_PER_BUCKET)) done = true;
  };

  const decompressor = new Decompress((chunk) => {
    pending += decoder.decode(chunk, { stream: true });
    let newline;
    while (!done && (newline = pending.indexOf("\n")) !== -1) {
      handleLine(pending.slice(0, newline).trimEnd());
      pending = pending.slice(newline + 1);
    }
  });

  const stream = createReadStream(dbPath);
  let bytesRead = 0;
  for await (const chunk of stream) {
    bytesRead += chunk.length;
    decompressor.push(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.length));
    if (done) break;
  }
  stream.destroy();
  console.log(`Scanned ${linesSeen.toLocaleString()} puzzles (${(bytesRead / 1e6).toFixed(0)} MB compressed).`);
  return buckets;
}

async function main() {
  const dbPath = await ensureDatabase(process.argv[2]);
  const candidates = await collectCandidates(dbPath);
  const rand = mulberry32(SEED);
  const buckets = candidates.map((list, i) => {
    if (list.length < PER_BUCKET) {
      throw new Error(`Bucket ${i} only has ${list.length} candidates — loosen the filters.`);
    }
    return seededShuffle(list, rand).slice(0, PER_BUCKET);
  });

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(
    OUT_FILE,
    JSON.stringify({
      source: "https://database.lichess.org/#puzzles (CC0)",
      generated: new Date().toISOString().slice(0, 10),
      buckets,
    }),
  );
  buckets.forEach((b, i) => {
    const ratings = b.map((p) => p.rating);
    console.log(`Bucket ${i}: ${b.length} puzzles, rating ${Math.min(...ratings)}–${Math.max(...ratings)}`);
  });
  console.log(`Wrote ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
