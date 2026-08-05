import Link from "next/link";

const navigation = [
  { label: "Overview", href: "/dashboard", shortLabel: "Home" },
  { label: "Accounts", href: "/dashboard/accounts", shortLabel: "Accounts" },
  {
    label: "Transactions",
    href: "/dashboard/transactions",
    shortLabel: "Activity",
  },
  { label: "Budgets", href: "/dashboard/budgets", shortLabel: "Budgets" },
];

function Brand() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-soft"
    >
      <span
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-xl bg-accent text-sm font-bold tracking-tight text-white shadow-sm"
      >
        BM
      </span>
      <span className="text-lg font-semibold tracking-tight text-white">
        Bank, Man!
      </span>
    </Link>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar px-5 py-6 lg:flex">
        <Brand />

        <nav aria-label="Primary" className="mt-10 flex flex-col gap-2">
          {navigation.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={index === 0 ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-soft ${
                index === 0
                  ? "bg-white/10 text-white"
                  : "text-sidebar-muted hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                aria-hidden="true"
                className={`size-2 rounded-full ${index === 0 ? "bg-accent" : "bg-sidebar-muted/50"}`}
              />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-sidebar-muted">
            Monthly check-in
          </p>
          <p className="mt-2 text-sm leading-6 text-white/90">
            You are 62% through your planned spending.
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
          <Brand />
          <span
            aria-label="User profile"
            className="grid size-9 place-items-center rounded-full bg-sage-soft text-sm font-semibold text-foreground"
          >
            AC
          </span>
        </header>

        <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-9 lg:pb-10">
          {children}
        </main>
      </div>

      <nav
        aria-label="Mobile"
        className="fixed inset-x-3 bottom-3 z-10 grid grid-cols-4 rounded-2xl border border-line bg-surface/95 p-2 shadow-[0_18px_50px_rgba(51,45,35,0.16)] backdrop-blur lg:hidden"
      >
        {navigation.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={index === 0 ? "page" : undefined}
            className={`rounded-xl px-1 py-2 text-center text-xs font-medium focus-visible:outline-2 focus-visible:outline-accent ${
              index === 0 ? "bg-accent-soft text-foreground" : "text-muted"
            }`}
          >
            {item.shortLabel}
          </Link>
        ))}
      </nav>
    </div>
  );
}
