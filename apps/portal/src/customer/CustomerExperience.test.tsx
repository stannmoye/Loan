import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CustomerExperience } from "./CustomerExperience";
import { financeCategories, totalProductTypes } from "./customer-data";
import type { CustomerApplication, CustomerApplicationApi } from "./customer-api";

const onSectionChange = vi.fn();
const onNotice = vi.fn();

function renderSection(section: "overview" | "explore" | "applications" | "loans" | "documents" | "notifications" | "help" | "security") {
  return render(<CustomerExperience section={section} onSectionChange={onSectionChange} onNotice={onNotice} />);
}

describe("CustomerExperience", () => {
  it("exposes the complete planned finance catalogue", () => {
    expect(financeCategories).toHaveLength(19);
    expect(totalProductTypes).toBe(66);
    expect(financeCategories.flatMap((category) => category.productTypes)).toHaveLength(66);
  });
  it("clearly identifies the overview as sample data and routes customers to the application journey", () => {
    renderSection("overview");
    expect(screen.getByText(/illustrative preview — not a live account/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /follow an application/i }));
    expect(onSectionChange).toHaveBeenCalledWith("applications");
  });

  it("filters finance topics and opens an educational comparison guide", () => {
    renderSection("explore");
    fireEvent.change(screen.getByRole("textbox", { name: /search finance categories/i }), { target: { value: "HELOC" } });
    expect(screen.getByRole("heading", { name: "Home finance" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Medical finance" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /what should i compare/i }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Home finance" })).toBeInTheDocument();
    expect(within(dialog).getByText(/home equity line of credit \(HELOC\)/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/fixed or variable rate terms/i)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: /close guide/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows a clear empty loan-account centre without invented balances", () => {
    renderSection("loans");
    expect(screen.getByRole("heading", { name: "Your loan accounts, in one place." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No loan accounts are connected." })).toBeInTheDocument();
    expect(screen.getAllByText("Not connected").length).toBeGreaterThan(0);
    expect(screen.getByText(/does not hold or display real loans, balances, due dates or repayment obligations/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /explore finance basics/i }));
    expect(onSectionChange).toHaveBeenCalledWith("explore");
  });

  it("filters sample notifications and navigates to the linked customer area", () => {
    renderSection("notifications");
    expect(screen.getByRole("heading", { name: "Your updates, organised." })).toBeInTheDocument();
    expect(screen.getAllByText("Sample", { exact: true })).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: "Security" }));
    expect(screen.getByRole("heading", { name: "A reminder about account safety" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "An application journey example" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /view details/i }));
    expect(onSectionChange).toHaveBeenCalledWith("security");
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

  it("renders authenticated application history and its persisted timeline", async () => {
    const record: CustomerApplication = {
      id: "application-123", status: "submitted", requested_amount: "1250.00",
      currency_code: "NGN", requested_duration_days: 180,
      product_terms_snapshot: {
        productId: 1, productCode: "PERSONAL-01", productName: "Personal finance",
        productVersionId: 2, versionNumber: 2, currencyCode: "NGN",
        minimumAmount: "1000.00", maximumAmount: "500000.00",
        minimumDurationDays: 30, maximumDurationDays: 365, interestModel: "fixed",
        annualInterestRateBps: 1200, repaymentFrequency: "monthly",
        requiresCollateral: false, requiresGuarantor: false, riskReviewRequired: true,
        effectiveFrom: null, effectiveUntil: null,
      },
      submitted_at: "2026-11-20T09:00:00.000Z",
      created_at: "2026-11-20T08:00:00.000Z",
      updated_at: "2026-11-20T09:00:00.000Z",
      timeline: [{
        event_type: "customer.application.submitted", from_status: "draft",
        to_status: "submitted", created_at: "2026-11-20T09:00:00.000Z",
      }],
    };
    const api: CustomerApplicationApi = {
      listApplications: vi.fn(async () => [record]),
      getApplication: vi.fn(async () => record),
      submitApplication: vi.fn(async () => ({ id: record.id, status: "submitted" as const })),
      withdrawApplication: vi.fn(async () => ({ id: record.id, status: "withdrawn" as const })),
    };

    render(<CustomerExperience section="applications" onSectionChange={onSectionChange} onNotice={onNotice} applicationApi={api} />);
    expect(await screen.findByRole("heading", { name: "Your applications." })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Personal finance" })).toBeInTheDocument();
    expect(screen.getByText("NGN 1250.00")).toBeInTheDocument();
    expect(screen.getByText("Submitted")).toBeInTheDocument();
    expect(screen.getByText(/customer application submitted/i)).toBeInTheDocument();
    expect(api.listApplications).toHaveBeenCalledTimes(1);
    expect(api.getApplication).toHaveBeenCalledWith(record.id);
    expect(screen.queryByText(/illustrative preview/i)).not.toBeInTheDocument();
  });

  it("withdraws an eligible application and refreshes the persisted status", async () => {
    const record: CustomerApplication = {
      id: "application-eligible", status: "submitted", requested_amount: "5000.00",
      currency_code: "NGN", requested_duration_days: 90,
      product_terms_snapshot: {
        productId: 2, productCode: "EDU-01", productName: "Education finance",
        productVersionId: 1, versionNumber: 1, currencyCode: "NGN",
        minimumAmount: "1000.00", maximumAmount: "500000.00",
        minimumDurationDays: 30, maximumDurationDays: 365, interestModel: "fixed",
        annualInterestRateBps: 900, repaymentFrequency: "monthly",
        requiresCollateral: false, requiresGuarantor: false, riskReviewRequired: false,
        effectiveFrom: null, effectiveUntil: null,
      },
      submitted_at: "2026-11-20T09:00:00.000Z",
      created_at: "2026-11-20T08:00:00.000Z",
      updated_at: "2026-11-20T09:00:00.000Z", timeline: [],
    };
    const withdrawn: CustomerApplication = { ...record, status: "withdrawn", updated_at: "2026-11-20T10:00:00.000Z" };
    const api: CustomerApplicationApi = {
      listApplications: vi.fn().mockResolvedValueOnce([record]).mockResolvedValueOnce([withdrawn]),
      getApplication: vi.fn().mockResolvedValueOnce(record).mockResolvedValueOnce(withdrawn),
      submitApplication: vi.fn(),
      withdrawApplication: vi.fn(async () => ({ id: record.id, status: "withdrawn" as const })),
    };

    render(<CustomerExperience section="applications" onSectionChange={onSectionChange} onNotice={onNotice} applicationApi={api} />);
    fireEvent.click(await screen.findByRole("button", { name: /withdraw application/i }));
    await waitFor(() => expect(api.withdrawApplication).toHaveBeenCalledWith(record.id));
    expect(await screen.findByText("Your withdrawal request was recorded. The latest application status is shown below.")).toBeInTheDocument();
    expect(await screen.findByText("Withdrawn")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /withdraw application/i })).not.toBeInTheDocument();
    expect(api.getApplication).toHaveBeenCalledTimes(2);
  });

  it("shows an accurate empty state when the customer has no application records", async () => {
    const api: CustomerApplicationApi = {
      listApplications: vi.fn(async () => []), getApplication: vi.fn(),
      submitApplication: vi.fn(), withdrawApplication: vi.fn(),
    };
    render(<CustomerExperience section="applications" onSectionChange={onSectionChange} onNotice={onNotice} applicationApi={api} />);
    expect(await screen.findByRole("heading", { name: "No applications found." })).toBeInTheDocument();
    expect(screen.queryByText(/sample-app-001/i)).not.toBeInTheDocument();
  });

});