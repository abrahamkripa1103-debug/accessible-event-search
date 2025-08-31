# Accessible Events Search (WCAG AA)

This is a single-file HTML app that loads events from `work-task-test.json` and lets users search by **event name** and **event date**. It’s designed to meet WCAG 2.2 AA intent with semantic HTML, labels, visible focus, keyboard-only operation, a skip link, ARIA live regions, and a high-contrast toggle.

## Quick start

1. Put `index.html` and `work-task-test.json` in the same folder.
2. Start a tiny local server (prevents browsers from blocking `fetch` on local files):
   - **Python**: `python -m http.server` → open http://localhost:8000
   - **Node**: `npx serve`
3. Open `index.html` in your browser via the server and try searching.

## Notes

- Dates in the dataset like `Friday, 10 October 2016` are parsed to ISO (`2016-10-10`) for reliable date filtering.
- Name filter is case-insensitive and supports partial matches.
- Results are sorted chronologically.
- The **Toggle high contrast** button helps meet contrast requirements.
