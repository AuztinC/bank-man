import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TransactionForm } from "@/app/dashboard/transactions/_components/transaction-form";

const accounts = [
  { id: "account-1", name: "Everyday Checking" },
  { id: "account-2", name: "Emergency Savings" },
];

describe("TransactionForm", () => {
  it("renders the fields expected by transaction validation", () => {
    render(<TransactionForm accounts={accounts} />);

    const form = screen.getByRole("form", { name: "Create a transaction" });
    const account = within(form).getByRole("combobox", { name: "Account" });
    const transactionType = within(form).getByRole("combobox", {
      name: "Transaction type",
    });
    const amount = within(form).getByRole("textbox", { name: "Amount" });
    const transactionDate = within(form).getByLabelText("Transaction date");
    const description = within(form).getByRole("textbox", {
      name: "Description",
    });
    const notes = within(form).getByRole("textbox", { name: "Notes" });

    expect(account).toHaveAttribute("name", "accountId");
    expect(account).toBeRequired();
    expect(
      within(account).getByRole("option", { name: "Everyday Checking" }),
    ).toHaveAttribute("value", "account-1");
    expect(
      within(account).getByRole("option", { name: "Emergency Savings" }),
    ).toHaveAttribute("value", "account-2");

    expect(transactionType).toHaveAttribute("name", "transactionType");
    expect(transactionType).toBeRequired();
    expect(
      within(transactionType).getByRole("option", { name: "Expense" }),
    ).toHaveAttribute("value", "expense");
    expect(
      within(transactionType).getByRole("option", { name: "Income" }),
    ).toHaveAttribute("value", "income");

    expect(amount).toHaveAttribute("name", "amount");
    expect(amount).toHaveAttribute("inputmode", "decimal");
    expect(amount).toHaveAttribute("placeholder", "0.00");
    expect(amount).toBeRequired();

    expect(transactionDate).toHaveAttribute("name", "transactionDate");
    expect(transactionDate).toHaveAttribute("type", "date");
    expect(transactionDate).toBeRequired();

    expect(description).toHaveAttribute("name", "description");
    expect(description).toHaveAttribute("maxlength", "200");
    expect(description).toBeRequired();

    expect(notes).toHaveAttribute("name", "notes");
    expect(notes).toHaveAttribute("maxlength", "1000");
    expect(notes).not.toBeRequired();

    expect(
      within(form).getByRole("button", { name: "Create transaction" }),
    ).toHaveAttribute("type", "submit");
  });

  it("prevents submission when there are no accounts", () => {
    render(<TransactionForm accounts={[]} />);

    const form = screen.getByRole("form", { name: "Create a transaction" });

    expect(
      within(form).getByRole("combobox", { name: "Account" }),
    ).toBeDisabled();
    expect(
      within(form).getByRole("button", { name: "Create transaction" }),
    ).toBeDisabled();
    expect(
      within(form).getByText(
        "Create an account before recording your first transaction.",
      ),
    ).toBeInTheDocument();
  });
});
