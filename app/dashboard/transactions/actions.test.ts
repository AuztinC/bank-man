import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  createTransaction,
  type CreateTransactionState,
} from "@/app/dashboard/transactions/actions";
import { parseTransactionInput } from "@/lib/transactions/validation";

const {
  createClientMock,
  eqAccountIdMock,
  eqUserIdMock,
  fromMock,
  getClaimsMock,
  insertMock,
  isArchivedMock,
  maybeSingleMock,
  revalidatePathMock,
  selectMock,
} = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  eqAccountIdMock: vi.fn(),
  eqUserIdMock: vi.fn(),
  fromMock: vi.fn(),
  getClaimsMock: vi.fn(),
  insertMock: vi.fn(),
  isArchivedMock: vi.fn(),
  maybeSingleMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  selectMock: vi.fn(),
}));

vi.mock("@/lib/transactions/validation", () => ({
  parseTransactionInput: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

const initialState: CreateTransactionState = {
  error: null,
  success: null,
};

function createValidFormData(): FormData {
  const formData = new FormData();
  formData.set("accountId", "11111111-1111-4111-8111-111111111111");
  formData.set("transactionType", "expense");
  formData.set("amount", "42.50");
  formData.set("transactionDate", "2026-11-19");
  formData.set("description", "Groceries");
  formData.set("notes", "Weekly shop");
  return formData;
}

describe("createTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(parseTransactionInput).mockReturnValue({
      accountId: "11111111-1111-4111-8111-111111111111",
      transactionType: "expense",
      amountCents: -4_250,
      transactionDate: "2026-11-19",
      description: "Groceries",
      notes: "Weekly shop",
    });
    getClaimsMock.mockResolvedValue({
      data: {
        claims: {
          sub: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        },
      },
      error: null,
    });
    maybeSingleMock.mockResolvedValue({
      data: { id: "11111111-1111-4111-8111-111111111111" },
      error: null,
    });
    isArchivedMock.mockReturnValue({ maybeSingle: maybeSingleMock });
    eqUserIdMock.mockReturnValue({ is: isArchivedMock });
    eqAccountIdMock.mockReturnValue({ eq: eqUserIdMock });
    selectMock.mockReturnValue({ eq: eqAccountIdMock });
    insertMock.mockResolvedValue({ error: null });
    fromMock.mockImplementation((table: string) =>
      table === "accounts" ? { select: selectMock } : { insert: insertMock },
    );
    createClientMock.mockResolvedValue({
      auth: { getClaims: getClaimsMock },
      from: fromMock,
    });
  });

  it("validates every submitted transaction field", async () => {
    await createTransaction(initialState, createValidFormData());

    expect(parseTransactionInput).toHaveBeenCalledWith({
      accountId: "11111111-1111-4111-8111-111111111111",
      transactionType: "expense",
      amount: "42.50",
      transactionDate: "2026-11-19",
      description: "Groceries",
      notes: "Weekly shop",
    });
  });

  it("returns validation errors without calling Supabase", async () => {
    vi.mocked(parseTransactionInput).mockImplementation(() => {
      throw new z.ZodError([
        {
          code: "custom",
          message: "Transaction amount must be greater than zero.",
          path: ["amount"],
        },
      ]);
    });

    await expect(
      createTransaction(initialState, createValidFormData()),
    ).resolves.toEqual({
      error: "Transaction amount must be greater than zero.",
      success: null,
    });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("rethrows unexpected validation failures", async () => {
    vi.mocked(parseTransactionInput).mockImplementation(() => {
      throw new TypeError("Unexpected validation defect");
    });

    await expect(
      createTransaction(initialState, createValidFormData()),
    ).rejects.toThrow("Unexpected validation defect");
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("does not query accounts or insert when authentication fails", async () => {
    getClaimsMock.mockResolvedValue({
      data: { claims: null },
      error: new Error("Missing session"),
    });

    await expect(
      createTransaction(initialState, createValidFormData()),
    ).resolves.toEqual({
      error: "You must be signed in to create a transaction.",
      success: null,
    });
    expect(fromMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("verifies that the selected account is active and owned by the user", async () => {
    await createTransaction(initialState, createValidFormData());

    expect(fromMock).toHaveBeenCalledWith("accounts");
    expect(selectMock).toHaveBeenCalledWith("id");
    expect(eqAccountIdMock).toHaveBeenCalledWith(
      "id",
      "11111111-1111-4111-8111-111111111111",
    );
    expect(eqUserIdMock).toHaveBeenCalledWith(
      "user_id",
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    );
    expect(isArchivedMock).toHaveBeenCalledWith("archived_at", null);
  });

  it("does not insert for a missing, archived, or unowned account", async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null });

    await expect(
      createTransaction(initialState, createValidFormData()),
    ).resolves.toEqual({
      error: "Select an active account you own.",
      success: null,
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("inserts the parsed transaction for the authenticated user", async () => {
    const formData = createValidFormData();
    formData.set("user_id", "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

    await expect(createTransaction(initialState, formData)).resolves.toEqual({
      error: null,
      success: "Transaction created.",
    });
    expect(fromMock).toHaveBeenCalledWith("transactions");
    expect(insertMock).toHaveBeenCalledWith({
      user_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      account_id: "11111111-1111-4111-8111-111111111111",
      transaction_type: "expense",
      amount_cents: -4_250,
      transaction_date: "2026-11-19",
      description: "Groceries",
      notes: "Weekly shop",
    });
  });

  it("revalidates every route affected by a new transaction", async () => {
    await createTransaction(initialState, createValidFormData());

    expect(revalidatePathMock).toHaveBeenCalledTimes(3);
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/accounts");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/transactions");
  });

  it("returns a safe message when account verification fails", async () => {
    maybeSingleMock.mockResolvedValue({
      data: null,
      error: new Error("Database details that should not reach the client"),
    });

    await expect(
      createTransaction(initialState, createValidFormData()),
    ).resolves.toEqual({
      error: "We couldn't create your transaction. Please try again.",
      success: null,
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("returns a safe message when the insert fails", async () => {
    insertMock.mockResolvedValue({
      error: new Error("Database details that should not reach the client"),
    });

    await expect(
      createTransaction(initialState, createValidFormData()),
    ).resolves.toEqual({
      error: "We couldn't create your transaction. Please try again.",
      success: null,
    });
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns a safe message when Supabase rejects", async () => {
    createClientMock.mockRejectedValue(new Error("Supabase is unavailable"));

    await expect(
      createTransaction(initialState, createValidFormData()),
    ).resolves.toEqual({
      error: "We couldn't create your transaction. Please try again.",
      success: null,
    });
    expect(insertMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
