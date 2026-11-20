"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

function isCurrentPath(pathname: string, href: string): boolean {
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNavigation({
  variant,
}: {
  variant: "primary" | "mobile";
}) {
  const pathname = usePathname();

  if (variant === "primary") {
    return (
      <nav aria-label="Primary" className="mt-10 flex flex-col gap-2">
        {navigation.map((item) => {
          const isCurrent = isCurrentPath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-soft ${
                isCurrent
                  ? "bg-white/10 text-white"
                  : "text-sidebar-muted hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                aria-hidden="true"
                className={`size-2 rounded-full ${
                  isCurrent ? "bg-accent" : "bg-sidebar-muted/50"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-3 bottom-3 z-10 grid grid-cols-4 rounded-2xl border border-line bg-surface/95 p-2 shadow-[0_18px_50px_rgba(51,45,35,0.16)] backdrop-blur lg:hidden"
    >
      {navigation.map((item) => {
        const isCurrent = isCurrentPath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isCurrent ? "page" : undefined}
            className={`rounded-xl px-1 py-2 text-center text-xs font-medium focus-visible:outline-2 focus-visible:outline-accent ${
              isCurrent ? "bg-accent-soft text-foreground" : "text-muted"
            }`}
          >
            {item.shortLabel}
          </Link>
        );
      })}
    </nav>
  );
}
