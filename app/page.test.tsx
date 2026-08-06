import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home", () => {
  it("introduces the product with a clear primary action", () => {
    render(<Home />);

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

  it("provides accessible primary navigation", () => {
    render(<Home />);

    const navigation = screen.getByRole("navigation", {
      name: "Main navigation",
    });

    expect(
      within(navigation).getByRole("link", { name: "Why Bank, Man?" }),
    ).toHaveAttribute("href", "#why");
  });

  it("describes both welcoming homepage images", () => {
    render(<Home />);

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

  it("explains the three core product benefits", () => {
    render(<Home />);

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

  it("presents the confidence benefits as accessible headings", () => {
    render(<Home />);

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
