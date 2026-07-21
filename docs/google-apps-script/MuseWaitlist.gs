/**
 * Muse Waitlist → Google Sheet
 *
 * SETUP (use account: lucas_da_silva@brown.edu)
 * 1. Open https://sheets.new and name the spreadsheet "Muse Waitlist"
 * 2. Extensions → Apps Script
 * 3. Delete any default code; paste THIS entire file
 * 4. Click Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Authorize with lucas_da_silva@brown.edu
 * 6. Copy the Web app URL
 * 7. Paste that URL into assets/js/main.js as SHEETS_WEB_APP_URL
 *
 * Columns created automatically on first submit:
 * Timestamp | Type | Role | Name | Email | Note | Amount | Extra | Source
 */

var NOTIFY_EMAIL = "lucas_da_silva@brown.edu";
var SHEET_NAME = "Responses";

function doPost(e) {
  try {
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        "Timestamp",
        "Type",
        "Role",
        "Name",
        "Email",
        "Note",
        "Amount",
        "Extra",
        "Source",
      ]);
      sheet.setFrozenRows(1);
    }

    var row = [
      new Date().toISOString(),
      data.type || "waitlist",
      data.role || "",
      data.name || "",
      data.email || "",
      data.note || "",
      data.amount || "",
      data.extra || "",
      data.source || "muse-site",
    ];
    sheet.appendRow(row);

    // Email notification to Brown inbox
    var subject =
      "[Muse] " +
      (data.type || "waitlist") +
      (data.role ? " — " + data.role : "");
    var body = [
      "New Muse interest submission",
      "",
      "Type: " + (data.type || ""),
      "Role: " + (data.role || ""),
      "Name: " + (data.name || ""),
      "Email: " + (data.email || ""),
      "Note: " + (data.note || ""),
      "Amount: " + (data.amount || ""),
      "Extra: " + (data.extra || ""),
      "Source: " + (data.source || ""),
      "",
      "Also saved to your Muse Waitlist Google Sheet.",
    ].join("\n");

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: subject,
      body: body,
    });

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    "Muse waitlist webhook is running. Use POST from the website."
  );
}
