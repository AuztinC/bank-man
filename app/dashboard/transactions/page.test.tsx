import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TransactionsPage from "@/app/dashboard/transactions/page";

const {
  accountIsMock,
  accountOrderMock,
  accountSelectMock,
  createClientMock,
  fromMock,
  transactionCreatedOrderMock,
  transactionDateOrderMock,
  transactionSelectMock,
} = vi.hoisted(() => ({
  accountIsMock: vi.fn(),
  accountOrderMock: vi.fn(),
  accountSelectMock: vi.fn(),
  createClientMock: vi.fn(),
  fromMock: vi.fn(),
  transactionCreatedOrderMock: vi.fn(),
  transactionDateOrderMock: vi.fn(),
  transactionSelectMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

describe("TransactionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    accountOrderMock.mockResolvedValue({ data: [], error: null });
    accountIsMock.mockReturnValue({ order: accountOrderMock });
    accountSelectMock.mockReturnValue({ is: accountIsMock });
    transactionCreatedOrderMock.mockResolvedValue({ data: [], error: null });
    transactionDateOrderMock.mockReturnValue({
      order: transactionCreatedOrderMock,
    });
    transactionSelectMock.mockReturnValue({
      order: transactionDateOrderMock,
    });
    fromMock.mockImplementation((table: string) =>
      table === "accounts"
        ? { select: accountSelectMock }
        : { select: transactionSelectMock },
    );
    createClientMock.mockResolvedValue({ from: fromMock });
  });

  it("loads active accounts using only the fields needed by the form", async () => {
    render(await TransactionsPage());

    expect(fromMock).toHaveBeenCalledWith("accounts");
    expect(accountSelectMock).toHaveBeenCalledWith("id, account_name");
    expect(accountIsMock).toHaveBeenCalledWith("archived_at", null);
    expect(accountOrderMock).toHaveBeenCalledWith("account_name", {
      ascending: true,
    });
  });

  it("introduces transaction management and includes the creation form", async () => {
    render(await TransactionsPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Transactions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Create a transaction" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("form", { name: "Create a transaction" }),
    ).toBeInTheDocument();
  });

  it("maps active accounts into the account selector", async () => {
    accountOrderMock.mockResolvedValue({
      data: [
        { id: "account-1", account_name: "Everyday Checking" },
        { id: "account-2", account_name: "Emergency Savings" },
      ],
      error: null,
    });

    render(await TransactionsPage());

    const account = screen.getByRole("combobox", { name: "Account" });

    expect(
      within(account).getByRole("option", { name: "Everyday Checking" }),
    ).toHaveAttribute("value", "account-1");
    expect(
      within(account).getByRole("option", { name: "Emergency Savings" }),
    ).toHaveAttribute("value", "account-2");
  });

  it("shows a safe loading error and prevents transaction creation", async () => {
    accountOrderMock.mockResolvedValue({
      data: null,
      error: new Error("relation public.accounts does not exist"),
    });

    render(await TransactionsPage());

    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't load your accounts. Please try again.",
    );
    expect(
      screen.queryByText("relation public.accounts does not exist"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create transaction" }),
    ).toBeDisabled();
  });

  it("loads transactions newest first with their account names", async () => {
    render(await TransactionsPage());

    expect(fromMock).toHaveBeenCalledWith("transactions");
    expect(transactionSelectMock).toHaveBeenCalledWith(
      "id, transaction_type, amount_cents, transaction_date, description, notes, accounts(account_name)",
    );
    expect(transactionDateOrderMock).toHaveBeenCalledWith("transaction_date", {
      ascending: false,
    });
    expect(transactionCreatedOrderMock).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
  });

  it("renders persisted transactions in an accessible table", async () => {
    transactionCreatedOrderMock.mockResolvedValue({
      data: [
        {
          id: "transaction-1",
          transaction_type: "expense",
          amount_cents: -4_250,
          transaction_date: "2026-11-19",
          description: "Groceries",
          notes: "Weekly shop",
          accounts: [{ account_name: "Everyday Checking" }],
        },
        {
          id: "transaction-2",
          transaction_type: "income",
          amount_cents: 100_000,
          transaction_date: "2026-11-18",
          description: "Paycheck",
          notes: null,
          accounts: [{ account_name: "Everyday Checking" }],
        },
      ],
      error: null,
    });

    render(await TransactionsPage());

    const table = screen.getByRole("table", { name: "Your transactions" });
    const rows = within(table).getAllByRole("row");

    expect(rows).toHaveLength(3);
    expect(within(rows[1]).getByText("Groceries")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Weekly shop")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Everyday Checking")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Expense")).toBeInTheDocument();
    expect(within(rows[1]).getByText("-$42.50")).toBeInTheDocument();
    expect(within(rows[1]).getByText("November 19, 2026")).toHaveAttribute(
      "datetime",
      "2026-11-19",
    );
    expect(within(rows[2]).getByText("+$1,000.00")).toBeInTheDocument();
  });

  it("shows a useful empty transaction state", async () => {
    render(await TransactionsPage());

    expect(
      screen.getByRole("heading", { name: "No transactions yet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Create your first transaction to start account history.",
      ),
    ).toBeInTheDocument();
  });

  it("shows a safe transaction loading error", async () => {
    transactionCreatedOrderMock.mockResolvedValue({
      data: null,
      error: new Error("relation public.transactions does not exist"),
    });

    render(await TransactionsPage());

    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't load your transactions. Please try again.",
    );
    expect(
      screen.queryByText("relation public.transactions does not exist"),
    ).not.toBeInTheDocument();
  });
});
