import React, { useState } from "react";
import { POST_API_URL } from "../../utils/apiUtils";
import { useTranslations } from "../../contexts/TranslationContext";

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  gameName: string;
  onClose: () => void;
  onRestart: () => void;
}

// global callback for the "posting" response
declare global {
  interface Window {
    saveScoreCallback: (result: any) => void;
  }
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
   * Remove old script if any
   */
  const removeScript = () => {
    const old = document.getElementById("saveScoreScript");
    if (old) {
      old.remove();
    }
  };

  /**
   * JSONP callback
   */
  window.saveScoreCallback = (result: any) => {
    setSubmitting(false);

    if (result && result.error) {
      setError(`Error: ${result.error}`);
      setSuccessMsg("");
    } else if (result && result.success) {
      setSuccessMsg("Score submitted successfully!");
      setError("");
    } else {
      setError("Unknown error from server");
      setSuccessMsg("");
    }
  };

  /**
   * Handle submission
   */
  const handleSubmit = () => {
    if (!username.trim()) {
      setError("Username cannot be empty!");
      return;
    }
    else if (username.length > 40) {
      setError("Username cannot be longer than 40 characters!");
      return;
    }
    else if (username.length < 3) {
      setError("Username must be at least 3 characters long!");
      return;
    }

    const regex = /^[a-zA-Z0-9 ]*$/;
    if (!regex.test(username)) {
      setError("Username can only contain letters, numbers and spaces!");
      return;
    }

    setError("");
    setSuccessMsg("");
    setSubmitting(true);
    removeScript();

    // Build the query string
    const qs = new URLSearchParams({
      callback: "saveScoreCallback",
      gameName: gameName,
      username: username,
      score: String(score),
    }).toString();

    const scriptUrl = `${POST_API_URL}?${qs}`;

    const script = document.createElement("script");
    script.id = "saveScoreScript";
    script.src = scriptUrl;
    script.async = true;

    script.onerror = (ev) => {
      console.error("saveScoreScript onerror event:", ev);
      setError("Failed to load saveScore script (see console).");
      setSubmitting(false);
    };

    document.body.appendChild(script);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50">
      <div
        className="bg-gray-900 bg-opacity-90 text-white p-6 rounded-lg shadow-lg max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
        >
          ❌
        </button>
        <h2 className="text-2xl font-bold text-center mb-4">{t("game_over")}</h2>
        <p className="text-lg text-center mb-2">{t("your_score")} {score}</p>

        <div className="mb-4">
          <label className="block text-sm font-medium">{t("enter_username")}</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mt-1 rounded bg-gray-800 border border-gray-700 focus:outline-none"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        {successMsg && <p className="text-green-400 mb-2">{successMsg}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit Score"}
        </button>

        <button
          onClick={onRestart}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {t("play_again")}
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
