import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AccountsPage from "@/app/dashboard/accounts/page";

const { createClientMock, fromMock, isMock, orderMock, selectMock } =
  vi.hoisted(() => ({
    createClientMock: vi.fn(),
    fromMock: vi.fn(),
    isMock: vi.fn(),
    orderMock: vi.fn(),
    selectMock: vi.fn(),
  }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

describe("AccountsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    orderMock.mockResolvedValue({ data: [], error: null });
    isMock.mockReturnValue({ order: orderMock });
    selectMock.mockReturnValue({ is: isMock });
    fromMock.mockReturnValue({ select: selectMock });
    createClientMock.mockResolvedValue({ from: fromMock });
  });

  it("loads active accounts using only the fields needed by the page", async () => {
    render(await AccountsPage());

    expect(fromMock).toHaveBeenCalledWith("accounts");
    expect(selectMock).toHaveBeenCalledWith(
      "id, account_name, account_type, currency, opening_balance_cents, opening_balance_as_of, opening_balance_status, transactions(amount_cents)",
    );
    expect(isMock).toHaveBeenCalledWith("archived_at", null);
    expect(orderMock).toHaveBeenCalledWith("account_name", {
      ascending: true,
    });
  });

  it("introduces account management and includes the creation form", async () => {
    render(await AccountsPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Accounts" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("form", { name: "Create an account" }),
    ).toBeInTheDocument();
  });

  it("renders account details in an accessible list", async () => {
    orderMock.mockResolvedValue({
      data: [
        {
          id: "account-1",
          account_name: "Everyday Checking",
          account_type: "checking",
          currency: "USD",
          opening_balance_cents: 12_345,
          opening_balance_as_of: "2026-11-13",
          opening_balance_status: "unverified",
          transactions: [{ amount_cents: 10_000 }, { amount_cents: -4_250 }],
        },
        {
          id: "account-2",
          account_name: "Emergency Savings",
          account_type: "savings",
          currency: "USD",
          opening_balance_cents: 250_000,
          opening_balance_as_of: "2026-10-31",
          opening_balance_status: "verified",
          transactions: [],
        },
      ],
      error: null,
    });

    render(await AccountsPage());

    const list = screen.getByRole("list", { name: "Your accounts" });
    const accounts = within(list).getAllByRole("listitem");

    expect(accounts).toHaveLength(2);
    expect(
      within(accounts[0]).getByRole("heading", {
        name: "Everyday Checking",
      }),
    ).toBeInTheDocument();
    expect(within(accounts[0]).getByText("Checking")).toBeInTheDocument();
    expect(within(accounts[0]).getByText("$180.95")).toBeInTheDocument();
    expect(
      within(accounts[0]).getByText("Current balance"),
    ).toBeInTheDocument();
    expect(within(accounts[0]).getByText("Unverified")).toBeInTheDocument();
    expect(within(accounts[0]).getByText("November 13, 2026")).toHaveAttribute(
      "datetime",
      "2026-11-13",
    );

    expect(
      within(accounts[1]).getByRole("heading", {
        name: "Emergency Savings",
      }),
    ).toBeInTheDocument();
    expect(within(accounts[1]).getByText("$2,500.00")).toBeInTheDocument();
    expect(within(accounts[1]).getByText("Verified")).toBeInTheDocument();
  });

  it("shows a useful empty state", async () => {
    render(await AccountsPage());

    expect(
      screen.getByRole("heading", { name: "No accounts yet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Create your first account to start tracking a balance.",
      ),
    ).toBeInTheDocument();
  });

  it("shows a safe loading error without exposing database details", async () => {
    orderMock.mockResolvedValue({
      data: null,
      error: new Error("relation public.accounts does not exist"),
    });

    render(await AccountsPage());

    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't load your accounts. Please try again.",
    );
    expect(
      screen.queryByText("relation public.accounts does not exist"),
    ).not.toBeInTheDocument();
  });
});
