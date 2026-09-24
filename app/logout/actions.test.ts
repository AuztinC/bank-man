import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { login, type LoginState } from "@/app/login/actions";
import logout from "@/app/logout/actions";
import { parseLoginCredentials } from "@/lib/auth/login";

vi.mock("@/lib/auth/login", () => ({
  parseLoginCredentials: vi.fn(),
}));

const { signInWithPasswordMock, signOutMock, redirectMock, createClientMock } =
  vi.hoisted(() => ({
    signInWithPasswordMock: vi.fn(),
    signOutMock: vi.fn(),
    redirectMock: vi.fn(),
    createClientMock: vi.fn(),
  }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

const initialState: LoginState = {
  error: null,
};

describe("logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    createClientMock.mockResolvedValue({
      auth: {
        signOut: signOutMock,
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

  it("signs out and redirects to login", async () => {
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

    await logout();
    expect(createClientMock).toHaveBeenCalledTimes(2);
    expect(signOutMock).toHaveBeenCalledOnce();
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});
