# bear-data-viewer-157938-157961 (React Frontend)

Primary endpoint
- The frontend fetches from: ${REACT_APP_BEAR_API_URL}/api/bears (or derived base + /api/bears).
- The backend currently responds with either:
  - { "bears": [ ... ] } or { "detections": [ ... ] } (handled by the UI), where each item contains fields like frame_time_seconds, label, x1, y1, x2, y2, confidence.

Environment
- Required variables (only these are recognized by the codebase):
  - REACT_APP_BEAR_API_URL: Backend base URL without a trailing slash (examples: http://localhost:3001 or https://your-host:3001).
  - REACT_APP_REFRESH_INTERVAL_SECONDS: Auto-refresh interval in seconds (default 10).
- Do NOT use duplicated keys like REACT_APP_REACT_APP_BEAR_API_URL or REACT_APP_REACT_APP_REFRESH_INTERVAL_SECONDS — they are ignored by the code.
- If REACT_APP_BEAR_API_URL is not set, the app derives a default at runtime:
  - If running on port 3000, it swaps to port 3001 and appends "/api".
  - Otherwise it appends "/api" to the current origin.
- Protocol and port must match your backend (avoid HTTP/HTTPS mismatch). If the frontend is on https, ensure the backend URL is also https (or that your environment permits mixed content).

Setup
1) Copy .env.example to .env and adjust:
   REACT_APP_BEAR_API_URL=http://localhost:3001
   REACT_APP_REFRESH_INTERVAL_SECONDS=10
2) Start the backend (Flask) on port 3001 (see backend README for CORS details).
3) Start the frontend on port 3000.

Troubleshooting "failed to fetch"
- Verify the backend is reachable at ${REACT_APP_BEAR_API_URL}/api/bears in a browser tab (check status code and JSON).
- Ensure the URL scheme and host match (no HTTP/HTTPS mismatch, and correct host/port).
- Confirm CORS: the backend enables CORS for /api/* and allows all origins by default (or your configured origin).
- Open the browser DevTools console — the app logs the resolved API base and the full endpoint for debugging.

States
- The BearTable shows loading, error (with HTTP status or network error message), and empty states, and auto-refreshes every 10s by default.

Entry
- The app entry renders App.js which displays BearTable by default.
