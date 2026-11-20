import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardShell } from "@/app/dashboard/_components/dashboard-shell";

const { usePathnameMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
}));

describe("DashboardShell", () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue("/dashboard");
  });

  it("provides primary navigation for desktop and mobile", () => {
    render(
      <DashboardShell>
        <h1>Dashboard content</h1>
      </DashboardShell>,
    );

    const primaryNavigation = screen.getByRole("navigation", {
      name: "Primary",
    });
    const mobileNavigation = screen.getByRole("navigation", {
      name: "Mobile",
    });

    expect(
      within(primaryNavigation).getByRole("link", { name: "Overview" }),
    ).toHaveAttribute("href", "/dashboard");
    expect(
      within(mobileNavigation).getByRole("link", { name: "Home" }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("identifies the overview destination as the current page", () => {
    render(<DashboardShell>Dashboard content</DashboardShell>);

    expect(screen.getAllByRole("link", { current: "page" })).toHaveLength(2);
  });

  it("identifies accounts as the current page on the accounts route", () => {
    usePathnameMock.mockReturnValue("/dashboard/accounts");

    render(<DashboardShell>Accounts content</DashboardShell>);

    const primaryNavigation = screen.getByRole("navigation", {
      name: "Primary",
    });
    const mobileNavigation = screen.getByRole("navigation", {
      name: "Mobile",
    });

    expect(
      within(primaryNavigation).getByRole("link", {
        name: "Accounts",
        current: "page",
      }),
    ).toBeInTheDocument();
    expect(
      within(mobileNavigation).getByRole("link", {
        name: "Accounts",
        current: "page",
      }),
    ).toBeInTheDocument();
  });

  it("renders page content inside the application shell", () => {
    render(
      <DashboardShell>
        <h1>Dashboard content</h1>
      </DashboardShell>,
    );

    expect(
      screen.getByRole("heading", { name: "Dashboard content" }),
    ).toBeInTheDocument();
  });

  it("identifies the signed-in account beneath the brand", () => {
    render(
      <DashboardShell email="person@example.com">
        Dashboard content
      </DashboardShell>,
    );

    const email = screen.getByText("person@example.com");

    expect(email).toHaveAttribute("title", "person@example.com");
    expect(email).toHaveClass("text-center");
  });
});
