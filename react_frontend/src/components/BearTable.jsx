import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * BearTable component displays a table of bear pose records.
 * - Fetches data from a backend API (defaults to http://localhost:5000/api/bears)
 * - Auto-refreshes every N seconds (default: 10s)
 * - Shows a loading state and basic error messaging
 * - Columns: Bear ID, Pose, Timestamp
 *
 * Configuration:
 * - REACT_APP_BEAR_API_URL: full API endpoint to fetch bear data
 * - REACT_APP_REFRESH_INTERVAL_SECONDS: refresh interval in seconds
 */

// Derive configuration from environment with sensible defaults
const DEFAULT_API_URL = "http://localhost:5000/api/bears";
const API_URL = process.env.REACT_APP_BEAR_API_URL || DEFAULT_API_URL;

const ENV_REFRESH_SECS = Number(process.env.REACT_APP_REFRESH_INTERVAL_SECONDS);
const REFRESH_INTERVAL_MS =
  Number.isFinite(ENV_REFRESH_SECS) && ENV_REFRESH_SECS > 0
    ? ENV_REFRESH_SECS * 1000
    : 10000;

// PUBLIC_INTERFACE
/**
 * BearTable displays the fetched data in a modern, minimal table.
 */
function BearTable() {
  const [bears, setBears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  // PUBLIC_INTERFACE
  /**
   * Fetch bears from the backend.
   * @param {AbortSignal} [signal] - optional abort signal to cancel the request
   * @returns {Promise<Array<{bearId: string, pose: string, timestamp: string}>>}
   */
  const fetchBears = async (signal) => {
    const res = await fetch(API_URL, { signal });
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }
    return res.json();
  };

  const formattedUpdatedAt = useMemo(() => {
    return lastUpdated ? new Date(lastUpdated).toLocaleString() : null;
  }, [lastUpdated]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const initialLoad = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchBears(controller.signal);
        if (!isMounted) return;
        setBears(Array.isArray(data) ? data : []);
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        if (!isMounted) return;
        if (err.name !== "AbortError") {
          setError("Unable to load bear data. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initialLoad();

    // Set up auto-refresh on interval
    intervalRef.current = setInterval(async () => {
      try {
        setRefreshing(true);
        const data = await fetchBears();
        if (!isMounted) return;
        setBears(Array.isArray(data) ? data : []);
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        if (!isMounted) return;
        // Keep existing data on refresh failures; minimal UI noise
      } finally {
        if (isMounted) setRefreshing(false);
      }
    }, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      controller.abort();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const renderBody = () => {
    if (loading) {
      return (
        <tbody>
          {[...Array(5)].map((_, idx) => (
            <tr key={`skeleton-${idx}`} className="skeleton-row">
              <td colSpan={3}>
                <div className="skeleton-line" />
              </td>
            </tr>
          ))}
        </tbody>
      );
    }

    if (error) {
      return (
        <tbody>
          <tr>
            <td colSpan={3} className="error-cell">
              {error}
            </td>
          </tr>
        </tbody>
      );
    }

    if (!bears || bears.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={3} className="muted-cell">
              No data available.
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody>
        {bears.map((bear, idx) => (
          <tr key={bear.bearId ? `${bear.bearId}-${idx}` : `row-${idx}`}>
            <td className="mono">{bear.bearId ?? "-"}</td>
            <td>{bear.pose ?? "-"}</td>
            <td>{formatTimestamp(bear.timestamp)}</td>
          </tr>
        ))}
      </tbody>
    );
  };

  const refreshSeconds = Math.round(REFRESH_INTERVAL_MS / 1000);

  return (
    <section className="card">
      <div className="card-header">
        <div className="card-header-left">
          <h2 className="card-title">Bear Data</h2>
          <div className="meta">
            <span className="dot" aria-hidden="true" />
            <span className="meta-text">
              {`Auto-refresh every ${refreshSeconds}s${
                formattedUpdatedAt ? ` • Last updated ${formattedUpdatedAt}` : ""
              }`}
            </span>
          </div>
        </div>
        <div className="card-header-right">
          {refreshing ? (
            <div className="chip chip-refreshing" aria-live="polite">
              <span className="spinner" aria-hidden="true" />
              Refreshing
            </div>
          ) : (
            <div className="chip chip-idle">Live</div>
          )}
        </div>
      </div>

      <div className="table-wrap">
        <table className="table" role="table">
          <thead>
            <tr>
              <th scope="col">Bear ID</th>
              <th scope="col">Pose</th>
              <th scope="col">Timestamp</th>
            </tr>
          </thead>
          {renderBody()}
        </table>
      </div>
    </section>
  );
}

// PUBLIC_INTERFACE
/**
 * Format an ISO timestamp into a readable local date/time string.
 * @param {string} ts - ISO 8601 timestamp string
 * @returns {string}
 */
function formatTimestamp(ts) {
  if (!ts) return "-";
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    return d.toLocaleString();
  } catch {
    return String(ts);
  }
}

export default BearTable;
