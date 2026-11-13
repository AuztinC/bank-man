import { z } from "zod";

import { parseUsdToCents } from "../money";

const allowedAccountTypes = ["checking", "savings", "cash"] as const;

const openingBalanceSchema = z.string().transform((value, context) => {
  try {
    return parseUsdToCents(value);
  } catch (error) {
    context.addIssue({
      code: "custom",
      message:
        error instanceof Error ? error.message : "Enter a valid USD amount.",
    });

    return z.NEVER;
  }
});

const accountCredentialsSchema = z
  .object({
    accountName: z.string().trim().min(1, "Account must have a name."),
    accountType: z.preprocess(
      (input) =>
        typeof input === "string" ? input.trim().toLowerCase() : input,
      z.enum(allowedAccountTypes, {
        error: "Select a valid account type.",
      }),
    ),
    openingBalance: openingBalanceSchema,
    openingBalanceAsOf: z.iso.date(),
  })
  .transform(({ openingBalance, ...account }) => ({
    ...account,
    openingBalanceCents: openingBalance,
  }));

export type AccountCredentials = z.infer<typeof accountCredentialsSchema>;

export function parseAccountInput(input: unknown): AccountCredentials {
  return accountCredentialsSchema.parse(input);
}
