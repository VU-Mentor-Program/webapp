import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaChessKnight, FaChessPawn, FaPuzzlePiece } from "react-icons/fa";
import { PageTransition } from "../components/PageTransition";
import { useTranslations } from "../contexts/TranslationContext";
import { ModeSwitcher } from "./ModeSwitcher";
import { DailyPuzzle } from "./puzzle/DailyPuzzle";
import { ChessGame } from "./game/ChessGame";

type PageMode = "puzzle" | "play";
const MODE_KEY = "mentorsChessMode";

const loadMode = (): PageMode => {
  try {
    return localStorage.getItem(MODE_KEY) === "play" ? "play" : "puzzle";
  } catch {
    return "puzzle";
  }
};

export const ChessPage: React.FC = () => {
  const t = useTranslations("chess");
  const [mode, setMode] = useState<PageMode>(loadMode);

  const changeMode = (next: PageMode) => {
    setMode(next);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {
      // ignore
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen text-white text-center px-3 sm:px-4 pt-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-emerald-400/80 uppercase tracking-[0.25em] text-xs font-medium mb-3 flex items-center justify-center gap-2">
            <FaChessPawn /> Mentors
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{t("title")}</h1>
          <p className="text-gray-300 max-w-[42rem] mx-auto mb-8 px-2">{t("subtitle")}</p>

          <div className="mb-8 flex justify-center px-2">
            <ModeSwitcher<PageMode>
              ariaLabel="Chess mode"
              value={mode}
              onChange={changeMode}
              options={[
                { value: "puzzle", label: t("mode_puzzle"), icon: <FaPuzzlePiece /> },
                { value: "play", label: t("mode_play"), icon: <FaChessKnight /> },
              ]}
            />
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-5 md:p-8 shadow-lg overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                {mode === "puzzle" ? <DailyPuzzle /> : <ChessGame />}
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="text-gray-500 text-xs mt-8 px-4">{t("credits")}</p>
        </div>
      </div>
    </PageTransition>
  );
};

export default ChessPage;
