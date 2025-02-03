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
    leaderBoardCallback?: (data: LeaderboardData) => void;
  }
}

const LeaderBoard: React.FC<LeaderBoardProps> = ({ games }) => {
  const t = useTranslations("minigames");

  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({});
  const [overallScores, setOverallScores] = useState<Score[]>([]);
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
    if (!data || Object.keys(data).length === 0) {
      setError("No leaderboard data received.");
      setLoading(false);
      return;
    }

    // Process game-specific leaderboards
    const sortedLeaderboard: LeaderboardData = {};
    const overallScoreMap: { [username: string]: number } = {};

    games.forEach((game) => {
      const scores = data[game] || [];
      // Sort by highest score and limit to top 3
      const topThree = scores.sort((a, b) => b.score - a.score).slice(0, 3);
      sortedLeaderboard[game] = topThree;

      // Build overall scores
      scores.forEach(({ username, score }) => {
        overallScoreMap[username] = (overallScoreMap[username] || 0) + score;
      });
    });

    // Convert overall scores to an array and sort
    const sortedOverall = Object.entries(overallScoreMap)
      .map(([username, score]) => ({ username, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Show only top 5 overall

    setLeaderboard(sortedLeaderboard);
    setOverallScores(sortedOverall);
    setError("");
    setLoading(false);
  };

  /**
   * Creates a <script> for JSONP, pointing to our Web App
   */
  const fetchLeaderboard = () => {
    setLoading(true);
    setError("");
    removeScript();

    const url = `${GET_API_URL}?callback=leaderBoardCallback`;

    const script = document.createElement("script");
    script.id = "leaderboardScript";
    script.src = url;
    script.async = true;

    script.onerror = (ev) => {
      setError("Failed to load leaderboard data. Check console.");
      setLoading(false);
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
