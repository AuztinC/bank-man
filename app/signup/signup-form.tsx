"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signup, type SignupState } from "./actions";

const initialState: SignupState = {
  error: null,
  success: null,
};

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <form
      action={formAction}
      aria-labelledby="signup-heading"
      className="mt-8 space-y-5"
    >
      <div>
        <label
          htmlFor="email"
          className="text-sm font-semibold text-foreground"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none transition placeholder:text-muted/65 focus:border-accent focus:ring-3 focus:ring-accent-soft"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-sm font-semibold text-foreground"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          aria-describedby="password-hint"
          className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none transition focus:border-accent focus:ring-3 focus:ring-accent-soft"
        />
        <p id="password-hint" className="mt-2 text-xs leading-5 text-muted">
          Use at least 8 characters.
        </p>
      </div>

      <div>
        <label
          htmlFor="passwordConfirmation"
          className="text-sm font-semibold text-foreground"
        >
          Confirm password
        </label>
        <input
          id="passwordConfirmation"
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none transition focus:border-accent focus:ring-3 focus:ring-accent-soft"
        />
      </div>

      <label className="flex items-start gap-3 text-sm leading-6 text-muted">
        <input
          name="acceptTerms"
          type="checkbox"
          required
          className="mt-1 size-4 shrink-0 rounded border-line accent-accent"
        />
        <span>
          I agree to the{" "}
          <Link
            href="/terms"
            className="rounded font-semibold text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="rounded font-semibold text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
          >
            Privacy Policy
          </Link>
        </span>
      </label>

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

      <Link
        href="/login"
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-line bg-surface px-6 text-sm font-semibold transition hover:border-muted/50 hover:bg-surface-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Already have an account? Log in
      </Link>
    </form>
  );
}
