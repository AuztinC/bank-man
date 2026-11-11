import { describe, expect, it } from "vitest";

import { parseAccountInput } from "./validation";

describe("parseAccountInput", () => {
  const validAccount = {
    accountName: "Good Account",
    accountType: "checking",
    openingBalance: "10.00",
    openingBalanceAsOf: "2026-11-11",
  };

  it("accepts valid account credentials", () => {
    expect(parseAccountInput(validAccount)).toEqual(validAccount);
  });

  it.each(["checking", "savings", "cash"])(
    "accepts the %s account type",
    (accountType) => {
      expect(
        parseAccountInput({ ...validAccount, accountType }).accountType,
      ).toBe(accountType);
    },
  );

  it.each([
    [" CHECKING ", "checking"],
    ["Savings", "savings"],
  ])("normalizes the account type %j to %j", (accountType, expected) => {
    expect(
      parseAccountInput({ ...validAccount, accountType }).accountType,
    ).toBe(expected);
  });

  it.each(["bitcoin", "", "   ", undefined, null, 42])(
    "rejects an invalid account type: %j",
    (accountType) => {
      expect(() =>
        parseAccountInput({ ...validAccount, accountType }),
      ).toThrow();
    },
  );

  it.each(["", undefined, 42])(
    "rejects an invalid account name: %j",
    (accountName) => {
      expect(() =>
        parseAccountInput({ ...validAccount, accountName }),
      ).toThrow();
    },
  );

  it.each([undefined, null, 42])(
    "rejects an invalid opening balance: %j",
    (openingBalance) => {
      expect(() =>
        parseAccountInput({ ...validAccount, openingBalance }),
      ).toThrow();
    },
  );

  it("accepts a valid leap-day opening balance date", () => {
    expect(
      parseAccountInput({
        ...validAccount,
        openingBalanceAsOf: "2028-02-29",
      }).openingBalanceAsOf,
    ).toBe("2028-02-29");
  });

  it.each([
    undefined,
    null,
    42,
    "",
    "11/11/2026",
    "2025-02-29",
    "2026-13-01",
    "2026-11-11T00:00:00Z",
  ])("rejects an invalid opening balance date: %j", (openingBalanceAsOf) => {
    expect(() =>
      parseAccountInput({ ...validAccount, openingBalanceAsOf }),
    ).toThrow();
  });

  it.each([undefined, null, "account", []])(
    "rejects a malformed account input: %j",
    (input) => {
      expect(() => parseAccountInput(input)).toThrow();
    },
  );
});
