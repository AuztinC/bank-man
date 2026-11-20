import { AccountForm } from "@/app/dashboard/accounts/_components/account-form";
import { formatCents, sumCents } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

type AccountRow = {
  id: string;
  account_name: string;
  account_type: string;
  currency: string;
  opening_balance_cents: number;
  opening_balance_as_of: string;
  opening_balance_status: string;
  transactions: { amount_cents: number }[];
};

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function AccountsPage() {
  let accounts: AccountRow[] = [];
  let loadFailed = false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("accounts")
      .select(
        "id, account_name, account_type, currency, opening_balance_cents, opening_balance_as_of, opening_balance_status, transactions(amount_cents)",
      )
      .is("archived_at", null)
      .order("account_name", { ascending: true });

    if (error) {
      loadFailed = true;
    } else {
      accounts = data ?? [];
    }
  } catch {
    loadFailed = true;
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-accent">Your money, organized</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
          Accounts
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          Add the accounts you use and keep each opening balance anchored to a
          clear date.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]">
        <section
          aria-labelledby="accounts-list-heading"
          className="rounded-2xl border border-line bg-surface p-5 shadow-[0_12px_40px_rgba(64,55,43,0.06)] sm:p-6"
        >
          <h2 id="accounts-list-heading" className="text-lg font-semibold">
            Your accounts
          </h2>
          <p className="mt-1 text-sm text-muted">
            Opening balances remain unverified until statement reconciliation.
          </p>

          {loadFailed ? (
            <p role="alert" className="mt-6 text-sm text-red-700">
              We couldn&apos;t load your accounts. Please try again.
            </p>
          ) : accounts.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface-muted/50 p-6">
              <h3 className="font-semibold">No accounts yet</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Create your first account to start tracking a balance.
              </p>
            </div>
          ) : (
            <ul aria-label="Your accounts" className="mt-6 space-y-4">
              {accounts.map((account) => (
                <li
                  key={account.id}
                  className="rounded-2xl border border-line bg-background/60 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{account.account_name}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {titleCase(account.account_type)}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xl font-semibold">
                        {formatCents(
                          sumCents([
                            account.opening_balance_cents,
                            ...account.transactions.map(
                              (transaction) => transaction.amount_cents,
                            ),
                          ]),
                        )}
                      </p>
                      <p className="mt-1 text-xs font-medium text-muted">
                        Current balance
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Opening balance as of{" "}
                        <time dateTime={account.opening_balance_as_of}>
                          {formatDate(account.opening_balance_as_of)}
                        </time>
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-foreground">
                    {titleCase(account.opening_balance_status)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="create-account-heading"
          className="rounded-2xl border border-line bg-surface p-5 shadow-[0_12px_40px_rgba(64,55,43,0.06)] sm:p-6"
        >
          <h2 id="create-account-heading" className="text-lg font-semibold">
            Create an account
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Enter the balance you know today. You can verify it with a statement
            later.
          </p>
          <AccountForm />
        </section>
      </div>
    </div>
  );
}
