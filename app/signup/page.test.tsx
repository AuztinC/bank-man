import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SignupPage from "@/app/signup/page";

describe("SignupPage", () => {
  it("presents an accessible account creation form", () => {
    render(<SignupPage />);

    const form = screen.getByRole("form", { name: "Create your account." });
    const email = within(form).getByRole("textbox", { name: "Email" });
    const password = within(form).getByLabelText("Password");
    const passwordConfirmation =
      within(form).getByLabelText("Confirm password");
    const agreement = within(form).getByRole("checkbox", {
      name: "I agree to the Terms and Privacy Policy",
    });

    expect(email).toHaveAttribute("name", "email");
    expect(email).toHaveAttribute("type", "email");
    expect(email).toHaveAttribute("autocomplete", "email");
    expect(email).toBeRequired();

    expect(password).toHaveAttribute("name", "password");
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveAttribute("autocomplete", "new-password");
    expect(password).toBeRequired();

    expect(passwordConfirmation).toHaveAttribute(
      "name",
      "passwordConfirmation",
    );
    expect(passwordConfirmation).toHaveAttribute("type", "password");
    expect(passwordConfirmation).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
    expect(passwordConfirmation).toBeRequired();

    expect(agreement).toHaveAttribute("name", "acceptTerms");
    expect(agreement).toBeRequired();
    expect(
      within(form).getByRole("button", { name: "Create account" }),
    ).toHaveAttribute("type", "submit");
  });

  it("accepts user input in each interactive field", () => {
    render(<SignupPage />);

    const form = screen.getByRole("form", { name: "Create your account." });
    const email = within(form).getByRole("textbox", { name: "Email" });
    const password = within(form).getByLabelText("Password");
    const passwordConfirmation =
      within(form).getByLabelText("Confirm password");
    const agreement = within(form).getByRole("checkbox", {
      name: "I agree to the Terms and Privacy Policy",
    });

    fireEvent.change(email, { target: { value: "person@example.com" } });
    fireEvent.change(password, { target: { value: "secure-password" } });
    fireEvent.change(passwordConfirmation, {
      target: { value: "secure-password" },
    });
    fireEvent.click(agreement);

    expect(email).toHaveValue("person@example.com");
    expect(password).toHaveValue("secure-password");
    expect(passwordConfirmation).toHaveValue("secure-password");
    expect(agreement).toBeChecked();
  });

  it("provides account and policy navigation", () => {
    render(<SignupPage />);

    expect(screen.getByRole("link", { name: "Bank, Man!" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("link", { name: "Already have an account? Log in" }),
    ).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "/terms",
    );
    expect(
      screen.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/privacy");
  });

  it("introduces the account creation experience", () => {
    render(<SignupPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Create your account.",
      }),
    ).toBeInTheDocument();
  });
});
