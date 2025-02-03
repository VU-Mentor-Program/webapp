import React, { useState, useEffect } from "react";
import { useTranslations } from "../contexts/TranslationContext";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const MonthlyEvents: React.FC = () => {
  const t = useTranslations("monthlyEvents");

  // Change this target date/time as needed.
  const targetDate = new Date("2025-02-07T18:00:00");

  const getTimeLeft = (): TimeLeft => {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <section className="py-10 rounded bg-gray-700 text-white">
      <div className="container mx-auto px-4 md:px-24 text-center">
        <h2 className="text-3xl font-bold mb-4">{t("title")}</h2>
        <p className="text-base mb-6 max-w-2xl mx-auto">{t("description")}</p>

        <div className="bg-gray-600 rounded py-5"> 
          <h1 className="text-3xl pb-4"> {t("eventName")} </h1>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{t("counterLabel")}</h3>
            <div className="text-2xl">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </div>
          </div>
          <a
            href="https://chat.whatsapp.com/I6CQX1yyYM830oTZks5lX7"
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
