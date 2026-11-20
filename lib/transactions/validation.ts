import { z } from "zod";

import { parseUsdToCents } from "../money";

const transactionTypes = ["income", "expense"] as const;

const amountSchema = z.string().transform((value, context) => {
  const normalized = value.trim();

  if (/^[+-]/.test(normalized)) {
    context.addIssue({
      code: "custom",
      message: "Enter the amount without a positive or negative sign.",
    });
    return z.NEVER;
  }

  try {
    const cents = parseUsdToCents(normalized);

    if (cents <= 0) {
      context.addIssue({
        code: "custom",
        message: "Transaction amount must be greater than zero.",
      });
      return z.NEVER;
    }

    return cents;
  } catch (error) {
    context.addIssue({
      code: "custom",
      message:
        error instanceof Error ? error.message : "Enter a valid USD amount.",
    });
    return z.NEVER;
  }
});

const notesSchema = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized === "" ? null : normalized;
  }

  return value;
}, z.string().max(1_000, "Notes must be 1,000 characters or fewer.").nullable());

const transactionInputSchema = z
  .object({
    accountId: z.uuid({ error: "Select a valid account." }),
    transactionType: z.preprocess(
      (value) =>
        typeof value === "string" ? value.trim().toLowerCase() : value,
      z.enum(transactionTypes, {
        error: "Select a valid transaction type.",
      }),
    ),
    amount: amountSchema,
    transactionDate: z.iso.date(),
    description: z
      .string()
      .trim()
      .min(1, "Transaction must have a description.")
      .max(200, "Description must be 200 characters or fewer."),
    notes: notesSchema,
  })
  .transform(({ amount, transactionType, ...transaction }) => ({
    ...transaction,
    transactionType,
    amountCents: transactionType === "expense" ? -amount : amount,
  }));

export type TransactionInput = z.infer<typeof transactionInputSchema>;

export function parseTransactionInput(input: unknown): TransactionInput {
  return transactionInputSchema.parse(input);
}
