import React, { useEffect, useState, useMemo, useRef } from "react";
import { getApiBaseUrl, getRefreshIntervalSeconds } from "../config";

/**
 * BearTable
 * Displays bear pose records fetched from backend API.
 * - Auto-refresh interval configured via REACT_APP_REFRESH_INTERVAL_SECONDS
 */
// PUBLIC_INTERFACE
export default function BearTable() {
  /** This is a public component that fetches bear data and renders a table. */
  const apiBase = getApiBaseUrl(); // still used for tip visibility and logs
  const refreshSec = getRefreshIntervalSeconds(10);

  // Hardcoded per user request; consider reverting to env-based config later.
  const endpoint = useMemo(() => {
    return "https://vscode-internal-42290-qa.qa01.cloud.kavia.ai:3001/api/bears";
  }, []);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Live toggle - default to true, persist across reload via sessionStorage
  const [isLive, setIsLive] = useState(() => {
    const saved = typeof window !== "undefined" ? window.sessionStorage.getItem("bearTable:isLive") : null;
    return saved === null ? true : saved === "true";
  });
  const intervalRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("bearTable:isLive", String(isLive));
    }
  }, [isLive]);

  // Derive which schema we're rendering (original bears with bearId/pose/timestamp or detections)
  const schema = useMemo(() => {
    if (rows.length === 0) return "unknown";
    const r = rows[0] || {};
    if (r && ("bearId" in r || "pose" in r || "timestamp" in r)) return "bears";
    if (r && ("label" in r || "frame_time_seconds" in r)) return "detections";
    return "unknown";
  }, [rows]);

  const parseRows = (payload) => {
    // Support: raw array, {bears: [...]}, {detections: [...]}
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.bears)
      ? payload.bears
      : Array.isArray(payload?.detections)
      ? payload.detections
      : [];
    // Log when empty to aid troubleshooting, include object keys (but not URL)
    if (!Array.isArray(list) || list.length === 0) {
      // eslint-disable-next-line no-console
      console.info(
        "[BearTable] Parsed zero rows from /api/bears. Payload keys:",
        payload && typeof payload === "object" ? Object.keys(payload) : `(type: ${typeof payload})`
      );
    }
    return list;
  };

  const fetchData = async () => {
    setError("");
    try {
      // eslint-disable-next-line no-console
      console.info("[BearTable] Fetching:", endpoint);
      const resp = await fetch(endpoint, { method: "GET" });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const payload = await resp.json();

      const parsed = parseRows(payload);
      setRows(parsed);
    } catch (e) {
      // Provide a clearer error message that helps diagnose CORS/network vs HTTP.
      const msg = e?.message || "Failed to fetch";
      const hint =
        msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network")
          ? " (Check API URL, CORS, and HTTP/HTTPS mismatch)"
          : "";
      setError(`${msg}${hint}`);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manage auto-refresh interval based on isLive and refreshSec
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (isLive && refreshSec > 0) {
      intervalRef.current = setInterval(fetchData, refreshSec * 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive, refreshSec]);

  // Accessible toggle handlers
  const toggleLive = () => setIsLive((v) => !v);
  const onKeyToggle = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleLive();
    }
  };

  // Render helpers based on schema
  const renderHeader = () => {
    if (schema === "detections") {
      return (
        <tr>
          <th style={thStyle}>Label</th>
          <th style={thStyle}>Frame Time (s)</th>
          <th style={thStyle}>Confidence</th>
        </tr>
      );
    }
    // Default to original bears schema
    return (
      <tr>
        <th style={thStyle}>Bear ID</th>
        <th style={thStyle}>Pose</th>
        <th style={thStyle}>Timestamp (UTC)</th>
      </tr>
    );
  };

  const renderRow = (r, idx) => {
    if (schema === "detections") {
      return (
        <tr key={idx}>
          <td style={tdStyle}>{r.label ?? ""}</td>
          <td style={tdStyle} className="mono">
            {r.frame_time_seconds ?? ""}
          </td>
          <td style={tdStyle}>{r.confidence ?? ""}</td>
        </tr>
      );
    }
    // Default to original bears schema
    return (
      <tr key={idx}>
        <td style={tdStyle}>{r.bearId ?? ""}</td>
        <td style={tdStyle}>{r.pose ?? ""}</td>
        <td style={tdStyle} className="mono">
          {r.timestamp ?? ""}
        </td>
      </tr>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Header row with title and controls */}
      <div style={headerBarStyle}>
        <div style={headerLeftStyle}>
          <div style={cardTitleStyle}>Bear Data</div>
          <div style={metaStyle}>
            <span className="dot" aria-hidden="true" />
            <span aria-live="polite">
              {isLive ? `Auto-refresh every ${refreshSec || 10}s` : "Paused"}
            </span>
            {loading && (
              <span className="chip chip-refreshing" style={{ marginLeft: 8 }}>
                <span className="spinner" aria-hidden="true" />
                Refreshing…
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          className="btn"
          onClick={toggleLive}
          onKeyDown={onKeyToggle}
          aria-label={isLive ? "Turn live updates off" : "Turn live updates on"}
          aria-pressed={isLive}
          style={liveBtnStyle(isLive)}
        >
          {isLive ? "Live" : "Paused"}
        </button>
      </div>

      {loading && <div>Loading...</div>}
      {error && (
        <div style={{ color: "#b00020", marginBottom: 8 }}>
          Error: {error}
        </div>
      )}
      {!loading && !error && rows.length === 0 && <div>No data</div>}
      {!loading && !error && rows.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>{renderHeader()}</thead>
            <tbody>{rows.map((r, idx) => renderRow(r, idx))}</tbody>
          </table>
        </div>
      )}
      {!apiBase && (
        <div style={{ marginTop: 12, color: "#6b7280" }}>
          Tip: Set REACT_APP_BEAR_API_URL in .env (e.g., https://host:3001) or rely on the default fallback.
        </div>
      )}
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "8px",
  background: "#f7f7f7",
};

const tdStyle = {
  borderBottom: "1px solid #eee",
  padding: "8px",
};

const headerBarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "8px 0 12px 0",
};

const headerLeftStyle = {
  display: "flex",
  flexDirection: "column",
};

const cardTitleStyle = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 4,
};

const metaStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#4b5563",
  fontSize: 13,
};

function liveBtnStyle(isLive) {
  return {
    appearance: "none",
    border: "1px solid var(--border, #e5e7eb)",
    background: isLive ? "#f0f7ff" : "#fafafa",
    color: isLive ? "var(--primary, #1976d2)" : "#374151",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 13,
    cursor: "pointer",
    boxShadow: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.04))",
    transition: "background 120ms ease, color 120ms ease, border-color 120ms ease",
  };
}
