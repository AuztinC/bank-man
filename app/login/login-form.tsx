"use client";
import Link from "next/link";
import { login, type LoginState } from "./actions";
import { useActionState } from "react";

const initialState: LoginState = {
  error: null,
};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  return (
    <form
      action={formAction}
      aria-labelledby="login-heading"
      method="POST"
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
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-foreground"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="rounded text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none transition focus:border-accent focus:ring-3 focus:ring-accent-soft"
        />
      </div>

      <label className="flex w-fit items-center gap-3 text-sm text-muted">
        <input
          name="remember"
          type="checkbox"
          className="size-4 rounded border-line accent-accent"
        />
        Remember me on this device
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar"
        disabled={pending}
      >
        {pending ? "Logging in…" : "Log in"}
      </button>

      <div className="flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          New here?
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <Link
        href="/signup"
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-line bg-surface px-6 text-sm font-semibold transition hover:border-muted/50 hover:bg-surface-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Create an account
      </Link>
    </form>
  );
}
