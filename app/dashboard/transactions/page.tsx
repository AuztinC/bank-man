import { TransactionForm } from "@/app/dashboard/transactions/_components/transaction-form";
import { createClient } from "@/lib/supabase/server";

type AccountRow = {
  id: string;
  account_name: string;
};

export default async function TransactionsPage() {
  let accounts: AccountRow[] = [];
  let loadFailed = false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("accounts")
      .select("id, account_name")
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
        <p className="text-sm font-medium text-accent">Track every movement</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
          Transactions
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          Record income and expenses against the account where they occurred.
        </p>
      </header>

      <section
        aria-labelledby="create-transaction-heading"
        className="max-w-2xl rounded-2xl border border-line bg-surface p-5 shadow-[0_12px_40px_rgba(64,55,43,0.06)] sm:p-6"
      >
        <h2 id="create-transaction-heading" className="text-lg font-semibold">
          Create a transaction
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Choose whether money entered or left an account. Enter the amount
          without a positive or negative sign.
        </p>

        {loadFailed && (
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
  );
}
