import { describe, expect, it } from "vitest";

import { parseLoginCredentials } from "@/lib/auth/login";

describe("parseLoginCredentials", () => {
  it("accepts valid login credentials and normalizes the email", () => {
    expect(
      parseLoginCredentials({
        email: "  PERSON@Example.COM  ",
        password: "valid-password-123",
      }),
    ).toEqual({
      email: "person@example.com",
      password: "valid-password-123",
    });
  });

  it("preserves whitespace in passwords", () => {
    expect(
      parseLoginCredentials({
        email: "person@example.com",
        password: "correct horse battery staple",
      }),
    ).toEqual({
      email: "person@example.com",
      password: "correct horse battery staple",
    });
  });

  it("rejects an invalid email address", () => {
    expect(() =>
      parseLoginCredentials({
        email: "not-an-email",
        password: "valid password",
      }),
    ).toThrow("Enter a valid email address.");
  });
});
