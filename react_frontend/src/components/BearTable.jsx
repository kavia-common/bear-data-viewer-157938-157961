import React, { useEffect, useState, useMemo } from "react";

/**
 * BearTable
 * Displays bear pose records fetched from backend API.
 * - API base URL configured via REACT_APP_BEAR_API_URL
 * - Auto-refresh interval configured via REACT_APP_REFRESH_INTERVAL_SECONDS
 */
// PUBLIC_INTERFACE
export default function BearTable() {
  /** This is a public component that fetches bear data and renders a table. */
  const apiBase = (process.env.REACT_APP_BEAR_API_URL || "").replace(/\/+$/, "");
  const refreshSec = Number(process.env.REACT_APP_REFRESH_INTERVAL_SECONDS || "10");
  const endpoint = useMemo(() => `${apiBase}/api/bears`, [apiBase]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, refreshSec]);

  if (!apiBase) {
    return (
      <div style={{ padding: 16, color: "#b00020" }}>
        Missing REACT_APP_BEAR_API_URL environment variable.
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 8, color: "#555" }}>
        Source: {endpoint} • Refresh: {refreshSec}s
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
