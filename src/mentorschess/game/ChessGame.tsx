import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, type PieceSymbol, type Square } from "chess.js";
import { AnimatePresence, motion } from "framer-motion";
import { FaFlag, FaPlus, FaRobot, FaSyncAlt, FaUndo, FaUserFriends } from "react-icons/fa";
import { ChessBoard } from "../board/ChessBoard";
import { ChessButton } from "../ChessButton";
import { ModeSwitcher } from "../ModeSwitcher";
import { useEngine } from "./useEngine";
import { clearGame, loadGame, saveGame, type GameMode } from "./gameStorage";
import { useTranslations } from "../../contexts/TranslationContext";
import { opposite, type Color } from "../theme";

type ColorChoice = Color | "random";

const levelNameKey = (level: number) => {
  if (level <= 2) return "level_beginner";
  if (level <= 4) return "level_casual";
  if (level <= 6) return "level_club";
  if (level <= 8) return "level_strong";
  return "level_expert";
};

const kingSquare = (chess: Chess, color: Color): Square | null => {
  for (const row of chess.board()) {
    for (const cell of row) {
      if (cell && cell.type === "k" && cell.color === color) return cell.square;
    }
  }
  return null;
};

export const ChessGame: React.FC = () => {
  const t = useTranslations("chess");
  const engine = useEngine();
  const chessRef = useRef(new Chess());
  const saved = useRef(loadGame());
  const requestedFen = useRef<string | null>(null);

  const [fen, setFen] = useState(() => {
    if (saved.current) {
      try {
        chessRef.current.loadPgn(saved.current.pgn);
      } catch {
        chessRef.current.reset();
      }
    }
    return chessRef.current.fen();
  });
  const [mode, setMode] = useState<GameMode>(saved.current?.mode ?? "human");
  const [level, setLevel] = useState(saved.current?.level ?? 4);
  const [colorChoice, setColorChoice] = useState<ColorChoice>(saved.current?.humanColor ?? "w");
  const [humanColor, setHumanColor] = useState<Color>(saved.current?.humanColor ?? "w");
  const [orientation, setOrientation] = useState<Color>(saved.current?.orientation ?? "w");
  const [resigned, setResigned] = useState<Color | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(() => {
    const history = chessRef.current.history({ verbose: true });
    const last = history[history.length - 1];
    return last ? { from: last.from as Square, to: last.to as Square } : null;
  });

  const chess = chessRef.current;
  const turn = chess.turn();
  const gameOver = resigned !== null || chess.isGameOver();
  const history = chess.history();

  const persist = useCallback(
    (overrides: Partial<{ mode: GameMode; level: number; humanColor: Color; orientation: Color }> = {}) => {
      saveGame({
        pgn: chessRef.current.pgn(),
        mode,
        level,
        humanColor,
        orientation,
        ...overrides,
      });
    },
    [mode, level, humanColor, orientation],
  );

  const applyMove = useCallback((from: Square, to: Square, promotion?: PieceSymbol) => {
    const move = chessRef.current.move({ from, to, promotion });
    setFen(chessRef.current.fen());
    setLastMove({ from: move.from as Square, to: move.to as Square });
  }, []);

  // Persist after every position change.
  useEffect(() => {
    persist();
  }, [fen, persist]);

  // Ask the bot to move when it's its turn.
  useEffect(() => {
    if (mode !== "bot" || gameOver || turn === humanColor) return;
    if (requestedFen.current === fen) return;
    requestedFen.current = fen;
    engine.requestMove(fen, level).then((uci) => {
      if (!uci || chessRef.current.fen() !== fen) return;
      applyMove(uci.slice(0, 2) as Square, uci.slice(2, 4) as Square, (uci.slice(4) || undefined) as PieceSymbol | undefined);
    });
  }, [mode, gameOver, turn, humanColor, fen, level, engine, applyMove]);

  const newGame = (nextMode: GameMode = mode) => {
    engine.cancel();
    requestedFen.current = null;
    chessRef.current.reset();
    setResigned(null);
    setLastMove(null);
    if (nextMode === "bot") {
      const nextHuman = colorChoice === "random" ? (Math.random() < 0.5 ? "w" : "b") : colorChoice;
      setHumanColor(nextHuman);
      setOrientation(nextHuman);
    }
    clearGame();
    setFen(chessRef.current.fen());
  };

  const changeMode = (nextMode: GameMode) => {
    if (nextMode === mode) return;
    engine.cancel();
    requestedFen.current = null;
    setMode(nextMode);
    if (nextMode === "bot") {
      // The person switching keeps playing the side that is to move.
      setHumanColor(turn);
      setOrientation(turn);
    }
  };

  const undo = () => {
    engine.cancel();
    requestedFen.current = null;
    const c = chessRef.current;
    if (c.history().length === 0) return;
    if (mode === "bot" && c.turn() === humanColor) c.undo(); // take back the bot's reply too
    c.undo();
    setResigned(null);
    const hist = c.history({ verbose: true });
    const last = hist[hist.length - 1];
    setLastMove(last ? { from: last.from as Square, to: last.to as Square } : null);
    setFen(c.fen());
  };

  const flip = () => setOrientation(opposite(orientation));

  const resign = () => {
    if (gameOver) return;
    engine.cancel();
    setResigned(mode === "bot" ? humanColor : turn);
  };

  const legalMoves = useCallback((square: Square) => new Chess(fen).moves({ square, verbose: true }), [fen]);

  const checkSquare = useMemo(() => {
    const c = new Chess(fen);
    return c.inCheck() ? kingSquare(c, c.turn()) : null;
  }, [fen]);

  const colorName = (c: Color) => (c === "w" ? t("white") : t("black"));

  const statusText = (() => {
    if (resigned) return `${colorName(opposite(resigned))} ${t("wins")} (${t("by_resignation")})`;
    if (chess.isCheckmate()) return `${t("checkmate")} — ${colorName(opposite(turn))} ${t("wins")}`;
    if (chess.isStalemate()) return `${t("draw")} — ${t("stalemate")}`;
    if (chess.isThreefoldRepetition()) return t("draw_repetition");
    if (chess.isInsufficientMaterial()) return t("draw_material");
    if (chess.isDrawByFiftyMoves()) return t("draw_fifty");
    if (mode === "bot" && engine.thinking) return t("thinking");
    const base = turn === "w" ? t("white_to_move") : t("black_to_move");
    return chess.inCheck() ? `${base} · ${t("check")}` : base;
  })();

  const interactive = !gameOver && (mode === "human" || (turn === humanColor && !engine.thinking));
  const movePairs = useMemo(() => {
    const pairs: { n: number; white: string; black?: string }[] = [];
    for (let i = 0; i < history.length; i += 2) pairs.push({ n: i / 2 + 1, white: history[i], black: history[i + 1] });
    return pairs;
  }, [history]);

  const moveListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    moveListRef.current?.scrollTo({ top: moveListRef.current.scrollHeight, behavior: "smooth" });
  }, [history.length]);

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-12">
      <div className="relative" style={{ width: "min(100%, 560px)" }}>
        <ChessBoard
          fen={fen}
          orientation={orientation}
          interactive={interactive}
          movableColor={mode === "human" ? turn : humanColor}
          legalMoves={legalMoves}
          onMove={applyMove}
          lastMove={lastMove}
          checkSquare={checkSquare}
        />
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 z-30 flex items-center justify-center rounded-lg bg-slate-900/70 backdrop-blur-[2px]"
            >
              <div className="chess-pop text-center px-6 py-5 mx-4 rounded-2xl bg-white/10 border border-white/20 shadow-xl">
                <p className="text-xl md:text-2xl font-bold mb-4">{statusText}</p>
                <ChessButton variant="primary" onClick={() => newGame()}>
                  {t("play_again")}
                </ChessButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-[24rem] mx-auto lg:mx-0 text-center lg:text-left space-y-4">
        <ModeSwitcher<GameMode>
          size="sm"
          full
          ariaLabel="Opponent"
          value={mode}
          onChange={changeMode}
          options={[
            { value: "human", label: t("two_players"), icon: <FaUserFriends /> },
            { value: "bot", label: t("vs_bot"), icon: <FaRobot /> },
          ]}
        />

        <AnimatePresence initial={false}>
          {mode === "bot" && (
            <motion.div
              key="bot-settings"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-4 rounded-xl bg-white/5 border border-white/10 p-4 text-left">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">{t("level")}</span>
                    <span className="font-semibold text-emerald-400">
                      {level} · {t(levelNameKey(level))}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="w-full accent-emerald-500 cursor-pointer"
                    aria-label={t("level")}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                  <span className="text-gray-300">{t("play_as")}</span>
                  <ModeSwitcher<ColorChoice>
                    size="sm"
                    full="mobile"
                    value={colorChoice}
                    onChange={setColorChoice}
                    options={[
                      { value: "w", label: t("white") },
                      { value: "b", label: t("black") },
                      { value: "random", label: t("random") },
                    ]}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 min-h-[3.25rem] flex items-center justify-center lg:justify-start">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={statusText}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className={`font-semibold ${engine.thinking && !gameOver ? "text-emerald-300 animate-pulse" : ""}`}
            >
              {statusText}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ChessButton variant="primary" onClick={() => newGame()}>
            <FaPlus className="text-xs" /> {t("new_game")}
          </ChessButton>
          <ChessButton onClick={undo} disabled={history.length === 0}>
            <FaUndo className="text-xs" /> {t("undo")}
          </ChessButton>
          <ChessButton onClick={flip}>
            <FaSyncAlt className="text-xs" /> {t("flip")}
          </ChessButton>
          <ChessButton variant="danger" onClick={resign} disabled={gameOver || history.length === 0}>
            <FaFlag className="text-xs" /> {t("resign")}
          </ChessButton>
        </div>

        <div className="text-left">
          <p className="text-emerald-400/80 uppercase tracking-[0.2em] text-xs font-medium mb-2 text-center lg:text-left">{t("moves")}</p>
          <div ref={moveListRef} className="max-h-40 lg:max-h-48 overflow-y-auto rounded-xl bg-white/5 border border-white/10 p-3 font-mono text-sm">
            {movePairs.length === 0 && <p className="text-gray-500 font-sans text-center lg:text-left">{t("no_moves_yet")}</p>}
            {movePairs.map((p) => (
              <div key={p.n} className="grid grid-cols-[2.5rem_1fr_1fr] gap-2 py-0.5">
                <span className="text-gray-500">{p.n}.</span>
                <span>{p.white}</span>
                <span>{p.black ?? ""}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;
