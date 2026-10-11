import React, { useState } from "react";
import FadeIn from "./Fadein-Wrapper";
import ScrollReveal from "./ScrollReveal";
import { UpcomingEvents } from "./UpcomingEvents";
import { CALENDAR_ID } from "../utils/apiUtils";
import { useTranslations } from "../contexts/TranslationContext";

export const Calendar: React.FC = () => {
  const t = useTranslations("calendar");
  const [showMonth, setShowMonth] = useState(false);

  return (
    <>
      <ScrollReveal
        baseRotation={0}
        containerClassName="text-center mb-8"
        textClassName="text-3xl sm:text-4xl text-white"
      >
        {t("title")}
      </ScrollReveal>
      <FadeIn duration={100}>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
          <UpcomingEvents />

          <div className="text-center mt-8">
            <button
              type="button"
              onClick={() => setShowMonth((v) => !v)}
              className="text-gray-500 hover:text-white transition-colors text-sm cursor-pointer"
            >
              {showMonth ? t("hide_month_view") : t("show_month_view")}
            </button>
          </div>

          {showMonth && (
            <div className="mt-4 rounded-xl overflow-hidden">
              <iframe
                title="Mentor Program Agenda"
                src={`https://calendar.google.com/calendar/u/0/embed?src=${encodeURIComponent(CALENDAR_ID)}&ctz=Europe/Amsterdam&showTitle=0&showPrint=0&showCalendars=0&showTz=0`}
                className="w-full"
                style={{ border: 0 }}
                height="600"
              />
            </div>
          )}
        </div>
      </FadeIn>
    </>
  );
};
