import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TransactionsPage from "@/app/dashboard/transactions/page";

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

describe("TransactionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    orderMock.mockResolvedValue({ data: [], error: null });
    isMock.mockReturnValue({ order: orderMock });
    selectMock.mockReturnValue({ is: isMock });
    fromMock.mockReturnValue({ select: selectMock });
    createClientMock.mockResolvedValue({ from: fromMock });
  });

  it("loads active accounts using only the fields needed by the form", async () => {
    render(await TransactionsPage());

    expect(fromMock).toHaveBeenCalledWith("accounts");
    expect(selectMock).toHaveBeenCalledWith("id, account_name");
    expect(isMock).toHaveBeenCalledWith("archived_at", null);
    expect(orderMock).toHaveBeenCalledWith("account_name", {
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
    orderMock.mockResolvedValue({
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
    orderMock.mockResolvedValue({
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
});
