import { useState, useEffect } from "react";
import { EVENT_STATUS_API_URL } from "../utils/apiUtils";

export function useEvents() {
    const [events, setEvents] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);

        try {
            const url = `${EVENT_STATUS_API_URL}?action=getEvents`;
            console.log("Fetching events from:", url);

            const response = await fetch(url);
            console.log("Response status:", response.status);

            if (!response.ok) {
                throw new Error(`Failed to fetch events: ${response.status}`);
            }

            const data = await response.json();
            console.log("Events data received:", data);

            if (data.events && Array.isArray(data.events)) {
                console.log("Setting events:", data.events);
                setEvents(data.events);
            } else {
                console.error("Invalid response format:", data);
                throw new Error("Invalid response format");
            }
        } catch (err) {
            setError("Failed to load events");
            console.error("Error fetching events:", err);
            // Fallback to empty array on error
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return { events, loading, error, refetch: fetchEvents };
}
