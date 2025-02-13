import React, { useState, useEffect } from "react";
import { useTranslations } from "../contexts/TranslationContext";
import { GET_SIGNUP_COUNT_API_URL } from "../utils/apiUtils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface EventData {
  EVENTNAME: string;
  DATEOFTHEEVENT: string; // Format: "DD/MM/YYYY"
  TIME: string;           // Format: "HH:MM" in 24h format
  SIGNUP_LINK?: string;
}

// Extend EventData with a parsed Date for convenience.
interface ExtendedEventData extends EventData {
  parsedDate: Date;
}

const MonthlyEvents: React.FC = () => {
  const t = useTranslations("monthlyEvents");

  const [events, setEvents] = useState<ExtendedEventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  // A state to trigger re-renders every second (for countdowns)
  const [now, setNow] = useState<Date>(new Date());

  // Helper: Parse date and time together.
  const parseEventDateTime = (dateString: string, timeString: string): Date => {
    const [day, month, year] = dateString.split("/").map(Number);
    const [hour, minute] = timeString.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute);
  };

  // Helper: Calculate time left from now until targetDate.
  const getTimeLeftForDate = (targetDate: Date, current: Date): TimeLeft => {
    const diff = targetDate.getTime() - current.getTime();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  // Update "now" every second so that countdown timers refresh.
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch events from the API.
  useEffect(() => {
    const url = `${GET_SIGNUP_COUNT_API_URL}?type=GET_CONSTANTS`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log("API Response:", data);
        // Convert the API object into an array of events.
        const rawEvents: EventData[] = Object.values(data as Record<string, unknown>).filter(
          (event): event is EventData =>
            typeof event === "object" &&
            event !== null &&
            "DATEOFTHEEVENT" in event &&
            "TIME" in event
        );

        // Parse each event's date and time.
        const parsedEvents: ExtendedEventData[] = rawEvents.map((event) => ({
          ...event,
          parsedDate: parseEventDateTime(event.DATEOFTHEEVENT, event.TIME),
        }));

        if (parsedEvents.length === 0) {
          setError("No event data available.");
        } else {
          // Sort events so that upcoming events appear first.
          const currentTime = new Date();
          parsedEvents.sort((a, b) => {
            const aIsUpcoming = a.parsedDate >= currentTime;
            const bIsUpcoming = b.parsedDate >= currentTime;
            if (aIsUpcoming && bIsUpcoming) {
              return a.parsedDate.getTime() - b.parsedDate.getTime();
            } else if (aIsUpcoming) {
              return -1;
            } else if (bIsUpcoming) {
              return 1;
            } else {
              // Both events are in the past; show the most recent first.
              return b.parsedDate.getTime() - a.parsedDate.getTime();
            }
          });
          setEvents(parsedEvents);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching event data:", err);
        setError("Failed to load event data: " + err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-10 bg-gray-700 text-white">
        <div className="container mx-auto px-4 md:px-24 text-center">
          <p>{t("loading")}</p>
        </div>
      </section>
    );
  }

  if (error || events.length === 0) {
    return (
      <section className="py-10 bg-gray-700 text-white">
        <div className="container mx-auto px-4 md:px-24 text-center">
          <p className="text-red-400">{error || "No event data available."}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 rounded bg-gray-700 text-white">
      <div className="container mx-auto px-4 md:px-24 text-center">
        <h2 className="text-3xl font-bold mb-4">{t("title")}</h2>
        <p className="text-base mb-6 max-w-2xl mx-auto">{t("description")}</p>

        {events.map((event, index) => {
          const timeLeft = getTimeLeftForDate(event.parsedDate, now);
          return (
            <div key={index} className="bg-gray-600 rounded py-5 mb-6">
              <h1 className="text-3xl pb-4">{event.EVENTNAME}</h1>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{t("counterLabel")}</h3>
                <div className="text-2xl">
                  {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </div>
              </div>
              <a
                href={event.SIGNUP_LINK || "https://chat.whatsapp.com/I6CQX1yyYM830oTZks5lX7"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
              >
                {t("signupLinkLabel")}
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MonthlyEvents;
