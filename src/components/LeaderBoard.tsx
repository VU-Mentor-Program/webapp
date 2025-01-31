import React, { useEffect, useState } from "react";
// Must use the final "exec" URL from your Web App deployment
import { GET_API_URL } from "../utils/apiUtils.ts";
import { LoadingAnimation } from "./LoadingAnimation";

// Models
interface Score {
  username: string;
  score: number;
}
interface LeaderboardData {
  [game: string]: Score[];
}
interface LeaderBoardProps {
  games: string[];
}

declare global {
  interface Window {
    leaderBoardCallback: (data: LeaderboardData) => void;
  }
}

const LeaderBoard: React.FC<LeaderBoardProps> = ({ games }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Removes old <script> tag if present
   */
  const removeScript = () => {
    const oldScript = document.getElementById("leaderboardScript");
    if (oldScript) {
      console.debug("Removing old <script> tag for Leaderboard...");
      oldScript.remove();
    }
  };

  /**
   * The JSONP callback function that Apps Script calls
   */
  window.leaderBoardCallback = (data: LeaderboardData) => {
    console.debug("leaderBoardCallback received data:", data);
    setLeaderboard(data);
    setLoading(false);
  };

  /**
   * Creates a <script> tag to load data from Apps Script
   */
  const fetchLeaderboard = () => {
    console.debug("fetchLeaderboard() invoked...");
    setLoading(true);
    setError("");
    removeScript();

    const url = `${GET_API_URL}?callback=leaderBoardCallback`;
    console.debug("Creating <script> for JSONP GET:", url);

    const script = document.createElement("script");
    script.id = "leaderboardScript";
    script.src = url;
    script.async = true;

    // If the script 404s or can't load
    script.onerror = (ev) => {
      console.error("Script onerror event:", ev);
      setError("Failed to load leaderboard data (script error). Check console.");
      setLoading(false);
    };

    // If it loads, we'll see this log, but the actual data
    // arrives only when Apps Script calls leaderBoardCallback(...)
    script.onload = () => {
      console.debug("LeaderBoard JSONP <script> loaded (onload).");
    };

    document.body.appendChild(script);
  };

  // On mount, fetch once
  useEffect(() => {
    fetchLeaderboard();
    // Cleanup on unmount
    return removeScript;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-5 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-4">🏆 Leaderboards</h2>

      {/* Refresh Button */}
      <div className="text-right mb-4">
        <button
          onClick={fetchLeaderboard}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
        >
          Refresh Leaderboard
        </button>
      </div>

      {/* Loading or Error */}
      {loading && <LoadingAnimation />}
      {error && <p className="text-red-400">{error}</p>}

      {/* Show Data if no error && not loading */}
      {!loading && !error && (
        <>
          {games.map((game) => {
            const scores = leaderboard[game] || [];
            return (
              <div key={game} className="mb-6">
                <h3 className="text-2xl font-semibold text-blue-400 mb-3">
                  {game.toUpperCase()} Leaderboard
                </h3>
                <div className="bg-gray-800 p-4 rounded-lg">
                  {scores.length > 0 ? (
                    scores.map((player, index) => (
                      <p key={index} className="text-lg">
                        🏅 {index + 1}. {player.username} - {player.score}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-400">No data available</p>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default LeaderBoard;
