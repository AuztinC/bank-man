import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DashboardPage from "@/app/dashboard/page";

describe("DashboardPage", () => {
  it("introduces the dashboard with a primary action", () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Add transaction" }),
    ).toHaveAttribute("href", "/dashboard/transactions/new");
  });

  it("shows formatted financial summary values", () => {
    render(<DashboardPage />);

    const summary = screen.getByRole("heading", {
      name: "Financial summary",
    }).parentElement;

    expect(summary).not.toBeNull();
    expect(within(summary!).getByText("$12,482.00")).toBeInTheDocument();
    expect(within(summary!).getByText("$4,820.00")).toBeInTheDocument();
    expect(within(summary!).getByText("$2,964.50")).toBeInTheDocument();
  });

  it("exposes category and monthly budget progress", () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole("progressbar", { name: "Housing spending" }),
    ).toHaveAttribute("aria-valuenow", "78");
    expect(
      screen.getByRole("progressbar", { name: "Monthly budget" }),
    ).toHaveAttribute("aria-valuenow", "62");
  });

  it("presents recent transactions as a table", () => {
    render(<DashboardPage />);

    const table = screen.getByRole("table");

    expect(
      within(table).getByRole("columnheader", { name: "Merchant" }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("rowheader", { name: "Grocery Market" }),
    ).toBeInTheDocument();
    expect(within(table).getByText("-$84.25")).toBeInTheDocument();
    expect(within(table).getByText("+$3,200.00")).toBeInTheDocument();
  });
});
