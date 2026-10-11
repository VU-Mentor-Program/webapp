import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaCalendarPlus, FaExternalLinkAlt, FaMapMarkerAlt, FaRegCalendarAlt, FaRegClock } from "react-icons/fa";
import snapshot from "../data/calendarEvents.json";
import { CALENDAR_API_KEY, CALENDAR_ID } from "../utils/apiUtils";
import { useCurrentLanguage, useTranslations } from "../contexts/TranslationContext";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO instant, or YYYY-MM-DD for all-day events
  end: string;
  allDay?: boolean;
  location?: string;
  description?: string;
}

interface Snapshot {
  generated: string | null;
  calendarId: string;
  events: CalendarEvent[];
}

const TIME_ZONE = "Europe/Amsterdam";
const MAX_UPCOMING = 8;

const bundled = snapshot as Snapshot;

/** Live events from the Google Calendar API when an API key is configured; otherwise null. */
async function fetchLiveEvents(): Promise<CalendarEvent[] | null> {
  if (!CALENDAR_API_KEY) return null;
  const timeMin = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events` +
    `?key=${CALENDAR_API_KEY}&timeMin=${encodeURIComponent(timeMin)}&singleEvents=true&orderBy=startTime&maxResults=20`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      items?: { id: string; summary?: string; start: { dateTime?: string; date?: string }; end: { dateTime?: string; date?: string }; location?: string; description?: string; status?: string }[];
    };
    return (data.items ?? [])
      .filter((i) => i.status !== "cancelled" && i.summary)
      .map((i) => ({
        id: i.id,
        title: i.summary ?? "",
        start: i.start.dateTime ?? i.start.date ?? "",
        end: i.end.dateTime ?? i.end.date ?? "",
        allDay: !i.start.dateTime,
        location: i.location,
        description: i.description,
      }));
  } catch {
    return null;
  }
}

const toDate = (value: string) => (value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value));

const googleAddLink = (e: CalendarEvent) => {
  const fmt = (v: string) => (v.length === 10 ? v.replace(/-/g, "") : new Date(v).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""));
  const params = new URLSearchParams({ action: "TEMPLATE", text: e.title, dates: `${fmt(e.start)}/${fmt(e.end)}` });
  if (e.location) params.set("location", e.location);
  if (e.description) params.set("details", e.description);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const UpcomingEvents: React.FC = () => {
  const t = useTranslations("calendar");
  const language = useCurrentLanguage();
  const locale = language === "nl" ? "nl-NL" : "en-GB";
  const [events, setEvents] = useState<CalendarEvent[]>(bundled.events);

  useEffect(() => {
    let cancelled = false;
    fetchLiveEvents().then((live) => {
      if (!cancelled && live && live.length > 0) setEvents(live);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return events
      .filter((e) => toDate(e.end).getTime() >= now - 2 * 3600 * 1000)
      .sort((a, b) => toDate(a.start).getTime() - toDate(b.start).getTime())
      .slice(0, MAX_UPCOMING);
  }, [events]);

  const fmtWeekday = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: TIME_ZONE });
  const fmtDay = new Intl.DateTimeFormat(locale, { day: "numeric", timeZone: TIME_ZONE });
  const fmtMonth = new Intl.DateTimeFormat(locale, { month: "short", timeZone: TIME_ZONE });
  const fmtTime = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE });
  const fmtMonthLong = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: TIME_ZONE });

  const groups = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of upcoming) {
      const key = fmtMonthLong.format(toDate(e.start));
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return [...map.entries()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upcoming, locale]);

  const subscribeUrl = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(CALENDAR_ID)}`;

  if (upcoming.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        <p className="text-lg">{t("no_events")}</p>
        <a href={subscribeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-emerald-300 hover:text-emerald-200">
          <FaRegCalendarAlt /> {t("subscribe")}
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-[48rem] mx-auto text-left">
      {groups.map(([month, items]) => (
        <div key={month} className="mb-8 last:mb-0">
          <p className="text-emerald-400/80 uppercase tracking-[0.2em] text-xs font-medium mb-3 capitalize">{month}</p>
          <ul className="space-y-3">
            {items.map((e, i) => {
              const start = toDate(e.start);
              const end = toDate(e.end);
              const isNext = e === upcoming[0];
              return (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.3, delay: Math.min(i, 5) * 0.05 }}
                  className={`flex items-stretch gap-4 rounded-2xl border p-3 sm:p-4 transition-colors ${
                    isNext ? "bg-emerald-500/10 border-emerald-400/40 shadow-lg shadow-emerald-500/10" : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div
                    className={`flex flex-col items-center justify-center rounded-xl w-16 sm:w-20 shrink-0 py-2 ${
                      isNext ? "bg-emerald-500 text-white" : "bg-white/10 text-gray-100"
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-wider opacity-80">{fmtWeekday.format(start)}</span>
                    <span className="text-2xl sm:text-3xl font-bold leading-none my-0.5">{fmtDay.format(start)}</span>
                    <span className="text-[11px] uppercase tracking-wider opacity-80">{fmtMonth.format(start)}</span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    {isNext && <span className="text-[11px] uppercase tracking-[0.2em] text-emerald-300 font-semibold mb-1">{t("next_up")}</span>}
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">{e.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-300 mt-1">
                      <span className="inline-flex items-center gap-1.5">
                        <FaRegClock className="text-emerald-400/80" />
                        {e.allDay ? t("all_day") : `${fmtTime.format(start)} – ${fmtTime.format(end)}`}
                      </span>
                      {e.location && (
                        <span className="inline-flex items-center gap-1.5 min-w-0">
                          <FaMapMarkerAlt className="text-emerald-400/80 shrink-0" />
                          <span className="truncate">{e.location.split(",")[0]}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <a
                    href={googleAddLink(e)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t("add_to_calendar")}
                    aria-label={t("add_to_calendar")}
                    className="self-center shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-emerald-500 text-white transition-colors"
                  >
                    <FaCalendarPlus />
                  </a>
                </motion.li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-sm">
        <a href={subscribeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200 no-underline">
          <FaRegCalendarAlt /> {t("subscribe")}
        </a>
        <a
          href={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(CALENDAR_ID)}&ctz=${TIME_ZONE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white no-underline"
        >
          <FaExternalLinkAlt className="text-xs" /> {t("open_full_calendar")}
        </a>
      </div>
    </div>
  );
};

export default UpcomingEvents;
