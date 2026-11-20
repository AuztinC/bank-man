"use client";

import { useActionState } from "react";

import {
  createAccount,
  type CreateAccountState,
} from "@/app/dashboard/accounts/actions";

const initialState: CreateAccountState = {
  error: null,
  success: null,
};

export function AccountForm() {
  const [state, formAction, pending] = useActionState(
    createAccount,
    initialState,
  );

  return (
    <form
      action={formAction}
      aria-label="Create an account"
      className="mt-6 space-y-5"
    >
      <div>
        <label htmlFor="accountName" className="text-sm font-semibold">
          Account name
        </label>
        <input
          id="accountName"
          name="accountName"
          type="text"
          autoComplete="off"
          maxLength={100}
          required
          className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none transition focus:border-accent focus:ring-3 focus:ring-accent-soft"
        />
      </div>

      <div>
        <label htmlFor="accountType" className="text-sm font-semibold">
          Account type
        </label>
        <select
          id="accountType"
          name="accountType"
          required
          defaultValue=""
          className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none transition focus:border-accent focus:ring-3 focus:ring-accent-soft"
        >
          <option value="" disabled>
            Select an account type
          </option>
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="cash">Cash</option>
        </select>
      </div>

      <div>
        <label htmlFor="openingBalance" className="text-sm font-semibold">
          Opening balance
        </label>
        <input
          id="openingBalance"
          name="openingBalance"
          type="text"
          inputMode="decimal"
          required
          placeholder="0.00"
          className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none transition placeholder:text-muted/65 focus:border-accent focus:ring-3 focus:ring-accent-soft"
        />
      </div>

      <div>
        <label htmlFor="openingBalanceAsOf" className="text-sm font-semibold">
          Opening balance date
        </label>
        <input
          id="openingBalanceAsOf"
          name="openingBalanceAsOf"
          type="date"
          required
          className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none transition focus:border-accent focus:ring-3 focus:ring-accent-soft"
        />
      </div>

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
        disabled={pending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
