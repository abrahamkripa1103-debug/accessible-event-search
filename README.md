
# Accessible Events Search

This app now **loads event data from `work-task-test.json`**.

## How to Run (Using Node.js)

1. Put all files (`index.html`, `work-task-test.json`, etc.) in the same folder.
2. Open a terminal in that folder.
3. Run this command to start a simple local server:
   ```bash
   npx http-server
   ```
   *(If you don't have `http-server`, install it with: `npm install -g http-server`)*
4. The terminal will show a link like:
   ```
   http://localhost:3000
   ```
   Open that link in your web browser.
5. You can now search by **event name** or **event date**.

## Notes
- Dates like `Friday, 10 October 2016` are converted to `2016-10-10` for easy filtering.
- Search is **case-insensitive** and matches part of the name.
- Results are shown in order by date.
- Accessibility features included: Keyboard Mode, Click & Listen, Enlarge Text, Form Reading, Text Mode, Page Mask, and Help.
