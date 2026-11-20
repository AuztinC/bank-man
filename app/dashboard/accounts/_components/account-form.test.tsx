import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccountForm } from "@/app/dashboard/accounts/_components/account-form";

const { formActionMock, useActionStateMock } = vi.hoisted(() => ({
  formActionMock: vi.fn(),
  useActionStateMock: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();

  return {
    ...react,
    useActionState: useActionStateMock,
  };
});

describe("AccountForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useActionStateMock.mockReturnValue([
      { error: null, success: null },
      formActionMock,
      false,
    ]);
  });

  it("renders the fields expected by the create-account action", () => {
    render(<AccountForm />);

    const form = screen.getByRole("form", { name: "Create an account" });
    const accountName = within(form).getByRole("textbox", {
      name: "Account name",
    });
    const accountType = within(form).getByRole("combobox", {
      name: "Account type",
    });
    const openingBalance = within(form).getByRole("textbox", {
      name: "Opening balance",
    });
    const openingBalanceAsOf = within(form).getByLabelText(
      "Opening balance date",
    );

    expect(accountName).toHaveAttribute("name", "accountName");
    expect(accountName).toHaveAttribute("maxlength", "100");
    expect(accountName).toBeRequired();

    expect(accountType).toHaveAttribute("name", "accountType");
    expect(accountType).toBeRequired();
    expect(
      within(accountType).getByRole("option", { name: "Checking" }),
    ).toBeInTheDocument();
    expect(
      within(accountType).getByRole("option", { name: "Savings" }),
    ).toBeInTheDocument();
    expect(
      within(accountType).getByRole("option", { name: "Cash" }),
    ).toBeInTheDocument();

    expect(openingBalance).toHaveAttribute("name", "openingBalance");
    expect(openingBalance).toHaveAttribute("inputmode", "decimal");
    expect(openingBalance).toBeRequired();

    expect(openingBalanceAsOf).toHaveAttribute("name", "openingBalanceAsOf");
    expect(openingBalanceAsOf).toHaveAttribute("type", "date");
    expect(openingBalanceAsOf).toBeRequired();
    expect(
      within(form).getByRole("button", { name: "Create account" }),
    ).toHaveAttribute("type", "submit");
  });

  it("announces validation and database errors", () => {
    useActionStateMock.mockReturnValue([
      { error: "Account must have a name.", success: null },
      formActionMock,
      false,
    ]);

    render(<AccountForm />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Account must have a name.",
    );
  });

  it("announces successful account creation", () => {
    useActionStateMock.mockReturnValue([
      { error: null, success: "Account created." },
      formActionMock,
      false,
    ]);

    render(<AccountForm />);

    expect(screen.getByRole("status")).toHaveTextContent("Account created.");
  });

  it("disables and relabels submission while pending", () => {
    useActionStateMock.mockReturnValue([
      { error: null, success: null },
      formActionMock,
      true,
    ]);

    render(<AccountForm />);

    expect(
      screen.getByRole("button", { name: "Creating account…" }),
    ).toBeDisabled();
  });
});
