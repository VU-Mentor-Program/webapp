import React, { useState } from "react";
import { POST_API_URL } from "../utils/apiUtils.ts";

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  gameName: string;
  onClose: () => void;
  onRestart: () => void;
}

// We'll define a global callback for the "posting" response
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
  onRestart
}) => {
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
      console.debug("Removing old <script> for saveScore...");
      old.remove();
    }
  };

  /**
   * JSONP callback
   */
  window.saveScoreCallback = (result: any) => {
    console.debug("saveScoreCallback called with:", result);
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
    console.debug("Inserting <script> for JSONP POST:", scriptUrl);

    const script = document.createElement("script");
    script.id = "saveScoreScript";
    script.src = scriptUrl;
    script.async = true;

    script.onerror = (ev) => {
      console.error("saveScoreScript onerror event:", ev);
      setError("Failed to load saveScore script (see console).");
      setSubmitting(false);
    };

    script.onload = () => {
      console.debug("saveScoreScript loaded (onload).");
      // The server will call window.saveScoreCallback(...)
    };

    document.body.appendChild(script);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50"
      onClick={onClose}
    >
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
        <h2 className="text-2xl font-bold text-center mb-4">Game Over</h2>
        <p className="text-lg text-center mb-2">Your Score: {score}</p>

        <div className="mb-4">
          <label className="block text-sm font-medium">Enter Username:</label>
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
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
