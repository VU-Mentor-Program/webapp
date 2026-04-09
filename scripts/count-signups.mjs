#!/usr/bin/env node

// Fetches signup stats from your Google Apps Script and prints them.
//
// Usage:
//   node scripts/count-signups.mjs
//
// Before first use:
//   1. Paste the function from scripts/apps-script-stats.js into your
//      Google Apps Script (the one behind EVENT_STATUS_API_URL)
//   2. Add the "getSignupStats" action to your doGet router
//   3. Redeploy the web app

const API_URL =
  "https://script.google.com/macros/s/AKfycbw1UvDcfjWGSUbghUGWE-44Qpb6HzhP5RyPXJXGXPWtPtgD0P-xtm5a2jXFd0ZSeoTS/exec";

async function main() {
  console.log("\n  Fetching signup stats...\n");

  try {
    const res = await fetch(`${API_URL}?action=getSignupStats`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    if (!data.events || !Array.isArray(data.events)) {
      console.error(
        '  Error: Unexpected response. Did you add the "getSignupStats" action?\n'
      );
      console.error("  Response:", JSON.stringify(data, null, 2));
      process.exit(1);
    }

    // Header
    console.log("  ┌─────────────────────────────────────────────────┐");
    console.log("  │            EVENT SIGNUP STATS                   │");
    console.log("  ├─────────────────────────────────────┬───────────┤");
    console.log("  │ Event                               │ Sign-ups  │");
    console.log("  ├─────────────────────────────────────┼───────────┤");

    // Per-event rows
    for (const event of data.events) {
      const name = event.event.padEnd(37).slice(0, 37);
      const count = String(event.signups).padStart(7);
      console.log(`  │ ${name} │ ${count}   │`);
    }

    // Footer
    console.log("  ├─────────────────────────────────────┼───────────┤");
    const totalLabel = "TOTAL".padEnd(37);
    const totalCount = String(data.totalSignups).padStart(7);
    console.log(`  │ ${totalLabel} │ ${totalCount}   │`);
    console.log("  └─────────────────────────────────────┴───────────┘");

    console.log(`\n  Events: ${data.totalEvents}`);
    console.log(`  Total sign-ups: ${data.totalSignups}`);
    console.log(`  Unique active members: ${data.uniqueMembers ?? "N/A (redeploy Apps Script)"}`);

    // Top 3 by signups
    const sorted = [...data.events].sort((a, b) => b.signups - a.signups);
    const top3 = sorted.slice(0, 3);
    console.log("\n  Top 3 most popular:");
    top3.forEach((e, i) => console.log(`    #${i + 1}  ${e.event} (${e.signups})`));

    // Most recent 3 (last sheets added)
    const recent3 = data.events.slice(0, 3);
    console.log("\n  3 most recent (first sheets):");
    recent3.forEach((e, i) => console.log(`    #${i + 1}  ${e.event} (${e.signups})`));

    // Suggested stats.json values
    console.log("\n  ── Copy into src/data/stats.json ──\n");
    console.log(`  eventSignups:    ${data.totalSignups}`);
    console.log(`  eventsHosted:    ${data.totalEvents}`);
    console.log(`  activeMembers:   ${data.uniqueMembers ?? "?"}\n`);
    console.log(`  topEvents:`);
    top3.forEach(e => console.log(`    { "name": "${e.event}", "signups": ${e.signups} }`));
    console.log(`\n  recentEvents:`);
    recent3.forEach(e => console.log(`    { "name": "${e.event}", "signups": ${e.signups} }`));
    console.log();
  } catch (err) {
    console.error(`  Error: ${err.message}\n`);
    console.error("  Make sure you:");
    console.error(
      '  1. Added the getSignupStats function to your Google Apps Script'
    );
    console.error(
      '  2. Added "getSignupStats" to the doGet action router'
    );
    console.error("  3. Redeployed the web app (new version)\n");
    process.exit(1);
  }
}

main();
