import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  createAccount,
  type CreateAccountState,
} from "@/app/dashboard/accounts/actions";
import { parseAccountInput } from "@/lib/accounts/validation";

const {
  createClientMock,
  fromMock,
  getClaimsMock,
  insertMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  fromMock: vi.fn(),
  getClaimsMock: vi.fn(),
  insertMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/accounts/validation", () => ({
  parseAccountInput: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

const initialState: CreateAccountState = {
  error: null,
  success: null,
};

function createValidFormData(): FormData {
  const formData = new FormData();
  formData.set("accountName", "Everyday Checking");
  formData.set("accountType", "checking");
  formData.set("openingBalance", "123.45");
  formData.set("openingBalanceAsOf", "2026-11-13");
  return formData;
}

describe("createAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(parseAccountInput).mockReturnValue({
      accountName: "Everyday Checking",
      accountType: "checking",
      openingBalanceCents: 12_345,
      openingBalanceAsOf: "2026-11-13",
    });
    getClaimsMock.mockResolvedValue({
      data: {
        claims: {
          sub: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        },
      },
      error: null,
    });
    insertMock.mockResolvedValue({ error: null });
    fromMock.mockReturnValue({
      insert: insertMock,
    });
    createClientMock.mockResolvedValue({
      auth: {
        getClaims: getClaimsMock,
      },
      from: fromMock,
    });
  });

  it("validates every submitted account field", async () => {
    const formData = createValidFormData();

    await createAccount(initialState, formData);

    expect(parseAccountInput).toHaveBeenCalledWith({
      accountName: "Everyday Checking",
      accountType: "checking",
      openingBalance: "123.45",
      openingBalanceAsOf: "2026-11-13",
    });
  });

  it("returns validation errors without calling Supabase", async () => {
    vi.mocked(parseAccountInput).mockImplementation(() => {
      throw new z.ZodError([
        {
          code: "custom",
          message: "Account must have a name.",
          path: ["accountName"],
        },
      ]);
    });

    await expect(
      createAccount(initialState, createValidFormData()),
    ).resolves.toEqual({
      error: "Account must have a name.",
      success: null,
    });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("rethrows unexpected validation failures", async () => {
    vi.mocked(parseAccountInput).mockImplementation(() => {
      throw new TypeError("Unexpected validation defect");
    });

    await expect(
      createAccount(initialState, createValidFormData()),
    ).rejects.toThrow("Unexpected validation defect");
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("does not insert when authentication fails", async () => {
    getClaimsMock.mockResolvedValue({
      data: {
        claims: {
          sub: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        },
      },
      error: new Error("Missing session"),
    });

    await expect(
      createAccount(initialState, createValidFormData()),
    ).resolves.toEqual({
      error: "You must be signed in to create an account.",
      success: null,
    });
    expect(insertMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("does not insert when authenticated claims lack a user ID", async () => {
    getClaimsMock.mockResolvedValue({
      data: { claims: {} },
      error: null,
    });

    await expect(
      createAccount(initialState, createValidFormData()),
    ).resolves.toEqual({
      error: "You must be signed in to create an account.",
      success: null,
    });
    expect(insertMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns a safe message when creating the Supabase client fails", async () => {
    createClientMock.mockRejectedValue(new Error("Supabase is unavailable"));

    await expect(
      createAccount(initialState, createValidFormData()),
    ).resolves.toEqual({
      error: "We couldn't create your account. Please try again.",
      success: null,
    });
    expect(insertMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns a safe message when claims verification rejects", async () => {
    getClaimsMock.mockRejectedValue(new Error("Auth service is unavailable"));

    await expect(
      createAccount(initialState, createValidFormData()),
    ).resolves.toEqual({
      error: "We couldn't create your account. Please try again.",
      success: null,
    });
    expect(insertMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("inserts the parsed account for the authenticated user", async () => {
    const formData = createValidFormData();
    formData.set("user_id", "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

    await expect(createAccount(initialState, formData)).resolves.toEqual({
      error: null,
      success: "Account created.",
    });
    expect(insertMock).toHaveBeenCalledWith({
      user_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      account_name: "Everyday Checking",
      account_type: "checking",
      opening_balance_cents: 12_345,
      opening_balance_as_of: "2026-11-13",
      opening_balance_status: "unverified",
    });
    expect(fromMock).toHaveBeenCalledWith("accounts");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/accounts");
  });

  it("returns a safe message when the insert fails", async () => {
    insertMock.mockResolvedValue({
      error: new Error("Database details that should not reach the client"),
    });

    await expect(
      createAccount(initialState, createValidFormData()),
    ).resolves.toEqual({
      error: "We couldn't create your account. Please try again.",
      success: null,
    });
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns a safe message when the insert rejects", async () => {
    insertMock.mockRejectedValue(new Error("Database is unavailable"));

    await expect(
      createAccount(initialState, createValidFormData()),
    ).resolves.toEqual({
      error: "We couldn't create your account. Please try again.",
      success: null,
    });
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
