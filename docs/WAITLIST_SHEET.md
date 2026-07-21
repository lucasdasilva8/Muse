# Muse interest questionnaire → Google Sheet

Owner / notification inbox: **lucas_da_silva@brown.edu**

## What the site does now

Waitlist + invest-interest forms on the GitHub Pages site:

1. Prefer posting into a Google Sheet (via Apps Script web app)
2. If the sheet URL is not configured yet, fall back to **mailto:lucas_da_silva@brown.edu**

Script source: [`google-apps-script/MuseWaitlist.gs`](google-apps-script/MuseWaitlist.gs)

## One-time setup (≈3 minutes)

1. While logged into **lucas_da_silva@brown.edu**, open [sheets.new](https://sheets.new)
2. Name it **Muse Waitlist**
3. **Extensions → Apps Script**
4. Paste the contents of `google-apps-script/MuseWaitlist.gs`
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Authorize the Brown account
7. Copy the Web app URL (`…/exec`)
8. In `assets/js/main.js`, set:

```js
const SHEETS_WEB_APP_URL = "PASTE_URL_HERE";
```

9. Commit + push so GitHub Pages picks it up

Each submission appends a row and emails **lucas_da_silva@brown.edu**.

## Sheet columns

| Timestamp | Type | Role | Name | Email | Note | Amount | Extra | Source |
