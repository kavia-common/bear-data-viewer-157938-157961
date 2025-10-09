import React from "react";
import ResultsTable from "./components/ResultsTable";

export default function App() {
  /** Main single-page app rendering the ResultsTable as the primary view. */
  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <h2 style={{ margin: 0 }}>Bear Data Viewer</h2>
      </header>
      <main style={mainStyle}>
        <ResultsTable refreshMs={10000} />
      </main>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f7f7f9",
  color: "#222",
};

const headerStyle = {
  padding: "16px 20px",
  borderBottom: "1px solid #eee",
  background: "#fff",
};

const mainStyle = {
  padding: 20,
  maxWidth: 1000,
  margin: "0 auto",
};
