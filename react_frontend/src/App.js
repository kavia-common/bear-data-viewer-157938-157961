import React from "react";
import "./App.css";
import BearTable from "./components/BearTable";

// PUBLIC_INTERFACE
/**
 * App is the top-level component rendering the page shell and BearTable.
 * It shows a centered container with a page header and the table below.
 */
function App() {
  return (
    <div className="app-shell">
      <main className="container">
        <header>
          <h1 className="page-title">Bear Pose Monitor</h1>
          <p className="page-subtitle">
            Live updates of bear poses from the backend API
          </p>
        </header>
        <BearTable />
      </main>
    </div>
  );
}

export default App;
