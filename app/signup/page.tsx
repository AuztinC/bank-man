import Link from "next/link";

import SignupForm from "./signup-form";

const reassuranceItems = [
  {
    title: "Private from the start",
    description:
      "Your financial records stay connected to your account and isolated from everyone else.",
    icon: (
      <path d="M12 3 5 6v5c0 4.6 2.9 8.8 7 10 4.1-1.2 7-5.4 7-10V6l-7-3Zm-3 9 2 2 4-4" />
    ),
  },
  {
    title: "Start at your pace",
    description:
      "Add only what helps today, then build a clearer picture over time.",
    icon: (
      <>
        <path d="M6 3v3M18 3v3M4 9h16" />
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="m8 15 2 2 5-5" />
      </>
    ),
  },
] as const;

export default function SignupPage() {
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
              Make yourself at home
            </p>
            <h1
              id="signup-heading"
              className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl"
            >
              Create your account.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted">
              Begin with a calm, private space for understanding your money and
              planning what comes next.
            </p>

            <SignupForm />
          </div>
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
              A thoughtful beginning
            </p>
            <h2 className="mt-5 max-w-md text-4xl font-semibold leading-tight tracking-[-0.04em]">
              Build clarity without the pressure.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/65">
              Bring your accounts, everyday spending, and monthly intentions
              into one welcoming view.
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
