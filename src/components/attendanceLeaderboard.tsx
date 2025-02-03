import React, { useEffect, useState } from "react";
import { GET_LEADERBOARD_API_URL } from "../utils/apiUtils";
import { LoadingAnimation } from "./LoadingAnimation";
import { useTranslations } from "../contexts/TranslationContext";

// Define the type for each sign-up entry.
interface SignUp {
  name: string;
  count: number;
}

const LeaderBoard: React.FC = () => {
  const t = useTranslations("leaderboard");
  const [leaderboard, setLeaderboard] = useState<SignUp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Function to fetch leaderboard data using the Fetch API.
  const fetchLeaderboard = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${GET_LEADERBOARD_API_URL}?type=NAME_LEADERBOARD`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const json: SignUp[] = await response.json();
      // Sort data in descending order by count if not already sorted.
      const sortedData = json.sort((a, b) => b.count - a.count);
      setLeaderboard(sortedData);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(t("errorLoading") + " - " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leaderboard data when the component mounts.
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-5 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-4">{t("title")}</h2>
      <p className="text-xl text-center mb-4">{t("subtitle")}</p>

      {/* Loading and Error States */}
      {loading && <LoadingAnimation />}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {/* Leaderboard Data */}
      {!loading && !error && (
        <div className="bg-gray-800 p-4 rounded-lg">
          {leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-1 border-b border-gray-700 last:border-b-0"
              >
                <span className="text-lg font-medium">
                  {index + 1}. {entry.name}
                </span>
                <span className="text-lg">{entry.count}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-400">{t("noData")}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaderBoard;
