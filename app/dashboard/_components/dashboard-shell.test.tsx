import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardShell } from "@/app/dashboard/_components/dashboard-shell";

describe("DashboardShell", () => {
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
});
