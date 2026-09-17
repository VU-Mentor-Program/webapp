import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, type PieceSymbol, type Square } from "chess.js";
import Confetti from "react-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheckCircle, FaEye, FaLightbulb, FaPlay } from "react-icons/fa";
import { ChessBoard } from "../board/ChessBoard";
import { ChessButton } from "../ChessButton";
import { amsterdamDayKey, selectDailyPuzzle } from "./selectDailyPuzzle";
import {
  currentStreak,
  loadProgress,
  markRevealed,
  markSolved,
  recordAttempt,
  todayFor,
  type PuzzleProgress,
} from "./puzzleProgress";
import { useCurrentLanguage, useTranslations } from "../../contexts/TranslationContext";
import { opposite, type Color } from "../theme";

type Phase = "intro" | "playing" | "autoplay" | "solved" | "revealed";

const OPPONENT_REPLY_DELAY = 450;
const AUTOPLAY_INTERVAL = 650;
const SETUP_DELAY = 700;

const uciOf = (from: Square, to: Square, promotion?: PieceSymbol) => `${from}${to}${promotion ?? ""}`;

const kingSquare = (chess: Chess, color: Color): Square | null => {
  for (const row of chess.board()) {
    for (const cell of row) {
      if (cell && cell.type === "k" && cell.color === color) return cell.square;
    }
  }
  return null;
};

export const DailyPuzzle: React.FC = () => {
  const t = useTranslations("chess");
  const language = useCurrentLanguage();
  const dayKey = useMemo(() => amsterdamDayKey(), []);
  const daily = useMemo(() => selectDailyPuzzle(dayKey), [dayKey]);
  const moves = useMemo(() => daily.puzzle.moves.split(" "), [daily]);
  const playerColor: Color = useMemo(() => opposite(new Chess(daily.puzzle.fen).turn()), [daily]);

  const chessRef = useRef(new Chess(daily.puzzle.fen));
  const timers = useRef<number[]>([]);
  const [fen, setFen] = useState(daily.puzzle.fen);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<PuzzleProgress>(() => loadProgress());
  const [messageKey, setMessageKey] = useState<string | null>(null);
  const [hintSquare, setHintSquare] = useState<Square | null>(null);
  const [shake, setShake] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const today = todayFor(progress, dayKey);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  const applyUci = useCallback((uci: string) => {
    const chess = chessRef.current;
    const move = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4) || undefined });
    setFen(chess.fen());
    setLastMove({ from: move.from as Square, to: move.to as Square });
  }, []);

  const autoplay = useCallback(
    (fromIndex: number, onDone: () => void) => {
      const playNext = (i: number) => {
        if (i >= moves.length) {
          onDone();
          return;
        }
        applyUci(moves[i]);
        setStep(i + 1);
        later(() => playNext(i + 1), AUTOPLAY_INTERVAL);
      };
      later(() => playNext(fromIndex), AUTOPLAY_INTERVAL);
    },
    [moves, applyUci, later],
  );

  // Set up today's puzzle (or restore a finished one).
  useEffect(() => {
    const chess = new Chess(daily.puzzle.fen);
    chessRef.current = chess;
    setFen(chess.fen());
    setLastMove(null);
    setHintSquare(null);
    setMessageKey(null);

    if (today.solved || today.revealed) {
      for (const uci of moves) chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4) || undefined });
      setFen(chess.fen());
      setStep(moves.length);
      setPhase(today.solved ? "solved" : "revealed");
      return;
    }

    setStep(0);
    setPhase("intro");
    later(() => {
      applyUci(moves[0]);
      setStep(1);
      setPhase("playing");
      setMessageKey("find_best_move");
    }, SETUP_DELAY);

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daily]);

  const finishSolved = useCallback(() => {
    setProgress(markSolved(dayKey));
    setPhase("solved");
    setMessageKey(null);
    setCelebrate(true);
    later(() => setCelebrate(false), 6000);
  }, [dayKey, later]);

  const handleMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    if (phase !== "playing" || busy) return;
    const expected = moves[step];
    const attempt = uciOf(from, to, promotion);

    const probe = new Chess(chessRef.current.fen());
    // Only the solver's own pieces count — never accept a move for the other side.
    if (probe.turn() !== playerColor || probe.get(from)?.color !== playerColor) return;
    probe.move({ from, to, promotion });
    const correct = attempt === expected || probe.isCheckmate();

    if (!correct) {
      setShake(true);
      later(() => setShake(false), 450);
      setProgress(recordAttempt(dayKey));
      setMessageKey("not_quite");
      return;
    }

    applyUci(attempt);
    setHintSquare(null);
    const nextStep = step + 1;
    setStep(nextStep);

    if (nextStep >= moves.length || probe.isCheckmate()) {
      finishSolved();
      return;
    }

    setMessageKey("correct_keep_going");
    setBusy(true);
    later(() => {
      applyUci(moves[nextStep]);
      setStep(nextStep + 1);
      setBusy(false);
      setMessageKey("your_turn");
    }, OPPONENT_REPLY_DELAY);
  };

  const showHint = () => {
    if (phase !== "playing") return;
    setHintSquare(moves[step].slice(0, 2) as Square);
  };

  const showSolution = () => {
    if (phase !== "playing") return;
    setProgress(markRevealed(dayKey));
    setHintSquare(null);
    setMessageKey(null);
    setPhase("autoplay");
    autoplay(step, () => setPhase("revealed"));
  };

  const replay = () => {
    if (phase !== "solved" && phase !== "revealed") return;
    const finalPhase = phase;
    const chess = new Chess(daily.puzzle.fen);
    chessRef.current = chess;
    setFen(chess.fen());
    setLastMove(null);
    setStep(0);
    setPhase("autoplay");
    autoplay(0, () => setPhase(finalPhase));
  };

  const legalMoves = useCallback((square: Square) => new Chess(fen).moves({ square, verbose: true }), [fen]);

  const checkSquare = useMemo(() => {
    const chess = new Chess(fen);
    return chess.inCheck() ? kingSquare(chess, chess.turn()) : null;
  }, [fen]);

  const locale = language === "nl" ? "nl-NL" : "en-GB";
  const dateLabel = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Amsterdam" }).format(new Date());
  const streak = currentStreak(progress, dayKey);
  const finished = phase === "solved" || phase === "revealed";
  const canReveal = phase === "playing" && today.attempts >= 2;
  const messageText = phase === "autoplay" ? "…" : messageKey ? t(messageKey) : "…";

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-12">
      {celebrate && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}

      <ChessBoard
        fen={fen}
        orientation={playerColor}
        interactive={phase === "playing" && !busy}
        movableColor={playerColor}
        legalMoves={legalMoves}
        onMove={handleMove}
        lastMove={lastMove}
        checkSquare={checkSquare}
        highlightSquares={hintSquare ? [hintSquare] : []}
        shake={shake}
      />

      <div className="w-full max-w-[24rem] mx-auto lg:mx-0 text-center lg:text-left space-y-5">
        <div>
          <p className="text-emerald-400/80 uppercase tracking-[0.2em] text-xs font-medium">{t("puzzle_of")}</p>
          <h2 className="text-2xl font-bold capitalize">{dateLabel}</h2>
          <p className="text-gray-400 text-sm mt-1">
            {t("rating")} ~{daily.puzzle.rating} · {playerColor === "w" ? t("white_to_move") : t("black_to_move")}
          </p>
        </div>

        <div className="min-h-[3.75rem] rounded-xl bg-white/5 border border-white/10 px-4 py-3 flex items-center justify-center lg:justify-start">
          {phase === "solved" && (
            <div className="chess-pop">
              <p className="text-emerald-400 font-bold text-lg flex items-center gap-2 justify-center lg:justify-start">
                <FaCheckCircle /> {t("solved")}
              </p>
              <p className="text-gray-300 text-sm">{t("solved_desc")}</p>
            </div>
          )}
          {phase === "revealed" && (
            <div className="chess-pop">
              <p className="text-amber-300 font-bold text-lg flex items-center gap-2 justify-center lg:justify-start">
                <FaEye /> {t("revealed")}
              </p>
              <p className="text-gray-300 text-sm">{t("revealed_desc")}</p>
            </div>
          )}
          {!finished && (
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={messageText}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className={`text-base ${messageKey === "not_quite" ? "text-red-300" : "text-gray-100"}`}
              >
                {messageText}
              </motion.p>
            </AnimatePresence>
          )}
        </div>

        {!finished ? (
          <div className="grid grid-cols-2 gap-2">
            <ChessButton onClick={showHint} disabled={phase !== "playing"}>
              <FaLightbulb className="text-xs" /> {t("hint")}
            </ChessButton>
            <ChessButton onClick={showSolution} disabled={!canReveal} title={canReveal ? undefined : `2 ${t("attempts")}`}>
              <FaEye className="text-xs" /> {t("show_solution")}
            </ChessButton>
          </div>
        ) : (
          <ChessButton variant="primary" full onClick={replay}>
            <FaPlay className="text-xs" /> {t("replay")}
          </ChessButton>
        )}

        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          <div className="rounded-xl bg-white/5 border border-white/10 py-3">
            <p className="text-2xl font-bold text-emerald-400">{streak}</p>
            <p className="text-[11px] uppercase tracking-wider text-gray-400">{t("streak")}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 py-3">
            <p className="text-2xl font-bold">{progress.bestStreak}</p>
            <p className="text-[11px] uppercase tracking-wider text-gray-400">{t("best_streak")}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 py-3">
            <p className="text-2xl font-bold">{today.attempts}</p>
            <p className="text-[11px] uppercase tracking-wider text-gray-400">{t("attempts")}</p>
          </div>
        </div>

        {finished && <p className="text-gray-500 text-sm">{t("new_puzzle_tomorrow")}</p>}
      </div>
    </div>
  );
};

export default DailyPuzzle;
