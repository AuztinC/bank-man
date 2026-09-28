import { describe, expect, it } from "vitest";

import { parseSignupCredentials } from "@/lib/auth/signup";

describe("parseSignupCredentials", () => {
  it("normalizes valid signup credentials", () => {
    expect(
      parseSignupCredentials({
        email: "  PERSON@Example.COM  ",
        password: "secure-password",
        passwordConfirmation: "secure-password",
        acceptTerms: "on",
      }),
    ).toEqual({
      email: "person@example.com",
      password: "secure-password",
      passwordConfirmation: "secure-password",
      acceptTerms: "on",
    });
  });

  it("rejects mismatched passwords", () => {
    expect(() =>
      parseSignupCredentials({
        email: "person@example.com",
        password: "secure-password",
        passwordConfirmation: "different-password",
        acceptTerms: "on",
      }),
    ).toThrow("Passwords must match.");
  });

  it("requires acceptance of the terms", () => {
    expect(() =>
      parseSignupCredentials({
        email: "person@example.com",
        password: "secure-password",
        passwordConfirmation: "secure-password",
        acceptTerms: null,
      }),
    ).toThrow("You must agree to the Terms and Privacy Policy.");
  });
});
