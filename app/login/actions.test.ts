import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { login, type LoginState } from "@/app/login/actions";
import { parseLoginCredentials } from "@/lib/auth/login";

vi.mock("@/lib/auth/login", () => ({
  parseLoginCredentials: vi.fn(),
}));

const { createClientMock, signInWithPasswordMock, redirectMock } = vi.hoisted(
  () => ({
    createClientMock: vi.fn(),
    signInWithPasswordMock: vi.fn(),
    redirectMock: vi.fn(),
  }),
);

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

const initialState: LoginState = {
  error: null,
};

describe("login", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    createClientMock.mockResolvedValue({
      auth: {
        signInWithPassword: signInWithPasswordMock,
      },
    });
    signInWithPasswordMock.mockResolvedValue({
      data: {
        user: { id: "user-123" },
        session: { access_token: "access-token" },
      },
      error: null,
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("validates submitted credentials and logs only the normalized email", async () => {
    vi.mocked(parseLoginCredentials).mockReturnValue({
      email: "person@example.com",
      password: "secret-password",
    });
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

    const formData = new FormData();
    formData.set("email", "  PERSON@Example.COM  ");
    formData.set("password", "secret-password");

    await login(initialState, formData);

    expect(parseLoginCredentials).toHaveBeenCalledWith({
      email: "  PERSON@Example.COM  ",
      password: "secret-password",
    });
    expect(consoleLog).toHaveBeenCalledWith(
      "user sign-in attempt, ",
      "person@example.com",
    );
    expect(consoleLog).not.toHaveBeenCalledWith(
      expect.stringContaining("secret-password"),
    );
  });

  it("signs in and redirects to the dashboard", async () => {
    vi.mocked(parseLoginCredentials).mockReturnValue({
      email: "person@example.com",
      password: "secret-password",
    });

    const formData = new FormData();

    await login(initialState, formData);

    expect(createClientMock).toHaveBeenCalledOnce();
    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: "person@example.com",
      password: "secret-password",
    });
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("returns a safe message when authentication fails", async () => {
    vi.mocked(parseLoginCredentials).mockReturnValue({
      email: "person@example.com",
      password: "wrong-password",
    });
    signInWithPasswordMock.mockResolvedValue({
      data: {
        user: null,
        session: null,
      },
      error: new Error("Invalid login credentials"),
    });

    const formData = new FormData();

    await expect(login(initialState, formData)).resolves.toEqual({
      error: "The email or password you entered is incorrect.",
    });

    expect(redirectMock).not.toHaveBeenCalled();
  });
});
