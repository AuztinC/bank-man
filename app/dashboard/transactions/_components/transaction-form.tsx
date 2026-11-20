"use client";

import { useActionState } from "react";

import {
  createTransaction,
  type CreateTransactionState,
} from "@/app/dashboard/transactions/actions";

type TransactionAccount = {
  id: string;
  name: string;
};

export function TransactionForm({
  accounts,
}: {
  accounts: TransactionAccount[];
}) {
  const hasAccounts = accounts.length > 0;
  const initialState: CreateTransactionState = {
    error: null,
    success: null,
  };
  const [state, formAction, pending] = useActionState(
    createTransaction,
    initialState,
  );

  return (
    <form
      action={formAction}
      aria-label="Create a transaction"
      className="mt-6 space-y-5"
    >
      <div>
        <label htmlFor="accountId" className="text-sm font-semibold">
          Account
        </label>
        <select
          id="accountId"
          name="accountId"
          required
          disabled={!hasAccounts}
          defaultValue=""
          className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none transition focus:border-accent focus:ring-3 focus:ring-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="" disabled>
            Select an account
          </option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="transactionType" className="text-sm font-semibold">
          Transaction type
        </label>
        <select
          id="transactionType"
          name="transactionType"
          required
          defaultValue="expense"
          className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none transition focus:border-accent focus:ring-3 focus:ring-accent-soft"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div>
        <label htmlFor="amount" className="text-sm font-semibold">
          Amount
        </label>
        <input
          id="amount"
          name="amount"
          type="text"
          inputMode="decimal"
          required
          placeholder="0.00"
          aria-describedby="amount-help"
          className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none transition placeholder:text-muted/65 focus:border-accent focus:ring-3 focus:ring-accent-soft"
        />
        <p id="amount-help" className="mt-2 text-xs text-muted">
          Enter a positive amount. The transaction type determines its sign.
        </p>
      </div>

      <div>
        <label htmlFor="transactionDate" className="text-sm font-semibold">
          Transaction date
        </label>
        <input
          id="transactionDate"
          name="transactionDate"
          type="date"
          required
          className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none transition focus:border-accent focus:ring-3 focus:ring-accent-soft"
        />
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-semibold">
          Description
        </label>
        <input
          id="description"
          name="description"
          type="text"
          maxLength={200}
          required
          autoComplete="off"
          className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none transition focus:border-accent focus:ring-3 focus:ring-accent-soft"
        />
      </div>

      <div>
        <label htmlFor="notes" className="text-sm font-semibold">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          maxLength={1_000}
          rows={4}
          className="mt-2 w-full rounded-xl border border-line bg-surface px-4 py-3 text-base outline-none transition focus:border-accent focus:ring-3 focus:ring-accent-soft"
        />
      </div>

      {!hasAccounts && (
        <p role="status" className="text-sm text-muted">
          Create an account before recording your first transaction.
        </p>
      )}

      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-sage">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={!hasAccounts || pending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating transaction…" : "Create transaction"}
      </button>
    </form>
  );
}
