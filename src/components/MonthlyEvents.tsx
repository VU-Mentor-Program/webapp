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

const MonthlyEvents: React.FC = () => {
  const t = useTranslations("monthlyEvents");

  const [currentEvent, setCurrentEvent] = useState<EventData | null>(null);
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Helper function: Parse date in "DD/MM/YYYY" format.
  const parseEventDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  // New helper: Parse date and time together.
  const parseEventDateTime = (dateString: string, timeString: string): Date => {
    const [day, month, year] = dateString.split("/").map(Number);
    const [hour, minute] = timeString.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute);
  };

  // Fetch events from the API and choose the current event.
  useEffect(() => {
    const url = `${GET_SIGNUP_COUNT_API_URL}?type=GET_CONSTANTS`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log("API Response:", data);

        // Convert the API object into an array of events.
        const events: EventData[] = Object.values(data as Record<string, unknown>).filter(
          (event): event is EventData =>
            typeof event === "object" &&
            event !== null &&
            "DATEOFTHEEVENT" in event &&
            "TIME" in event
        );

        // Parse each event's date and time.
        const parsedEvents = events.map((event) => ({
          ...event,
          parsedDate: parseEventDateTime(event.DATEOFTHEEVENT, event.TIME),
        }));

        const today = new Date();

        const upcomingEvents = parsedEvents.filter(
          (event) => event.parsedDate >= today
        );
        const pastEvents = parsedEvents.filter(
          (event) => event.parsedDate < today
        );

        let selectedEvent: EventData | null = null;
        if (upcomingEvents.length > 0) {
          upcomingEvents.sort(
            (a, b) => a.parsedDate.getTime() - b.parsedDate.getTime()
          );
          selectedEvent = upcomingEvents[0];
        } else if (pastEvents.length > 0) {
          pastEvents.sort(
            (a, b) => b.parsedDate.getTime() - a.parsedDate.getTime()
          );
          selectedEvent = pastEvents[0];
        }

        if (selectedEvent) {
          setCurrentEvent(selectedEvent);
        } else {
          setError("No event data available.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching event data:", err);
        setError("Failed to load event data: " + err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (currentEvent) {
      setTargetDate(parseEventDateTime(currentEvent.DATEOFTHEEVENT, currentEvent.TIME));
    }
  }, [currentEvent]);

  const getTimeLeft = (): TimeLeft => {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
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

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (loading) {
    return (
      <section className="py-10 bg-gray-700 text-white">
        <div className="container mx-auto px-4 md:px-24 text-center">
          <p>{t("loading")}</p>
        </div>
      </section>
    );
  }

  if (error || !currentEvent) {
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

        <div className="bg-gray-600 rounded py-5">
          <h1 className="text-3xl pb-4">{currentEvent.EVENTNAME}</h1>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{t("counterLabel")}</h3>
            <div className="text-2xl">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </div>
          </div>
          <a
            href={currentEvent.SIGNUP_LINK || "https://chat.whatsapp.com/I6CQX1yyYM830oTZks5lX7"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            {t("signupLinkLabel")}
          </a>
        </div>
      </div>
    </section>
  );
};

export default MonthlyEvents;
