import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Home from "@/app/page";

const { getClaimsMock } = vi.hoisted(() => ({
  getClaimsMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getClaims: getClaimsMock,
    },
  })),
}));

async function renderHome(claims: Record<string, unknown> | null = null) {
  getClaimsMock.mockResolvedValue({ data: { claims } });
  render(await Home());
}

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("introduces the product with a clear primary action", async () => {
    await renderHome();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Feel at home with your money.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Explore the dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("provides accessible primary navigation", async () => {
    await renderHome();

    const navigation = screen.getByRole("navigation", {
      name: "Main navigation",
    });

    expect(
      within(navigation).getByRole("link", { name: "Why Bank, Man?" }),
    ).toHaveAttribute("href", "#why");
    expect(
      screen.getByRole("link", { name: "Open dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("shows login navigation to signed-out visitors", async () => {
    await renderHome();

    expect(screen.getByRole("link", { name: "Login/Signup" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(
      screen.queryByRole("button", { name: "Logout" }),
    ).not.toBeInTheDocument();
  });

  it("shows logout navigation to signed-in visitors", async () => {
    await renderHome({ sub: "user-id", email: "person@example.com" });

    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
    const email = screen.getByText("person@example.com");

    expect(email).toHaveAttribute("title", "person@example.com");
    expect(email).toHaveClass("truncate");
    expect(
      screen.queryByRole("link", { name: "Login/Signup" }),
    ).not.toBeInTheDocument();
  });

  it("describes both welcoming homepage images", async () => {
    await renderHome();

    expect(
      screen.getByRole("img", {
        name: "Person calmly reviewing a monthly plan at a sunlit table",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Hands making a simple monthly plan beside a laptop and coffee",
      }),
    ).toBeInTheDocument();
  });

  it("explains the three core product benefits", async () => {
    await renderHome();

    expect(
      screen.getByRole("heading", { name: "See the whole picture" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Plan without pressure" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Keep every dollar private" }),
    ).toBeInTheDocument();
  });

  it("presents the confidence benefits as accessible headings", async () => {
    await renderHome();

    const confidenceSection = screen
      .getByRole("heading", { name: "Why Bank, Man?" })
      .closest("section");

    expect(confidenceSection).not.toBeNull();
    expect(
      within(confidenceSection!).getByRole("heading", {
        name: "Private by design",
      }),
    ).toBeInTheDocument();
    expect(
      within(confidenceSection!).getByRole("heading", {
        name: "Built for real life",
      }),
    ).toBeInTheDocument();
    expect(
      within(confidenceSection!).getByRole("heading", {
        name: "Clear monthly planning",
      }),
    ).toBeInTheDocument();
  });
});
