"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { parseTransactionInput } from "@/lib/transactions/validation";

export type CreateTransactionState = {
  error: string | null;
  success: string | null;
};

const createFailure: CreateTransactionState = {
  error: "We couldn't create your transaction. Please try again.",
  success: null,
};

export async function createTransaction(
  _previousState: CreateTransactionState,
  formData: FormData,
): Promise<CreateTransactionState> {
  let transaction;

  try {
    transaction = parseTransactionInput({
      accountId: formData.get("accountId"),
      transactionType: formData.get("transactionType"),
      amount: formData.get("amount"),
      transactionDate: formData.get("transactionDate"),
      description: formData.get("description"),
      notes: formData.get("notes"),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.issues[0]?.message ?? "Check the information you entered.",
        success: null,
      };
    }

    throw error;
  }

  let supabase;
  let claimsResult;

  try {
    supabase = await createClient();
    claimsResult = await supabase.auth.getClaims();
  } catch {
    return createFailure;
  }

  const { data, error: authenticationError } = claimsResult;
  const userId = data?.claims?.sub;

  if (authenticationError || !userId) {
    return {
      error: "You must be signed in to create a transaction.",
      success: null,
    };
  }

  let accountResult;

  try {
    accountResult = await supabase
      .from("accounts")
      .select("id")
      .eq("id", transaction.accountId)
      .eq("user_id", userId)
      .is("archived_at", null)
      .maybeSingle();
  } catch {
    return createFailure;
  }

  if (accountResult.error) {
    return createFailure;
  }

  if (!accountResult.data) {
    return {
      error: "Select an active account you own.",
      success: null,
    };
  }

  let insertResult;

  try {
    insertResult = await supabase.from("transactions").insert({
      user_id: userId,
      account_id: transaction.accountId,
      transaction_type: transaction.transactionType,
      amount_cents: transaction.amountCents,
      transaction_date: transaction.transactionDate,
      description: transaction.description,
      notes: transaction.notes,
    });
  } catch {
    return createFailure;
  }

  if (insertResult.error) {
    return createFailure;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/transactions");

  return {
    error: null,
    success: "Transaction created.",
  };
}
