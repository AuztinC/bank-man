import Link from "next/link";

const reassuranceItems = [
  {
    title: "Private by design",
    description: "Your financial records stay connected to your account only.",
    icon: (
      <path d="M12 3 5 6v5c0 4.6 2.9 8.8 7 10 4.1-1.2 7-5.4 7-10V6l-7-3Zm-3 9 2 2 4-4" />
    ),
  },
  {
    title: "A calmer place to plan",
    description: "Pick up where you left off without the noise or pressure.",
    icon: (
      <>
        <path d="M6 3v3M18 3v3M4 9h16" />
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="m8 15 2 2 5-5" />
      </>
    ),
  },
] as const;

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-1 bg-background px-4 py-6 text-foreground sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-line bg-surface shadow-[0_28px_80px_rgba(64,55,43,0.14)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col px-6 py-7 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
          <Link
            href="/"
            className="flex w-fit items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-xl bg-accent text-sm font-bold text-white shadow-sm"
            >
              BM
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Bank, Man!
            </span>
          </Link>

          <div className="my-auto py-12 sm:py-16 lg:max-w-md lg:py-20">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              Good to see you
            </p>
            <h1
              id="login-heading"
              className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl"
            >
              Welcome back.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted">
              Sign in to revisit your accounts, monthly plan, and recent
              progress.
            </p>

            <form
              aria-labelledby="login-heading"
              method="post"
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="username"
                  className="text-sm font-semibold text-foreground"
                >
                  Username or email
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
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

              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar"
              >
                Log in
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
          </div>

          <p className="text-xs leading-5 text-muted">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="rounded underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
            >
              Terms
            </Link>{" "}
            and acknowledge our{" "}
            <Link
              href="/privacy"
              className="rounded underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <aside className="relative hidden overflow-hidden bg-sidebar px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 size-72 rounded-full bg-accent/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-28 -left-20 size-80 rounded-full bg-sage/25 blur-3xl"
          />

          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-soft">
              Your space is waiting
            </p>
            <h2 className="mt-5 max-w-md text-4xl font-semibold leading-tight tracking-[-0.04em]">
              Come back to money that feels manageable.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/65">
              A clear monthly view, thoughtful categories, and your next small
              step—all in one calm place.
            </p>
          </div>

          <div className="relative space-y-4">
            {reassuranceItems.map((item, index) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-xl ${
                    index === 0 ? "bg-accent" : "bg-sage"
                  }`}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="size-6"
                  >
                    {item.icon}
                  </svg>
                </span>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-white/60">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
