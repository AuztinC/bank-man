import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LoginPage from "@/app/login/page";

describe("LoginPage", () => {
  it("presents an accessible login form", () => {
    render(<LoginPage />);

    const form = screen.getByRole("form", { name: "Welcome back." });
    const username = within(form).getByRole("textbox", {
      name: "Username or email",
    });
    const password = within(form).getByLabelText("Password");

    expect(username).toHaveAttribute("name", "username");
    expect(username).toHaveAttribute("autocomplete", "username");
    expect(username).toBeRequired();
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveAttribute("autocomplete", "current-password");
    expect(password).toBeRequired();
    expect(
      within(form).getByRole("checkbox", {
        name: "Remember me on this device",
      }),
    ).toBeInTheDocument();
    expect(
      within(form).getByRole("button", { name: "Log in" }),
    ).toHaveAttribute("type", "submit");
  });

  it("provides account and recovery paths", () => {
    render(<LoginPage />);

    expect(screen.getByRole("link", { name: "Bank, Man!" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("link", { name: "Forgot password?" }),
    ).toHaveAttribute("href", "/forgot-password");
    expect(
      screen.getByRole("link", { name: "Create an account" }),
    ).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "/terms",
    );
    expect(
      screen.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/privacy");
  });

  it("reinforces the product's calm and private experience", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("heading", {
        name: "Come back to money that feels manageable.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Private by design" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "A calmer place to plan" }),
    ).toBeInTheDocument();
  });
});
