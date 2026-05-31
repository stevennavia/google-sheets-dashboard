# AGENTS.md

## Repo type

Static files only. No build, no tests, no lint, no package.json. Do not run `npm install` or look for a dev server.

## Key files

- `html/dashboard.html` — Main deliverable. Self-contained HTML+JS+CSS with Chart.js CDN. Deploy by pasting into a CMS text widget.
- `html/logo.png` — Logo embedded as base64 in dashboard.html. To change: re-encode with `base64 -i logo.png | tr -d '\n'` and replace the `data:image/png;base64,...` string.
- `screentinker/dashboard.js` — Alternative server-side proxy route (Node.js/Express). Only used if modifying Screentinker itself.
- `apps-script/Code.gs` — Deprecated alternative (Google Apps Script). Unreliable due to Google CDN caching. Prefer `html/dashboard.html`.

## Placeholders

`html/dashboard.html` contains 3 placeholders that MUST be replaced before deployment:

```
YOUR_SPREADSHEET_ID → Google Sheet ID from URL
YOUR_RANGE          → Cell range (e.g. "Hoja 1!A1:C100")
YOUR_API_KEY        → Google Sheets API v4 key
```

The committed version in git has placeholders restored. Deployed versions in Screentinker DB have real values substituted.

## Sheet format

First row = headers (text). Column named `mes` = X-axis labels. All other numeric columns = bar/pie chart series. The dashboard auto-detects columns.

## Screentinker integration

Widget type: **text** (not webpage). The HTML renders directly in the widget's iframe. The `renderText()` function in Screentinker converts `font-size: Xpx` to `vw` — use `rem` units to avoid this.

Widget ID in local dev: `97aa02ff-a85b-466a-bfbc-dd3891d4f3dd`
