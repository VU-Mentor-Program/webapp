import React, { useEffect, useState } from "react";
import { GET_API_URL } from "../../utils/apiUtils.ts";
import { LoadingAnimation } from "../LoadingAnimation.tsx";
import { useTranslations } from "../../contexts/TranslationContext.tsx";

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
    minigamesLeaderboard?: (data: LeaderboardData) => void;
  }
}

const LeaderBoard: React.FC<LeaderBoardProps> = ({ games }) => {
  const t = useTranslations("minigames");

  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({});
  const [overallScores, setOverallScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Removes an old <script> tag (to avoid duplicates).
   */
  const removeScript = () => {
    const oldScript = document.getElementById("leaderboardScript");
    if (oldScript) {
      oldScript.remove();
    }
  };

  /**
   * JSONP callback function that the Apps Script calls.
   * The returned data is logged so you can inspect it.
   */
  window.minigamesLeaderboard = (data: LeaderboardData) => {
    if (!data || Object.keys(data).length === 0) {
      setError("No leaderboard data received.");
      setLoading(false);
      return;
    }
    if ('error' in data && typeof data.error === 'string') {
      setError(data.error);
      setLoading(false);
      return;
    }

    // Process game-specific leaderboards.
    const sortedLeaderboard: LeaderboardData = {};
    const overallScoreMap: { [username: string]: number } = {};

    games.forEach((game) => {
      const scores = data[game] || [];
      // Sort by highest score and limit to top 3.
      const topThree = scores.sort((a, b) => b.score - a.score).slice(0, 3);
      sortedLeaderboard[game] = topThree;

      // Build overall scores.
      scores.forEach(({ username, score }) => {
        // If the score is over 100,000, ignore it.
        const adjustedScore = score > 100000 ? 0 : score;
        overallScoreMap[username] = (overallScoreMap[username] || 0) + adjustedScore;
      });
    });

    // Convert overall scores to an array and sort (top 5).
    const sortedOverall = Object.entries(overallScoreMap)
      .map(([username, score]) => ({ username, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    setLeaderboard(sortedLeaderboard);
    setOverallScores(sortedOverall);
    setError("");
    setLoading(false);
  };

  /**
   * Creates a <script> tag for JSONP, pointing to our Apps Script Web App.
   * (Make sure that GET_API_URL does NOT already include a callback parameter.)
   */
  const fetchLeaderboard = () => {
    setLoading(true);
    setError("");
    removeScript();

    // Append the callback parameter if needed.
    const url = GET_API_URL.includes('?')
      ? `${GET_API_URL}&callback=minigamesLeaderboard`
      : `${GET_API_URL}?callback=minigamesLeaderboard`;

    const script = document.createElement("script");
    script.id = "leaderboardScript";
    script.src = url;
    script.async = true;

    script.onerror = (ev) => {
      setError("Failed to load leaderboard data. Check console." + ev);
      setLoading(false);
    };

    document.body.appendChild(script);
  };

  /**
   * On mount, fetch leaderboard data.
   */
  useEffect(() => {
    fetchLeaderboard();
    return removeScript; // Cleanup on unmount.
  }, [games]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-5 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-4">🏆 {t("leaderboard_title")}</h2>

      {/* Button to manually refresh */}
      <div className="text-right mb-4">
        <button
          onClick={fetchLeaderboard}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
        >
          {t("refresh_leaderboard")}
        </button>
      </div>

      {/* Show loading or error state */}
      {loading && <LoadingAnimation />}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {/* Render leaderboard if no error and not loading */}
      {!loading && !error && (
        <>
          {/* Game-Specific Leaderboards */}
          {games.map((game) => {
            const scores = leaderboard[game] || [];
            return (
              <div key={game} className="mb-6">
                <h3 className="text-2xl font-semibold text-blue-400 mb-3">
                  {game.toUpperCase()} {t("pergame_leaderboard")}
                </h3>
                <div className="bg-gray-800 p-4 rounded-lg">
                  {scores.length > 0 ? (
                    scores.map((player, index) => (
                      <p key={index} className="text-lg">
                        🏅 {index + 1}. {player.username} - {player.score}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-400">{t("leaderboard_error")}</p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Overall Leaderboard */}
          <div className="mt-8">
            <h3 className="text-2xl font-semibold text-yellow-400 mb-3">
              🏅 {t("overall_leaderboard")}
            </h3>
            <p className="pb-2">Scores over 100 000 are removed from here</p>
            <div className="bg-gray-800 p-4 rounded-lg">
              {overallScores.length > 0 ? (
                overallScores.map((player, index) => (
                  <p key={index} className="text-lg">
                    🏆 {index + 1}. {player.username} - {player.score}
                  </p>
                ))
              ) : (
                <p className="text-gray-400">{t("leaderboard_error")}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderBoard;
