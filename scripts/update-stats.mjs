// Refreshes the automatic numbers in src/data/stats.json for the homepage "Event Stats This Year" section.
//
//   npm run stats          # run after `npm run calendar` (also runs automatically before every deploy)
//
// Updated here:  eventSignups + activeMembers (sign-up sheets via the Apps Script)
//                eventsHosted (calendar events this academic year that have already ended)
// Left alone:    whatsappMembers, topEvents, recentEvents — edit those by hand in stats.json
//                (`node scripts/count-signups.mjs` prints the per-event numbers).
//
// Never fails the build: anything that can't be fetched keeps its previous value.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const API_URL =
  "https://script.google.com/macros/s/AKfycbxme42_Tw8h_60qjvGNAGqmqfAOlv8Mj2T8Er83EDxzcGr8eQm0gtTgD7foo7V4_0RO/exec";
const here = dirname(fileURLToPath(import.meta.url));
const STATS_FILE = resolve(here, "../src/data/stats.json");
const CALENDAR_FILE = resolve(here, "../src/data/calendarEvents.json");

/** Big numbers are shown rounded down to the nearest 10 with a "+" (226 → 220+); small ones stay exact. */
function rounded(value) {
  return value >= 100 ? { value: Math.floor(value / 10) * 10, suffix: "+" } : { value, suffix: "" };
}

/** The academic year starts on August 1st. */
function academicYearStart(now) {
  const year = now.getUTCMonth() >= 7 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
  return new Date(Date.UTC(year, 7, 1));
}

async function fetchSignupStats() {
  try {
    const res = await fetch(`${API_URL}?action=getSignupStats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error || typeof data.totalSignups !== "number" || typeof data.uniqueMembers !== "number") {
      throw new Error(data.error ?? "unexpected response");
    }
    return data;
  } catch (err) {
    console.warn(`Sign-up stats unavailable (${err.message}) — keeping the previous sign-up numbers.`);
    return null;
  }
}

function countHostedEvents(now) {
  if (!existsSync(CALENDAR_FILE)) {
    console.warn("No calendar snapshot — keeping the previous events count (run `npm run calendar` first).");
    return null;
  }
  const { events } = JSON.parse(readFileSync(CALENDAR_FILE, "utf8"));
  const from = academicYearStart(now).toISOString();
  return events.filter((e) => e.start >= from && new Date(e.end) <= now).length;
}

async function main() {
  const stats = JSON.parse(readFileSync(STATS_FILE, "utf8"));
  const now = new Date();
  const set = (key, next) => {
    const stat = stats.stats.find((s) => s.key === key);
    if (stat) Object.assign(stat, next);
  };

  const signups = await fetchSignupStats();
  if (signups) {
    set("eventSignups", rounded(signups.totalSignups));
    set("activeMembers", rounded(signups.uniqueMembers));
  }

  const hosted = countHostedEvents(now);
  if (hosted !== null) set("eventsHosted", { value: hosted, suffix: "" });

  writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2) + "\n");
  const summary = stats.stats.map((s) => `${s.key} ${s.value}${s.suffix}`).join(", ");
  console.log(`Stats: ${summary} → ${STATS_FILE}`);
}

main();
