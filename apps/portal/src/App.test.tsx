import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("portal navigation", () => {
  it("opens customer sections and writes a direct route", () => {
    window.history.replaceState({}, "", "/");
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Explore loans" }));
    expect(screen.getByRole("heading", { name: "Understand your options." })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/customer/explore");
    fireEvent.click(screen.getByRole("button", { name: "Documents" }));
    expect(screen.getByRole("heading", { name: "Know what may be needed." })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/customer/documents");
  });

  it("supports browser back navigation between customer sections", () => {
    window.history.replaceState({}, "", "/customer/explore");
    render(<App />);
    expect(screen.getByRole("heading", { name: "Understand your options." })).toBeInTheDocument();
    window.history.replaceState({}, "", "/");
    fireEvent(window, new PopStateEvent("popstate"));
    expect(screen.getByRole("heading", { name: "Good to see you." })).toBeInTheDocument();
  });
});
