import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CustomerExperience } from "./CustomerExperience";

const onSectionChange = vi.fn();
const onNotice = vi.fn();

function renderSection(section: "overview" | "explore" | "applications" | "documents" | "help" | "security") {
  return render(<CustomerExperience section={section} onSectionChange={onSectionChange} onNotice={onNotice} />);
}

describe("CustomerExperience", () => {
  it("clearly identifies the overview as sample data and routes customers to the application journey", () => {
    renderSection("overview");
    expect(screen.getByText(/illustrative preview — not a live account/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /follow an application/i }));
    expect(onSectionChange).toHaveBeenCalledWith("applications");
  });

  it("filters finance topics and opens an educational comparison guide", () => {
    renderSection("explore");
    fireEvent.change(screen.getByRole("textbox", { name: /search finance categories/i }), { target: { value: "education" } });
    expect(screen.getByRole("heading", { name: "Education finance" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Medical finance" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /what should i compare/i }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Education finance" })).toBeInTheDocument();
    expect(within(dialog).getByText(/institution and course are supported/i)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: /close guide/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows document upload as unavailable and warns against sharing sensitive files", () => {
    renderSection("documents");
    expect(screen.getByRole("button", { name: /upload unavailable/i })).toBeDisabled();
    expect(screen.getByText(/does not accept, upload or store files/i)).toBeInTheDocument();
  });

  it("expands one plain-language support answer at a time", () => {
    renderSection("help");
    const question = screen.getByRole("button", { name: /how do i know if a finance option is suitable/i });
    expect(question).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("button", { name: /why might an application need more information/i }));
    expect(question).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(/a reviewer may need to clarify information/i)).toBeInTheDocument();
  });

  it("keeps planned security controls visibly disconnected", () => {
    renderSection("security");
    expect(screen.getAllByText("Not connected").length).toBeGreaterThan(0);
    expect(screen.getByText(/do not enter identity numbers/i)).toBeInTheDocument();
  });
});
