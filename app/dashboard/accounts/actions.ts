"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { parseAccountInput } from "@/lib/accounts/validation";
import { createClient } from "@/lib/supabase/server";

export type CreateAccountState = {
  error: string | null;
  success: string | null;
};

export async function createAccount(
  _previousState: CreateAccountState,
  formData: FormData,
): Promise<CreateAccountState> {
  let account;

  try {
    account = parseAccountInput({
      accountName: formData.get("accountName"),
      accountType: formData.get("accountType"),
      openingBalance: formData.get("openingBalance"),
      openingBalanceAsOf: formData.get("openingBalanceAsOf"),
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
    return {
      error: "We couldn't create your account. Please try again.",
      success: null,
    };
  }

  const { data, error: authenticationError } = claimsResult;
  const userId = data?.claims?.sub;

  if (authenticationError || !userId) {
    return {
      error: "You must be signed in to create an account.",
      success: null,
    };
  }

  let insertResult;

  try {
    insertResult = await supabase.from("accounts").insert({
      user_id: userId,
      account_name: account.accountName,
      account_type: account.accountType,
      opening_balance_cents: account.openingBalanceCents,
      opening_balance_as_of: account.openingBalanceAsOf,
      opening_balance_status: "unverified",
    });
  } catch {
    return {
      error: "We couldn't create your account. Please try again.",
      success: null,
    };
  }

  const { error } = insertResult;

  if (error) {
    return {
      error: "We couldn't create your account. Please try again.",
      success: null,
    };
  }

  revalidatePath("/dashboard/accounts");

  return {
    error: null,
    success: "Account created.",
  };
}
