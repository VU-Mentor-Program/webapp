#!/usr/bin/env node

// Fetches the most common email signups across all event sheets.
//
// Usage:
//   node scripts/top-emails.mjs
//
// Before first use:
//   1. Update your Google Apps Script with the latest apps-script-stats.js
//   2. Redeploy the web app (new version)

const API_URL =
  "https://script.google.com/macros/s/AKfycbxme42_Tw8h_60qjvGNAGqmqfAOlv8Mj2T8Er83EDxzcGr8eQm0gtTgD7foo7V4_0RO/exec";

async function main() {
  console.log("\n  Fetching top email signups...\n");

  try {
    const res = await fetch(`${API_URL}?action=getTopEmails`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    if (!data.topEmails || !Array.isArray(data.topEmails)) {
      console.error(
        '  Error: Unexpected response. Did you add the "getTopEmails" action?\n'
      );
      console.error("  Response:", JSON.stringify(data, null, 2));
      console.error("\n  Make sure you:");
      console.error("  1. Copy the updated apps-script-stats.js to your Google Apps Script");
      console.error("  2. Redeploy the web app (Deploy > Manage deployments > edit > new version)\n");
      process.exit(1);
    }

    console.log("  ┌───────────────────────────────────────────────────────────────────┐");
    console.log("  │                    TOP EMAIL SIGNUPS                              │");
    console.log("  ├─────────────────────────────────────────────────────────┬─────────┤");
    console.log("  │ Email                                                   │ Events  │");
    console.log("  ├─────────────────────────────────────────────────────────┼─────────┤");

    for (const entry of data.topEmails) {
      const email = entry.email.padEnd(57).slice(0, 57);
      const count = String(entry.count).padStart(5);
      console.log(`  │ ${email} │ ${count}   │`);
    }

    console.log("  └─────────────────────────────────────────────────────────┴─────────┘");

    console.log(`\n  Summary:`);
    console.log(`  ─────────────────────────────────────`);
    console.log(`  Total unique emails: ${data.totalUniqueEmails}`);
    console.log(`  Multi-event signups: ${data.multiEventSignups} (signed up for 2+ events)`);

    const topRepeat = data.topEmails.filter(e => e.count > 1).slice(0, 10);
    if (topRepeat.length > 0) {
      console.log(`\n  Top 10 Most Active Members (2+ events):`);
      console.log(`  ─────────────────────────────────────`);
      topRepeat.forEach((e, i) => {
        console.log(`  ${String(i + 1).padStart(2)}. ${e.email} (${e.count} events)`);
        console.log(`      Events: ${e.events.join(", ")}`);
      });
    }

    const top5 = data.topEmails.slice(0, 5);
    if (top5.length > 0) {
      console.log(`\n  Top 5 by Total Signups:`);
      console.log(`  ─────────────────────────────────────`);
      top5.forEach((e, i) => {
        console.log(`  ${i + 1}. ${e.email} - ${e.count} event(s)`);
      });
    }

    console.log();
  } catch (err) {
    console.error(`  Error: ${err.message}\n`);
    console.error("  Make sure you:");
    console.error("  1. Added the getTopEmails function to your Google Apps Script");
    console.error('  2. Added "getTopEmails" to the doGet action router');
    console.error("  3. Redeployed the web app (new version)\n");
    process.exit(1);
  }
}

main();
