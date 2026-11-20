import { describe, expect, it } from "vitest";

import { parseTransactionInput } from "./validation";

describe("parseTransactionInput", () => {
  const validTransaction = {
    accountId: "11111111-1111-4111-8111-111111111111",
    transactionType: "expense",
    amount: "42.50",
    transactionDate: "2026-11-19",
    description: "Grocery Market",
    notes: "Weekly groceries",
  };

  it("transforms a valid expense into database-ready values", () => {
    expect(
      parseTransactionInput({
        ...validTransaction,
        description: "  Grocery Market  ",
        notes: "",
      }),
    ).toEqual({
      accountId: "11111111-1111-4111-8111-111111111111",
      transactionType: "expense",
      amountCents: -4_250,
      transactionDate: "2026-11-19",
      description: "Grocery Market",
      notes: null,
    });
  });

  it.each([
    ["income", "42.50", 4_250],
    ["expense", "42.50", -4_250],
    ["income", ".05", 5],
    ["expense", "12", -1_200],
    ["income", "  12.30  ", 1_230],
  ])(
    "transforms a %s amount of %j to %i cents",
    (transactionType, amount, amountCents) => {
      expect(
        parseTransactionInput({
          ...validTransaction,
          transactionType,
          amount,
        }).amountCents,
      ).toBe(amountCents);
    },
  );

  it.each([
    [" INCOME ", "income"],
    ["Expense", "expense"],
  ])("normalizes transaction type %j to %j", (transactionType, expected) => {
    expect(
      parseTransactionInput({ ...validTransaction, transactionType })
        .transactionType,
    ).toBe(expected);
  });

  it.each([
    undefined,
    null,
    42,
    "",
    "not-a-uuid",
    "11111111-1111-1111-1111-111111111111",
  ])("rejects an invalid account ID: %j", (accountId) => {
    expect(() =>
      parseTransactionInput({ ...validTransaction, accountId }),
    ).toThrow();
  });

  it.each(["transfer", "", "   ", undefined, null, 42])(
    "rejects an invalid transaction type: %j",
    (transactionType) => {
      expect(() =>
        parseTransactionInput({ ...validTransaction, transactionType }),
      ).toThrow();
    },
  );

  it.each([
    undefined,
    null,
    42,
    "",
    "   ",
    "0",
    "0.00",
    "-12.34",
    "+12.34",
    "1.234",
    "$12.34",
    "1,000.00",
    "1e2",
    "not money",
    "90071992547409.92",
  ])("rejects an invalid transaction amount: %j", (amount) => {
    expect(() =>
      parseTransactionInput({ ...validTransaction, amount }),
    ).toThrow();
  });

  it.each([
    undefined,
    null,
    42,
    "",
    "11/19/2026",
    "2025-02-29",
    "2026-13-01",
    "2026-11-19T00:00:00Z",
  ])("rejects an invalid transaction date: %j", (transactionDate) => {
    expect(() =>
      parseTransactionInput({ ...validTransaction, transactionDate }),
    ).toThrow();
  });

  it("accepts a valid leap-day transaction date", () => {
    expect(
      parseTransactionInput({
        ...validTransaction,
        transactionDate: "2028-02-29",
      }).transactionDate,
    ).toBe("2028-02-29");
  });

  it("accepts a description at the maximum length", () => {
    const description = "a".repeat(200);

    expect(
      parseTransactionInput({ ...validTransaction, description }).description,
    ).toBe(description);
  });

  it.each(["", "   ", "a".repeat(201), undefined, null, 42])(
    "rejects an invalid description: %j",
    (description) => {
      expect(() =>
        parseTransactionInput({ ...validTransaction, description }),
      ).toThrow();
    },
  );

  it.each([undefined, null, "", "   "])(
    "normalizes an empty note to null: %j",
    (notes) => {
      expect(
        parseTransactionInput({ ...validTransaction, notes }).notes,
      ).toBeNull();
    },
  );

  it("trims transaction notes", () => {
    expect(
      parseTransactionInput({
        ...validTransaction,
        notes: "  Weekly groceries  ",
      }).notes,
    ).toBe("Weekly groceries");
  });

  it("accepts notes at the maximum length", () => {
    const notes = "a".repeat(1_000);

    expect(parseTransactionInput({ ...validTransaction, notes }).notes).toBe(
      notes,
    );
  });

  it.each(["a".repeat(1_001), 42, [], {}])(
    "rejects invalid transaction notes: %j",
    (notes) => {
      expect(() =>
        parseTransactionInput({ ...validTransaction, notes }),
      ).toThrow();
    },
  );

  it.each([undefined, null, "transaction", [], 42])(
    "rejects malformed transaction input: %j",
    (input) => {
      expect(() => parseTransactionInput(input)).toThrow();
    },
  );
});
