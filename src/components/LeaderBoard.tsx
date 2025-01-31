import React, { useEffect, useState } from "react";
import { API_URL } from "../utils/apiUtils.ts";
import { LoadingAnimation } from "./LoadingAnimation"; // or wherever your loading component is

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

const LeaderBoard: React.FC<LeaderBoardProps> = ({ games }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({});
  const [overallScores, setOverallScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      // Fetch once from your Apps Script endpoint with requestType=GET
      // But your script returns data grouped by game, e.g. {snake:[...], flappy:[...], ...}
      // We'll do exactly that call:
      const response = await fetch(`${API_URL}?requestType=GET`);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      // The data is in the format:
      // {
      //   brickBreaker: [{username, score}, ...],
      //   snake: [{username, score}, ...],
      //   ...
      // }
      const data: LeaderboardData = await response.json();

      // Now let's produce top 3 per game
      const newLeaderboard: LeaderboardData = {};
      const overallMap: { [username: string]: number } = {};

      // For each game in the `games` array, handle data
      games.forEach((game) => {
        const gameArray = data[game] || [];
        // Sort descending by score, take top 3
        const topThree = gameArray
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);

        newLeaderboard[game] = topThree;

        // Add to overall map
        gameArray.forEach(({ username, score }) => {
          if (!overallMap[username]) overallMap[username] = 0;
          overallMap[username] += score;
        });
      });

      // Calculate top 5 overall
      const sortedOverall = Object.entries(overallMap)
        .map(([username, score]) => ({ username, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      setLeaderboard(newLeaderboard);
      setOverallScores(sortedOverall);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchLeaderboard();
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

      {/* If loading, show spinner */}
      {loading ? (
        <LoadingAnimation />
      ) : (
        <>
          {/* Individual Game Leaderboards */}
          {games.map((game) => (
            <div key={game} className="mb-6">
              <h3 className="text-2xl font-semibold text-blue-400 mb-3">
                {game.toUpperCase()} Leaderboard
              </h3>
              <div className="bg-gray-800 p-4 rounded-lg">
                {leaderboard[game] && leaderboard[game].length > 0 ? (
                  leaderboard[game].map((player, index) => (
                    <p key={index} className="text-lg">
                      🏅 {index + 1}. {player.username} - {player.score} points
                    </p>
                  ))
                ) : (
                  <p className="text-gray-400">No data available</p>
                )}
              </div>
            </div>
          ))}

          {/* Overall Leaderboard */}
          <div className="mt-8">
            <h3 className="text-2xl font-semibold text-yellow-400 mb-3">
              🏅 Overall Leaderboard
            </h3>
            <div className="bg-gray-800 p-4 rounded-lg">
              {overallScores.length > 0 ? (
                overallScores.map((player, index) => (
                  <p key={index} className="text-lg">
                    🏆 {index + 1}. {player.username} - {player.score} points
                  </p>
                ))
              ) : (
                <p className="text-gray-400">No data available</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderBoard;
