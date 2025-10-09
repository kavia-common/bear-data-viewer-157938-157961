import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders page header", () => {
  render(<App />);
  const headerEl = screen.getByText(/Bear Pose Monitor/i);
  expect(headerEl).toBeInTheDocument();
});
