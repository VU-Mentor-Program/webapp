// ============================================================
// FULL Google Apps Script — replace everything in your project
// Then: Deploy > Manage deployments > edit > new version > Deploy
// ============================================================

const SPREADSHEET_ID = "1mKkCRF5P9JsOMV0pn6HfzzFh-acpcPCL4xCYWk61Ij0";

const HEADER_NAMES = {
  EMAIL: "Email Address",
  STATUS: "Event status"
};

function doGet(e) {
  try {
    var action = e.parameter.action;

    if (action === "getEvents") {
      return getAllEvents();
    }

    if (action === "getSignupStats") {
      return getSignupStats();
    }

    var email = e.parameter.email;
    var eventName = e.parameter.eventName;

    if (!email || !eventName) {
      return createResponse({
        found: false,
        message: "Missing email or eventName parameter"
      });
    }

    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadsheet.getSheetByName(eventName);

    if (!sheet) {
      return createResponse({
        found: false,
        message: "Sheet not found for this event"
      });
    }

    var data = sheet.getDataRange().getValues();

    if (data.length === 0) {
      return createResponse({
        found: false,
        message: "Sheet is empty"
      });
    }

    var headers = data[0];
    var emailColumn = -1;
    var statusColumn = -1;

    for (var col = 0; col < headers.length; col++) {
      var header = headers[col].toString().trim().toLowerCase();
      if (header === HEADER_NAMES.EMAIL.toLowerCase()) {
        emailColumn = col;
      }
      if (header === HEADER_NAMES.STATUS.toLowerCase()) {
        statusColumn = col;
      }
    }

    if (emailColumn === -1) {
      return createResponse({
        found: false,
        message: "Email Address column not found in sheet"
      });
    }

    if (statusColumn === -1) {
      return createResponse({
        found: false,
        message: "Event status column not found in sheet"
      });
    }

    for (var i = 1; i < data.length; i++) {
      var rowEmail = data[i][emailColumn];
      if (rowEmail && rowEmail.toString().toLowerCase().trim() === email.toLowerCase().trim()) {
        var status = data[i][statusColumn];
        return createResponse({
          found: true,
          status: status || "Pending",
          eventName: eventName
        });
      }
    }

    return createResponse({
      found: false,
      message: "Email not found for this event"
    });

  } catch (error) {
    return createResponse({
      found: false,
      message: "Error: " + error.toString()
    });
  }
}

function getAllEvents() {
  try {
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheets = spreadsheet.getSheets();
    var skipNames = ["Config", "Template", "README", "Sheet1"];
    var eventNames = sheets
      .filter(function(sheet) { return !sheet.isSheetHidden(); })
      .map(function(sheet) { return sheet.getName(); })
      .filter(function(name) {
        return !name.startsWith('_') && skipNames.indexOf(name) === -1;
      })
      .reverse();

    return createResponse({ events: eventNames });
  } catch (error) {
    return createResponse({ events: [], error: error.toString() });
  }
}

function getSignupStats() {
  try {
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheets = spreadsheet.getSheets();
    var results = [];
    var totalSignups = 0;
    var uniqueEmails = {};

    for (var i = 0; i < sheets.length; i++) {
      var sheet = sheets[i];
      if (sheet.isSheetHidden()) continue;

      var name = sheet.getName();
      if (name.startsWith('_') || name === "Config" || name === "Template" || name === "README" || name === "Sheet1") continue;

      var lastRow = sheet.getLastRow();
      var signups = Math.max(0, lastRow - 1);

      results.push({ event: name, signups: signups });
      totalSignups += signups;

      // Collect unique emails
      if (lastRow > 1) {
        var data = sheet.getDataRange().getValues();
        var headers = data[0];
        var emailCol = -1;
        for (var c = 0; c < headers.length; c++) {
          if (headers[c].toString().trim().toLowerCase() === HEADER_NAMES.EMAIL.toLowerCase()) {
            emailCol = c;
            break;
          }
        }
        if (emailCol !== -1) {
          for (var r = 1; r < data.length; r++) {
            var email = data[r][emailCol];
            if (email) {
              uniqueEmails[email.toString().toLowerCase().trim()] = true;
            }
          }
        }
      }
    }

    var uniqueCount = Object.keys(uniqueEmails).length;

    return createResponse({
      totalEvents: results.length,
      totalSignups: totalSignups,
      uniqueMembers: uniqueCount,
      events: results
    });
  } catch (error) {
    return createResponse({
      totalEvents: 0,
      totalSignups: 0,
      uniqueMembers: 0,
      events: [],
      error: error.toString()
    });
  }
}

function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function testFunction() {
  Logger.log("=== Testing getAllEvents ===");
  var eventsResult = doGet({ parameter: { action: 'getEvents' } });
  Logger.log(eventsResult.getContent());

  Logger.log("\n=== Testing getSignupStats ===");
  var statsResult = doGet({ parameter: { action: 'getSignupStats' } });
  Logger.log(statsResult.getContent());

  Logger.log("\n=== Testing status check ===");
  var result = doGet({
    parameter: {
      email: "test@example.com",
      eventName: "Ice Skating"
    }
  });
  Logger.log(result.getContent());
}

function debugSheet() {
  var sheetName = "Ice Skating";
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log("Sheet not found: " + sheetName);
    return;
  }

  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  Logger.log("Sheet: " + sheetName);
  Logger.log("Headers found:");
  for (var i = 0; i < headers.length; i++) {
    Logger.log("  Column " + i + ": '" + headers[i] + "'");
  }
}
