import { z } from "zod";

const loginCredentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address.")),
  password: z.string().min(1, "Enter your password."),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

export function parseLoginCredentials(input: unknown): LoginCredentials {
  return loginCredentialsSchema.parse(input);
}
