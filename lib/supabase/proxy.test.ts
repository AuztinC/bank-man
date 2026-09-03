import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { updateSession } from "@/lib/supabase/proxy";

const { createServerClientMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

type ProxyClientOptions = {
  cookies: {
    setAll: (
      cookiesToSet: Array<{
        name: string;
        value: string;
        options: { httpOnly: boolean; path: string };
      }>,
      headers: Record<string, string>,
    ) => void;
  };
};

describe("updateSession", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("allows public routes without an authenticated user", async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: null } }),
      },
    });

    const response = await updateSession(
      new NextRequest("http://localhost:3000/login"),
    );

    expect(response.status).toBe(200);
  });

  it("redirects unauthenticated dashboard requests to login", async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: null } }),
      },
    });

    const response = await updateSession(
      new NextRequest("http://localhost:3000/dashboard"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login",
    );
  });

  it("allows authenticated dashboard requests", async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { sub: "user-id" } },
        }),
      },
    });

    const response = await updateSession(
      new NextRequest("http://localhost:3000/dashboard"),
    );

    expect(response.status).toBe(200);
  });

  it("forwards refreshed cookies and private cache headers", async () => {
    createServerClientMock.mockImplementation(
      (_url, _key, options: ProxyClientOptions) => ({
        auth: {
          getClaims: vi.fn().mockImplementation(async () => {
            options.cookies.setAll(
              [
                {
                  name: "session",
                  value: "refreshed-token",
                  options: { httpOnly: true, path: "/" },
                },
              ],
              { "Cache-Control": "private, no-store" },
            );
            return { data: { claims: { sub: "user-id" } } };
          }),
        },
      }),
    );

    const response = await updateSession(
      new NextRequest("http://localhost:3000/dashboard"),
    );

    expect(response.cookies.get("session")?.value).toBe("refreshed-token");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});
