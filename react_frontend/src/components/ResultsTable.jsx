import React, { useEffect, useMemo, useState } from "react";

// PUBLIC_INTERFACE
export default function ResultsTable({ refreshMs = 10000 }) {
  /** A table that fetches and renders results from /api/results.
   * Env:
   *   REACT_APP_BEAR_API_URL - Base URL for backend (e.g., https://...:3001)
   * Fetches:
   *   `${REACT_APP_BEAR_API_URL}/api/results`
   * Renders columns:
   *   frame_time_seconds, label, confidence
   */
  const apiBase = process.env.REACT_APP_BEAR_API_URL || "";
  const url = `${apiBase.replace(/\/+$/, "")}/api/results`;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErr(null);
      const resp = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const data = await resp.json();
      const results = Array.isArray(data?.results) ? data.results : [];
      setRows(results);
      setLastUpdated(new Date().toISOString());
    } catch (e) {
      setErr(e?.message || "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, refreshMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, refreshMs]);

  const content = useMemo(() => {
    if (loading) return <div>Loading results…</div>;
    if (err) return <div style={{ color: "crimson" }}>Error: {String(err)}</div>;
    if (!rows || rows.length === 0) return <div>No results to display.</div>;
    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>frame_time_seconds</th>
              <th style={thStyle}>label</th>
              <th style={thStyle}>confidence</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                <td style={tdStyle}>{Number(r.frame_time_seconds).toFixed(3)}</td>
                <td style={tdStyle}>{r.label}</td>
                <td style={tdStyle}>{Number(r.confidence).toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [loading, err, rows]);

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: 0 }}>Results</h3>
        <div style={{ fontSize: 12, color: "#666" }}>
          {lastUpdated ? `Last updated: ${lastUpdated}` : ""}
        </div>
      </div>
      {content}
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 8,
  padding: 16,
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
};

const thStyle = {
  textAlign: "left",
  padding: "8px 6px",
  borderBottom: "1px solid #eee",
  background: "#fafafa",
  fontWeight: 600,
};

const tdStyle = {
  padding: "8px 6px",
  borderBottom: "1px solid #f2f2f2",
};
