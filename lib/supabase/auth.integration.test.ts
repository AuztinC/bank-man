import { randomUUID } from "node:crypto";

import { NextRequest } from "next/server";
import { beforeAll, describe, expect, it } from "vitest";

import { createClient } from "@/lib/supabase/client";
import { updateSession } from "@/lib/supabase/proxy";

function requireLocalSupabaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!configuredUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required.");
  }

  const url = new URL(configuredUrl);
  if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") {
    throw new Error("Integration tests must target local Supabase.");
  }

  return url;
}

describe("local Supabase Auth integration", () => {
  let supabaseUrl: URL;

  beforeAll(() => {
    supabaseUrl = requireLocalSupabaseUrl();

    if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required.");
    }
  });

  it("rejects invalid credentials without creating a session", async () => {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: `missing-${randomUUID()}@example.test`,
      password: "not-a-real-password",
    });

    expect(error?.code).toBe("invalid_credentials");
    expect(error?.status).toBe(400);
    expect(data.session).toBeNull();
    expect(data.user).toBeNull();
  });

  it("redirects a real unauthenticated dashboard request to login", async () => {
    const request = new NextRequest(
      new URL("/dashboard", "http://localhost:3000"),
    );

    const response = await updateSession(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      new URL("/login", "http://localhost:3000").toString(),
    );
    expect(supabaseUrl.hostname).toMatch(/^(127\.0\.0\.1|localhost)$/);
  });
});
