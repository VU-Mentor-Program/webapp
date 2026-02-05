import React, { useState, useEffect } from "react";
import { useEventStatus } from "../../hooks/useEventStatus";
import { useEvents } from "../../hooks/useEvents";
import { StatusResult } from "./StatusResult";
import { useTranslations } from "../../contexts/TranslationContext";

interface StatusCheckerModalProps {
    onClose: () => void;
}

export const StatusCheckerModal: React.FC<StatusCheckerModalProps> = ({ onClose }) => {
    const [email, setEmail] = useState("");
    const [selectedEvent, setSelectedEvent] = useState("");
    const { checkStatus, loading, result, error, reset } = useEventStatus();
    const { events, loading: eventsLoading } = useEvents();
    const t = useTranslations("statusChecker");

    const handleCheck = () => {
        if (email && selectedEvent) {
            checkStatus(email, selectedEvent);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    // Handle ESC key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    // Validate email format
    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const canCheck = email && isValidEmail(email) && selectedEvent;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={handleClose}
        >
            <div
                className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '600px', wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word' }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{t("title")}</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white text-2xl leading-none transition-colors flex-shrink-0 ml-4"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Email Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t("emailLabel")}
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("emailPlaceholder")}
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white
                                 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    {email && !isValidEmail(email) && (
                        <p className="text-red-400 text-sm mt-1">{t("invalidEmail")}</p>
                    )}
                </div>

                {/* Event Dropdown */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t("eventLabel")}
                    </label>
                    <select
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        disabled={eventsLoading}
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white
                                 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">
                            {eventsLoading ? t("loadingEvents") : t("selectEvent")}
                        </option>
                        {events.slice(0, 5).map((event) => (
                            <option key={event} value={event}>
                                {event}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Check Button */}
                <button
                    onClick={handleCheck}
                    disabled={!canCheck || loading}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-blue-500
                             hover:from-pink-600 hover:to-blue-600
                             rounded-lg font-semibold text-white transition-all duration-300
                             disabled:opacity-50 disabled:cursor-not-allowed
                             shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    {loading ? t("checking") : t("checkButton")}
                </button>

                {/* Error Display */}
                {error && (
                    <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                        <p className="text-center text-red-200">{error}</p>
                    </div>
                )}

                {/* Result Display */}
                {result && <StatusResult result={result} />}
            </div>
        </div>
    );
};
