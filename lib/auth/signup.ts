import { z } from "zod";

const signupCredentialsSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Enter a valid email address.")),
    password: z.string().min(8, "Password must be at least 8 characters."),
    passwordConfirmation: z.string(),
    acceptTerms: z.literal("on", {
      error: "You must agree to the Terms and Privacy Policy.",
    }),
  })
  .refine(
    (credentials) => credentials.password === credentials.passwordConfirmation,
    {
      message: "Passwords must match.",
      path: ["passwordConfirmation"],
    },
  );

export type SignupCredentials = z.infer<typeof signupCredentialsSchema>;

export function parseSignupCredentials(input: unknown): SignupCredentials {
  return signupCredentialsSchema.parse(input);
}
