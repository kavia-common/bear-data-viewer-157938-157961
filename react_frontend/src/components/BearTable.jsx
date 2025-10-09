import React, { useEffect, useState, useMemo } from "react";
import { getApiBaseUrl, getRefreshIntervalSeconds } from "../config";

/**
 * BearTable
 * Displays bear pose records fetched from backend API.
 * - API base URL configured via REACT_APP_BEAR_API_URL
 * - Auto-refresh interval configured via REACT_APP_REFRESH_INTERVAL_SECONDS
 */
// PUBLIC_INTERFACE
export default function BearTable() {
  /** This is a public component that fetches bear data and renders a table. */
  const apiBase = getApiBaseUrl(); // already trimmed and may be derived fallback
  const refreshSec = getRefreshIntervalSeconds(10);

  const endpoint = useMemo(() => {
    const base = (apiBase || "").replace(/\/+$/, "");
    // If base already ends with /api, avoid duplication
    const bearsPath = base.endsWith("/api") ? "/bears" : "/api/bears";
    return base ? `${base}${bearsPath}` : "";
  }, [apiBase]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!apiBase || !endpoint) {
      // No API base at all — let UI show helpful message
      setLoading(false);
      setError("API base URL is not configured.");
      return;
    }
    setError("");
    try {
      const resp = await fetch(endpoint, { method: "GET" });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const data = await resp.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (refreshSec > 0) {
      const id = setInterval(fetchData, refreshSec * 1000);
      return () => clearInterval(id);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, refreshSec]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 8, color: "#555" }}>
        Source: {endpoint || "(no API configured)"} • Refresh: {refreshSec}s
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
            <thead>
              <tr>
                <th style={thStyle}>Bear ID</th>
                <th style={thStyle}>Pose</th>
                <th style={thStyle}>Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{r.bearId}</td>
                  <td style={tdStyle}>{r.pose}</td>
                  <td style={tdStyle}>{r.timestamp}</td>
                </tr>
              ))}
            </tbody>
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
