import { TransactionForm } from "@/app/dashboard/transactions/_components/transaction-form";
import { formatCents } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

type AccountRow = {
  id: string;
  account_name: string;
};

type TransactionRow = {
  id: string;
  transaction_type: string;
  amount_cents: number;
  transaction_date: string;
  description: string;
  notes: string | null;
  accounts: { account_name: string }[];
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

export default async function TransactionsPage() {
  let accounts: AccountRow[] = [];
  let transactions: TransactionRow[] = [];
  let accountLoadFailed = false;
  let transactionLoadFailed = false;

  try {
    const supabase = await createClient();
    const accountResult = await supabase
      .from("accounts")
      .select("id, account_name")
      .is("archived_at", null)
      .order("account_name", { ascending: true });

    if (accountResult.error) {
      accountLoadFailed = true;
    } else {
      accounts = accountResult.data ?? [];
    }

    const transactionResult = await supabase
      .from("transactions")
      .select(
        "id, transaction_type, amount_cents, transaction_date, description, notes, accounts(account_name)",
      )
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (transactionResult.error) {
      transactionLoadFailed = true;
    } else {
      transactions = transactionResult.data ?? [];
    }
  } catch {
    accountLoadFailed = true;
    transactionLoadFailed = true;
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-accent">Track every movement</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
          Transactions
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          Record income and expenses against the account where they occurred.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]">
        <section
          aria-labelledby="transactions-list-heading"
          className="min-w-0 rounded-2xl border border-line bg-surface p-5 shadow-[0_12px_40px_rgba(64,55,43,0.06)] sm:p-6"
        >
          <h2 id="transactions-list-heading" className="text-lg font-semibold">
            Your transactions
          </h2>
          <p className="mt-1 text-sm text-muted">
            Income and expenses are shown newest first.
          </p>

          {transactionLoadFailed ? (
            <p role="alert" className="mt-6 text-sm text-red-700">
              We couldn&apos;t load your transactions. Please try again.
            </p>
          ) : transactions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface-muted/50 p-6">
              <h3 className="font-semibold">No transactions yet</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Create your first transaction to start account history.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table
                aria-label="Your transactions"
                className="w-full min-w-160 border-collapse text-left text-sm"
              >
                <thead>
                  <tr className="border-b border-line text-xs text-muted">
                    <th scope="col" className="px-3 py-3 font-semibold">
                      Description
                    </th>
                    <th scope="col" className="px-3 py-3 font-semibold">
                      Account
                    </th>
                    <th scope="col" className="px-3 py-3 font-semibold">
                      Date
                    </th>
                    <th scope="col" className="px-3 py-3 font-semibold">
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-right font-semibold"
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-line/70"
                    >
                      <th scope="row" className="px-3 py-4 font-semibold">
                        {transaction.description}
                        {transaction.notes && (
                          <span className="mt-1 block text-xs font-normal text-muted">
                            {transaction.notes}
                          </span>
                        )}
                      </th>
                      <td className="px-3 py-4 text-muted">
                        {transaction.accounts[0]?.account_name ??
                          "Unknown account"}
                      </td>
                      <td className="px-3 py-4 text-muted">
                        <time dateTime={transaction.transaction_date}>
                          {formatDate(transaction.transaction_date)}
                        </time>
                      </td>
                      <td className="px-3 py-4 text-muted">
                        {titleCase(transaction.transaction_type)}
                      </td>
                      <td className="px-3 py-4 text-right font-semibold tabular-nums">
                        {transaction.amount_cents > 0 ? "+" : ""}
                        {formatCents(transaction.amount_cents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section
          aria-labelledby="create-transaction-heading"
          className="rounded-2xl border border-line bg-surface p-5 shadow-[0_12px_40px_rgba(64,55,43,0.06)] sm:p-6"
        >
          <h2 id="create-transaction-heading" className="text-lg font-semibold">
            Create a transaction
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Choose whether money entered or left an account. Enter the amount
            without a positive or negative sign.
          </p>

          {accountLoadFailed && (
            <p role="alert" className="mt-6 text-sm text-red-700">
              We couldn&apos;t load your accounts. Please try again.
            </p>
          )}

          <TransactionForm
            accounts={accounts.map((account) => ({
              id: account.id,
              name: account.account_name,
            }))}
          />
        </section>
      </div>
    </div>
  );
}
