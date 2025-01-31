import React, { useEffect, useState } from "react";
import { GET_API_URL } from "../utils/apiUtils.ts";
import { LoadingAnimation } from "./LoadingAnimation";

// Types
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
    leaderBoardCallback?: (data: LeaderboardData) => void;
  }
}

const LeaderBoard: React.FC<LeaderBoardProps> = ({ games }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Removes old <script> tag (to avoid duplicates)
   */
  const removeScript = () => {
    const oldScript = document.getElementById("leaderboardScript");
    if (oldScript) {
      console.debug("🔄 Removing old <script> tag for Leaderboard...");
      oldScript.remove();
    }
  };

  /**
   * JSONP callback function Apps Script calls
   */
  window.leaderBoardCallback = (data: LeaderboardData) => {
    console.debug("✅ leaderBoardCallback received data:", data);
    if (!data || Object.keys(data).length === 0) {
      setError("No leaderboard data received.");
    } else {
      setLeaderboard(data);
      setError("");
    }
    setLoading(false);
  };

  /**
   * Creates a <script> for JSONP, pointing to our Web App
   */
  const fetchLeaderboard = () => {
    console.debug("🟢 fetchLeaderboard() invoked...");
    setLoading(true);
    setError("");
    removeScript();

    const url = `${GET_API_URL}?callback=leaderBoardCallback`;
    console.debug("🌐 Fetching JSONP from:", url);

    const script = document.createElement("script");
    script.id = "leaderboardScript";
    script.src = url;
    script.async = true;

    script.onerror = (ev) => {
      console.error("❌ Script failed to load:", ev);
      setError("Failed to load leaderboard data. Check console.");
      setLoading(false);
    };

    script.onload = () => {
      console.debug("✅ Script successfully loaded!");
    };

    document.body.appendChild(script);
  };

  /**
   * On mount, fetch leaderboard data
   */
  useEffect(() => {
    fetchLeaderboard();
    return removeScript; // Cleanup when unmounting
  }, [games]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-5 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-4">🏆 Leaderboards</h2>

      {/* Button to manually refresh */}
      <div className="text-right mb-4">
        <button
          onClick={fetchLeaderboard}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
        >
          Refresh Leaderboard
        </button>
      </div>

      {/* Show loading or error state */}
      {loading && <LoadingAnimation />}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {/* Render leaderboard if no error and not loading */}
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
