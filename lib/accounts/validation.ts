import { z } from "zod";

const allowedAccountTypes: string[] = ["checking", "savings", "cash"];
const accountCredentialsSchema = z.object({
  accountName: z.string().min(1, "Account must have a name."),
  accountType: z.preprocess(
    (input) => (typeof input === "string" ? input.trim().toLowerCase() : input),
    z.enum(allowedAccountTypes, {
      error: "Select a valid account type.",
    }),
  ),
  openingBalance: z.string(),
  openingBalanceAsOf: z.iso.date(),
});

export type AccountCredentials = z.infer<typeof accountCredentialsSchema>;

export function parseAccountInput(input: unknown): AccountCredentials {
  return accountCredentialsSchema.parse(input);
}
