import Link from "next/link";

import { formatCents } from "@/lib/money";

const summaryCards = [
  {
    label: "Total balance",
    amount: 1_248_200,
    detail: "Across 3 accounts",
    tone: "bg-surface",
  },
  {
    label: "Income",
    amount: 482_000,
    detail: "This month",
    tone: "bg-sage-soft",
  },
  {
    label: "Spending",
    amount: 296_450,
    detail: "62% of your plan",
    tone: "bg-accent-soft",
  },
  {
    label: "Saved",
    amount: 185_550,
    detail: "Up 8% from last month",
    tone: "bg-[#e7e1f0]",
  },
];

const spendingCategories = [
  { name: "Housing", amount: 142_000, percentage: 78, color: "bg-accent" },
  { name: "Food", amount: 68_250, percentage: 52, color: "bg-sage" },
  { name: "Transport", amount: 41_200, percentage: 35, color: "bg-[#a58b72]" },
];

const transactions = [
  { merchant: "Grocery Market", category: "Food", amount: -8_425 },
  { merchant: "Monthly payroll", category: "Income", amount: 320_000 },
  { merchant: "Electric bill", category: "Utilities", amount: -12_640 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Your money, clearly</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted sm:text-base">
            A calm look at what came in, what went out, and what is left for the
            month.
          </p>
        </div>
        <Link
          href="/dashboard/transactions/new"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sidebar px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-sidebar/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Add transaction
        </Link>
      </header>

      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="sr-only">
          Financial summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article
              key={card.label}
              className={`${card.tone} rounded-2xl border border-line/80 p-5 shadow-[0_12px_40px_rgba(64,55,43,0.06)]`}
            >
              <h3 className="text-sm font-medium text-muted">{card.label}</h3>
              <p className="mt-3 text-2xl font-semibold tracking-tight">
                {formatCents(card.amount)}
              </p>
              <p className="mt-2 text-xs text-muted">{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section
          aria-labelledby="spending-heading"
          className="rounded-2xl border border-line bg-surface p-5 shadow-[0_12px_40px_rgba(64,55,43,0.06)] sm:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 id="spending-heading" className="text-lg font-semibold">
                Spending overview
              </h2>
              <p className="mt-1 text-sm text-muted">Your largest categories</p>
            </div>
            <Link
              href="/dashboard/transactions"
              className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              View activity
            </Link>
          </div>

          <div className="mt-7 space-y-6">
            {spendingCategories.map((category) => (
              <div key={category.name}>
                <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-muted">
                    {formatCents(category.amount)}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={`${category.name} spending`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={category.percentage}
                  className="h-2.5 overflow-hidden rounded-full bg-surface-muted"
                >
                  <div
                    className={`h-full rounded-full ${category.color}`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="budget-heading"
          className="rounded-2xl bg-sidebar p-6 text-white shadow-[0_16px_45px_rgba(37,40,33,0.16)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sidebar-muted">
            Monthly plan
          </p>
          <h2 id="budget-heading" className="mt-3 text-xl font-semibold">
            Budget progress
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            You have {formatCents(183_550)} left across your active budgets.
          </p>

          <div className="mt-8">
            <div className="mb-2 flex justify-between text-sm">
              <span>Spent</span>
              <span>62%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Monthly budget"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={62}
              className="h-3 overflow-hidden rounded-full bg-white/10"
            >
              <div className="h-full w-[62%] rounded-full bg-accent" />
            </div>
          </div>

          <Link
            href="/dashboard/budgets"
            className="mt-8 inline-flex text-sm font-semibold text-accent-soft underline-offset-4 hover:underline"
          >
            Review budgets
          </Link>
        </section>
      </div>

      <section
        aria-labelledby="transactions-heading"
        className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_12px_40px_rgba(64,55,43,0.06)]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-5 sm:px-6">
          <div>
            <h2 id="transactions-heading" className="text-lg font-semibold">
              Recent transactions
            </h2>
            <p className="mt-1 text-sm text-muted">
              Your latest account activity
            </p>
          </div>
          <Link
            href="/dashboard/transactions"
            className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            See all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">
                  Merchant
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-right font-medium">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {transactions.map((transaction) => (
                <tr key={transaction.merchant}>
                  <th scope="row" className="px-6 py-4 font-medium">
                    {transaction.merchant}
                  </th>
                  <td className="px-6 py-4 text-muted">
                    {transaction.category}
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-semibold ${
                      transaction.amount > 0 ? "text-sage" : "text-foreground"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {formatCents(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
