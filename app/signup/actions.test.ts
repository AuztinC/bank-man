import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { signup, type SignupState } from "@/app/signup/actions";
import { parseSignupCredentials } from "@/lib/auth/signup";

const { createClientMock, redirectMock, signUpMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  redirectMock: vi.fn(),
  signUpMock: vi.fn(),
}));

vi.mock("@/lib/auth/signup", () => ({
  parseSignupCredentials: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

const initialState: SignupState = {
  error: null,
  success: null,
};

describe("signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createClientMock.mockResolvedValue({
      auth: {
        signUp: signUpMock,
      },
    });
    vi.mocked(parseSignupCredentials).mockReturnValue({
      email: "person@example.com",
      password: "secure-password",
      passwordConfirmation: "secure-password",
      acceptTerms: "on",
    });
    signUpMock.mockResolvedValue({
      data: {
        user: { id: "user-123" },
        session: null,
      },
      error: null,
    });
  });

  it("validates every submitted field at the server boundary", async () => {
    const formData = new FormData();
    formData.set("email", "person@example.com");
    formData.set("password", "secure-password");
    formData.set("passwordConfirmation", "secure-password");
    formData.set("acceptTerms", "on");

    await signup(initialState, formData);

    expect(parseSignupCredentials).toHaveBeenCalledWith({
      email: "person@example.com",
      password: "secure-password",
      passwordConfirmation: "secure-password",
      acceptTerms: "on",
    });
  });

  it("returns validation errors without calling Supabase", async () => {
    vi.mocked(parseSignupCredentials).mockImplementation(() => {
      throw new z.ZodError([
        {
          code: "custom",
          message: "Passwords must match.",
          path: ["passwordConfirmation"],
        },
      ]);
    });

    await expect(signup(initialState, new FormData())).resolves.toEqual({
      error: "Passwords must match.",
      success: null,
    });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("creates an account and requests email confirmation", async () => {
    await expect(signup(initialState, new FormData())).resolves.toEqual({
      error: null,
      success: "Check your email to confirm your account, then log in.",
    });
    expect(signUpMock).toHaveBeenCalledWith({
      email: "person@example.com",
      password: "secure-password",
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects immediately when signup returns a session", async () => {
    signUpMock.mockResolvedValue({
      data: {
        user: { id: "user-123" },
        session: { access_token: "access-token" },
      },
      error: null,
    });

    await signup(initialState, new FormData());

    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("returns a safe message when account creation fails", async () => {
    signUpMock.mockResolvedValue({
      data: { user: null, session: null },
      error: new Error("User already registered"),
    });

    await expect(signup(initialState, new FormData())).resolves.toEqual({
      error: "We couldn't create your account. Please try again.",
      success: null,
    });
  });
});
