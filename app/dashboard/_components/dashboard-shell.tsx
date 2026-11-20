import Logout from "@/app/logout/logout";
import { DashboardNavigation } from "@/app/dashboard/_components/dashboard-navigation";
import Link from "next/link";

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

export function DashboardShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar px-5 py-6 lg:flex">
        <Brand />
        {email && (
          <p
            className="mt-2 w-full truncate text-center text-xs text-sidebar-muted"
            title={email}
          >
            {email}
          </p>
        )}

        <DashboardNavigation variant="primary" />

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-sidebar-muted">
            Monthly check-in
          </p>
          <p className="mt-2 text-sm leading-6 text-white/90">
            You are 62% through your planned spending.
          </p>
        </div>
        <Logout />
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

      <DashboardNavigation variant="mobile" />
    </div>
  );
}
