import { render, screen } from "@testing-library/react";
import App from "./App.jsx";

test("renders page header", () => {
  render(<App />);
  const headerEl = screen.getByText(/Bear Data Viewer/i);
  expect(headerEl).toBeInTheDocument();
});
