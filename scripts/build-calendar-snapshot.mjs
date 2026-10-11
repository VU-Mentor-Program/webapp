// Turns the public Google Calendar feed into src/data/calendarEvents.json so the homepage can show
// upcoming events in our own UI (the feed itself has no CORS headers, so the browser can't read it).
//
//   npm run calendar          # refresh the snapshot (also runs automatically before every deploy)
//
// Never fails the build: if the feed can't be reached the previous snapshot is kept.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CALENDAR_ID = "c_8587df64148f09cdec693c7348104a948c95a65d02ca3f579b41fab013b9ab73@group.calendar.google.com";
const FEED_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/basic.ics`;
const here = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = resolve(here, "../src/data/calendarEvents.json");

/** Offset (ms) of an IANA time zone at a given UTC instant. */
function tzOffsetMs(timeZone, utcMs) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - utcMs;
}

/** Parses an ICS date/time value (UTC, zoned wall time, or all-day date) into an ISO string. */
function parseIcsDate(value, params) {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, h = "0", mi = "0", s = "0", z] = m;
  if (params.VALUE === "DATE") return { iso: `${y}-${mo}-${d}`, allDay: true };
  const wall = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
  if (z) return { iso: new Date(wall).toISOString(), allDay: false };
  const tz = params.TZID || "Europe/Amsterdam";
  // wall time in tz → UTC: subtract the zone offset (two passes handles DST edges well enough)
  let utc = wall - tzOffsetMs(tz, wall);
  utc = wall - tzOffsetMs(tz, utc);
  return { iso: new Date(utc).toISOString(), allDay: false };
}

const unescapeText = (s) => s.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\").trim();

function parseIcs(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  // unfold continuation lines
  const unfolded = [];
  for (const line of lines) {
    if (/^[ \t]/.test(line) && unfolded.length) unfolded[unfolded.length - 1] += line.slice(1);
    else unfolded.push(line);
  }
  const events = [];
  let current = null;
  for (const line of unfolded) {
    if (line === "BEGIN:VEVENT") { current = {}; continue; }
    if (line === "END:VEVENT") { if (current) events.push(current); current = null; continue; }
    if (!current) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const [name, ...paramParts] = line.slice(0, idx).split(";");
    const params = Object.fromEntries(paramParts.map((p) => p.split("=")));
    const value = line.slice(idx + 1);
    switch (name) {
      case "UID": current.id = value; break;
      case "SUMMARY": current.title = unescapeText(value); break;
      case "LOCATION": current.location = unescapeText(value); break;
      case "DESCRIPTION": current.description = unescapeText(value); break;
      case "STATUS": current.status = value; break;
      case "RRULE": current.recurring = true; break;
      case "DTSTART": current.start = parseIcsDate(value, params); break;
      case "DTEND": current.end = parseIcsDate(value, params); break;
      default: break;
    }
  }
  return events
    .filter((e) => e.title && e.start && e.status !== "CANCELLED")
    .map((e) => ({
      id: e.id ?? `${e.title}-${e.start.iso}`,
      title: e.title,
      start: e.start.iso,
      end: e.end?.iso ?? e.start.iso,
      allDay: e.start.allDay,
      location: e.location || undefined,
      description: e.description || undefined,
      recurring: e.recurring || undefined,
    }))
    .sort((a, b) => a.start.localeCompare(b.start));
}

async function main() {
  let text;
  try {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    text = await res.text();
  } catch (err) {
    console.warn(`Calendar feed unavailable (${err.message}) — keeping the existing snapshot.`);
    if (!existsSync(OUT_FILE)) {
      mkdirSync(dirname(OUT_FILE), { recursive: true });
      writeFileSync(OUT_FILE, JSON.stringify({ generated: null, calendarId: CALENDAR_ID, events: [] }, null, 2) + "\n");
    }
    return;
  }
  const events = parseIcs(text);
  const previous = existsSync(OUT_FILE) ? JSON.parse(readFileSync(OUT_FILE, "utf8")) : null;
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify({ generated: new Date().toISOString(), calendarId: CALENDAR_ID, events }, null, 2) + "\n");
  console.log(`Calendar snapshot: ${events.length} events${previous ? ` (was ${previous.events.length})` : ""} → ${OUT_FILE}`);
}

main();
