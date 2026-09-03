import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createClient } from "@/lib/supabase/server";

const { cookieStore, cookiesMock, createServerClientMock } = vi.hoisted(() => ({
  cookieStore: {
    getAll: vi.fn(),
    set: vi.fn(),
  },
  cookiesMock: vi.fn(),
  createServerClientMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

type ServerClientOptions = {
  cookies: {
    getAll: () => unknown;
    setAll: (
      cookiesToSet: Array<{
        name: string;
        value: string;
        options: { path: string };
      }>,
    ) => void;
  };
};

describe("createClient", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
    cookieStore.getAll.mockReturnValue([{ name: "session", value: "token" }]);
    cookiesMock.mockResolvedValue(cookieStore);
    createServerClientMock.mockReturnValue({ kind: "server-client" });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("creates a server client backed by the request cookie store", async () => {
    expect(await createClient()).toEqual({ kind: "server-client" });

    const options = createServerClientMock.mock
      .calls[0][2] as ServerClientOptions;

    expect(createServerClientMock).toHaveBeenCalledWith(
      "http://127.0.0.1:54321",
      "publishable-key",
      expect.any(Object),
    );
    expect(options.cookies.getAll()).toEqual([
      { name: "session", value: "token" },
    ]);

    options.cookies.setAll([
      {
        name: "session",
        value: "refreshed-token",
        options: { path: "/" },
      },
    ]);

    expect(cookieStore.set).toHaveBeenCalledWith("session", "refreshed-token", {
      path: "/",
    });
  });

  it("tolerates cookie writes during read-only Server Component rendering", async () => {
    cookieStore.set.mockImplementation(() => {
      throw new Error("Cookies can only be modified in a Server Action");
    });

    await createClient();
    const options = createServerClientMock.mock
      .calls[0][2] as ServerClientOptions;

    expect(() =>
      options.cookies.setAll([
        {
          name: "session",
          value: "refreshed-token",
          options: { path: "/" },
        },
      ]),
    ).not.toThrow();
  });
});
