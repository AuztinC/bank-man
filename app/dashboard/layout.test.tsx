import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import DashboardLayout from "@/app/dashboard/layout";

const { createClientMock, getClaimsMock, redirectMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  getClaimsMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("DashboardLayout", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the protected layout for an authenticated user", async () => {
    getClaimsMock.mockResolvedValue({
      data: { claims: { sub: "user-id" } },
    });
    createClientMock.mockResolvedValue({
      auth: { getClaims: getClaimsMock },
    });

    render(
      await DashboardLayout({
        children: <p>Private dashboard content</p>,
      }),
    );

    expect(screen.getByText("Private dashboard content")).toBeInTheDocument();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects an unauthenticated user to login", async () => {
    getClaimsMock.mockResolvedValue({ data: { claims: null } });
    createClientMock.mockResolvedValue({
      auth: { getClaims: getClaimsMock },
    });
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(
      DashboardLayout({ children: <p>Private dashboard content</p> }),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});
