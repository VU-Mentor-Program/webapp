import React, { useState } from "react";
import { API_URL } from "../utils/apiUtils.ts";

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  gameName: string;
  onClose: () => void;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ isOpen, score, gameName, onClose, onRestart }) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError("Username cannot be empty!");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}?requestType=POST&gameName=${encodeURIComponent(gameName)}&userName=${encodeURIComponent(username)}&score=${score}`,
        { method: "POST" }
      );

      if (response.ok) {
        setSuccessMessage("Score submitted successfully!");
      } else {
        setError("Failed to submit score. Try again later.");
      }
    } catch (err) {
      setError("Error submitting score. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 bg-opacity-90 text-white p-6 rounded-lg shadow-lg max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl">
          ❌
        </button>

        {/* Modal Content */}
        <h2 className="text-2xl font-bold text-center mb-4">Game Over</h2>
        <p className="text-lg text-center mb-2">Your Score: <span className="font-bold">{score}</span></p>

        {/* Username Input */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium">Enter Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mt-1 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        {/* Submit Score Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Score"}
        </button>

        {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}

        {/* Play Again Button */}
        <button
          onClick={onRestart}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-3"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
