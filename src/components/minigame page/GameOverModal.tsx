import React, { useState } from "react";
import { useTranslations } from "../../contexts/TranslationContext";

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  gameName: string;
  onClose: () => void;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  gameName,
  onClose,
  onRestart,
}) => {
  const t = useTranslations("minigames");

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  /**
   * Submit score - now saves locally instead of to external API
   */
  const submitScore = () => {
    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    // Save to local storage instead of external API
    setTimeout(() => {
      try {
        const localScores = JSON.parse(localStorage.getItem('minigameScores') || '{}');
        if (!localScores[gameName]) {
          localScores[gameName] = [];
        }
        localScores[gameName].push({
          username: username.trim(),
          score,
          date: new Date().toISOString()
        });
        // Keep only top 10 scores per game
        localScores[gameName].sort((a: { score: number }, b: { score: number }) => b.score - a.score);
        localScores[gameName] = localScores[gameName].slice(0, 10);
        
        localStorage.setItem('minigameScores', JSON.stringify(localScores));
        
        setSuccessMsg("Score saved locally!");
        setError("");
        setUsername("");
        setSubmitting(false);
      } catch {
        setError("Failed to save score locally.");
        setSubmitting(false);
      }
    }, 500); // Simulate network delay
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">{t("game_over")}</h2>
        <p className="text-lg mb-4">
          {t("your_score")} <strong>{score}</strong>
        </p>

        {/* Input for username */}
        <div className="mb-4">
          <label className="block text-sm mb-2">{t("enter_username")}</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Your name"
            disabled={submitting}
            maxLength={20}
          />
        </div>

        {/* Error/Success Messages */}
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        {successMsg && <p className="text-green-400 text-sm mb-4">{successMsg}</p>}

        {/* Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={submitScore}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white disabled:opacity-50"
          >
            {submitting ? "Saving..." : t("submit_score")}
          </button>
          <button
            onClick={onRestart}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
          >
            {t("play_again")}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;