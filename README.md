# bear-data-viewer-157938-157961 (React Frontend)

Primary endpoint
- The frontend fetches from: ${REACT_APP_BEAR_API_URL}/api/results
- Each item contains frame_time_seconds, label, x1, y1, x2, y2, confidence.

Environment
- Set REACT_APP_BEAR_API_URL to the backend base URL (e.g., https://vscode-internal-20401-qa.qa01.cloud.kavia.ai:3001)

States
- The ResultsTable shows loading, error, and empty states and auto-refreshes every 10s by default.
