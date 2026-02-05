import React, { useState, useEffect } from "react";
import { StatusResult as StatusResultType } from "../../hooks/useEventStatus";
import { useTranslations } from "../../contexts/TranslationContext";
import Confetti from "react-confetti";

interface StatusResultProps {
    result: StatusResultType;
}

export const StatusResult: React.FC<StatusResultProps> = ({ result }) => {
    const t = useTranslations("statusChecker");
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    const status = result.status || "Not Found";
    const isSuccessStatus = status.toLowerCase() === "confirmed" || status.toLowerCase() === "attended";

    useEffect(() => {
        // Set window size for confetti
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });

        // Show confetti for success statuses
        if (isSuccessStatus) {
            setShowConfetti(true);
            // Stop confetti after 5 seconds
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [isSuccessStatus]);

    if (!result.found) {
        return (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg animate-pulse">
                <p className="text-center">{t("notFound")}</p>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        Confirmed: "bg-green-900/30 border-green-500/50",
        Attended: "bg-green-900/30 border-green-500/50",
        Pending: "bg-yellow-900/30 border-yellow-500/50",
        Cancelled: "bg-red-900/30 border-red-500/50"
    };

    return (
        <>
            {showConfetti && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={200}
                />
            )}
            <div className={`mt-4 p-4 rounded-lg ${statusColors[status] || "bg-gray-900/30 border-gray-500/50"}`}>
                <p className="text-xl font-semibold text-center mb-2">
                    {t("status")}: {t(status.toLowerCase())}
                </p>
                <p className="text-sm text-center opacity-80">
                    {t("event")}: {result.eventName}
                </p>
                {isSuccessStatus && (
                    <p className="text-center mt-3 text-lg text-green-300 font-medium">
                        {t("thankYouMessage")}
                    </p>
                )}
            </div>
        </>
    );
};
