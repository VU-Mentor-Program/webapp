import { useState } from "react";
import { EVENT_STATUS_API_URL } from "../utils/apiUtils";

export type EventStatus = "Confirmed" | "Pending" | "Cancelled" | "Not Found";

export interface StatusResult {
    found: boolean;
    status?: EventStatus;
    eventName?: string;
    message?: string;
}

export function useEventStatus() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<StatusResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const checkStatus = async (email: string, eventName: string) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const url = `${EVENT_STATUS_API_URL}?email=${encodeURIComponent(email)}&eventName=${encodeURIComponent(eventName)}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Failed to fetch status");
            }

            const data: StatusResult = await response.json();
            setResult(data);
        } catch (err) {
            setError("Failed to check status. Please try again.");
            console.error("Error checking status:", err);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setError(null);
        setLoading(false);
    };

    return { checkStatus, loading, result, error, reset };
}
