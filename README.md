# bear-data-viewer-157938-157961 (React Frontend)

Primary endpoint
- The frontend fetches from: ${REACT_APP_BEAR_API_URL}/api/bears (or derived base + /api/bears)
- Each item contains bearId, pose, timestamp.

Environment
- Set REACT_APP_BEAR_API_URL to the backend base URL (e.g., https://vscode-internal-20401-qa.qa01.cloud.kavia.ai:3001). If not set, the app derives a sensible default.

States
- The BearTable shows loading, error, and empty states and auto-refreshes every 10s by default.

Entry
- The app entry renders App.js which displays BearTable by default.
