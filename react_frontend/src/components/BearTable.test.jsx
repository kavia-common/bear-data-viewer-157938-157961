import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import BearTable from "./BearTable";

/**
 * Helper to mock fetch's resolved value with given JSON body.
 * @param {any} body
 * @returns {object}
 */
function mockFetchResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  };
}

describe("BearTable", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    // Restore fetch and timers after each test to avoid cross-test contamination
    global.fetch = originalFetch;
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test("renders table column headers", async () => {
    // Mock empty response to satisfy the initial fetch
    global.fetch = jest.fn().mockResolvedValueOnce(mockFetchResponse([]));

    render(<BearTable />);

    // Column headers
    expect(
      screen.getByRole("columnheader", { name: /Bear ID/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Pose/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Timestamp/i })
    ).toBeInTheDocument();

    // Ensure fetch was called once for initial load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://vscode-internal-16867-beta.beta01.cloud.kavia.ai:3001/api/bears",
        expect.any(Object)
      );
    });
  });

  test("shows loading state initially and then shows empty state when no data", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(mockFetchResponse([]));

    const { container } = render(<BearTable />);

    // Loading skeleton should be visible immediately
    const skeletons = container.querySelectorAll(".skeleton-line");
    expect(skeletons.length).toBeGreaterThan(0);

    // After load with no data, show empty state
    expect(await screen.findByText(/No data available\./i)).toBeInTheDocument();
  });

  test("fetches data and renders table rows", async () => {
    const rows = [
      { bearId: "B-1", pose: "Sitting", timestamp: "2024-01-01T00:00:00Z" },
      { bearId: "B-2", pose: "Standing", timestamp: "2024-01-01T00:05:00Z" },
    ];
    global.fetch = jest.fn().mockResolvedValueOnce(mockFetchResponse(rows));

    render(<BearTable />);

    // Assert data cells appear
    expect(await screen.findByText("B-1")).toBeInTheDocument();
    expect(screen.getByText("Sitting")).toBeInTheDocument();

    // Timestamp is formatted via toLocaleString; compute expected for determinism
    const expected = new Date(rows[0].timestamp).toLocaleString();
    expect(screen.getByText(expected)).toBeInTheDocument();

    // Ensure both rows rendered
    expect(screen.getByText("B-2")).toBeInTheDocument();
    expect(screen.getByText("Standing")).toBeInTheDocument();
  });

  test("auto-refresh updates the table after 10 seconds", async () => {
    jest.useFakeTimers();

    const initial = [
      { bearId: "B-1", pose: "Sitting", timestamp: "2024-01-01T00:00:00Z" },
    ];
    const refreshed = [
      { bearId: "B-2", pose: "Walking", timestamp: "2024-01-01T00:10:00Z" },
    ];

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(mockFetchResponse(initial)) // initial load
      .mockResolvedValueOnce(mockFetchResponse(refreshed)); // first interval refresh

    render(<BearTable />);

    // Wait for initial data
    expect(await screen.findByText("B-1")).toBeInTheDocument();
    expect(screen.getByText("Sitting")).toBeInTheDocument();

    // Advance timers by 10s to trigger auto-refresh
    await act(async () => {
      jest.advanceTimersByTime(10000);
      // Allow any pending microtasks (fetch json resolution) to flush
      await Promise.resolve();
    });

    // After refresh, updated data should appear
    expect(await screen.findByText("B-2")).toBeInTheDocument();
    expect(screen.getByText("Walking")).toBeInTheDocument();

    // Ensure fetch called twice: initial + one refresh
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
