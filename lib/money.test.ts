import { describe, expect, it } from "vitest";

import {
  addCents,
  addMoney,
  formatCents,
  parseUsdToCents,
  subtractCents,
  sumCents,
  type Money,
} from "@/lib/money";

describe("cent arithmetic", () => {
  it.each([
    [1_025, 250, 1_275],
    [1_275, -250, 1_025],
    [0, 0, 0],
    [500, -750, -250],
    [-500, -750, -1_250],
    [-500, 750, 250],
  ])("adds %i cents and %i cents", (left, right, expected) => {
    expect(addCents(left, right)).toBe(expected);
  });

  it.each([
    [1_275, 250, 1_025],
    [250, 500, -250],
    [-250, -500, 250],
    [0, 0, 0],
  ])("subtracts %i cents from %i cents", (left, right, expected) => {
    expect(subtractCents(left, right)).toBe(expected);
  });

  it("sums multiple positive and negative amounts", () => {
    expect(sumCents([1_000, -250, 500, -1_250])).toBe(0);
  });

  it("returns zero for an empty collection", () => {
    expect(sumCents([])).toBe(0);
  });

  it("does not mutate the collection being summed", () => {
    const amounts = Object.freeze([100, 200, -50]);

    expect(sumCents(amounts)).toBe(250);
    expect(amounts).toEqual([100, 200, -50]);
  });

  it.each([1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_VALUE])(
    "rejects an invalid cent operand: %s",
    (amount) => {
      expect(() => addCents(amount, 1)).toThrow(RangeError);
      expect(() => addCents(1, amount)).toThrow(RangeError);
      expect(() => subtractCents(amount, 1)).toThrow(RangeError);
      expect(() => subtractCents(1, amount)).toThrow(RangeError);
    },
  );

  it("rejects addition outside the safe integer range", () => {
    expect(() => addCents(Number.MAX_SAFE_INTEGER, 1)).toThrow(RangeError);
    expect(() => addCents(Number.MIN_SAFE_INTEGER, -1)).toThrow(RangeError);
  });

  it("rejects subtraction outside the safe integer range", () => {
    expect(() => subtractCents(Number.MAX_SAFE_INTEGER, -1)).toThrow(
      RangeError,
    );
    expect(() => subtractCents(Number.MIN_SAFE_INTEGER, 1)).toThrow(RangeError);
  });

  it("rejects an intermediate sum outside the safe integer range", () => {
    expect(() => sumCents([Number.MAX_SAFE_INTEGER, 1, -1])).toThrow(
      RangeError,
    );
  });
});

describe("parseUsdToCents", () => {
  it.each([
    ["0", 0],
    ["0.00", 0],
    ["12", 1_200],
    ["12.3", 1_230],
    ["12.34", 1_234],
    [".05", 5],
    ["+.50", 50],
    ["-0.05", -5],
    ["  42.10  ", 4_210],
    ["00012.04", 1_204],
    ["-0", 0],
    ["-0.00", 0],
  ])("parses %j as %i cents", (value, expected) => {
    expect(parseUsdToCents(value)).toBe(expected);
  });

  it.each([
    "",
    "   ",
    ".",
    "+",
    "-",
    "1.",
    "1.234",
    "1,000.00",
    "$12.34",
    "12 34",
    "1e2",
    "NaN",
    "Infinity",
    "--1.00",
  ])("rejects malformed input: %j", (value) => {
    expect(() => parseUsdToCents(value)).toThrow(TypeError);
  });

  it("parses the largest safe positive cent value", () => {
    expect(parseUsdToCents("90071992547409.91")).toBe(Number.MAX_SAFE_INTEGER);
  });

  it("parses the smallest safe negative cent value", () => {
    expect(parseUsdToCents("-90071992547409.91")).toBe(Number.MIN_SAFE_INTEGER);
  });

  it.each(["90071992547409.92", "-90071992547409.92"])(
    "rejects an amount outside the safe integer range: %s",
    (value) => {
      expect(() => parseUsdToCents(value)).toThrow(RangeError);
    },
  );
});

describe("formatCents", () => {
  it.each([
    [1_275, "$12.75"],
    [0, "$0.00"],
    [-250, "-$2.50"],
    [5, "$0.05"],
    [1_000, "$10.00"],
    [123_456, "$1,234.56"],
  ])("formats %i cents as %s", (cents, expected) => {
    expect(formatCents(cents)).toBe(expected);
  });

  it.each([
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.MAX_VALUE,
  ])("rejects an invalid cent value: %s", (cents) => {
    expect(() => formatCents(cents)).toThrow(RangeError);
  });
});

describe("addMoney", () => {
  it("adds amounts with the same currency", () => {
    expect(
      addMoney(
        { cents: 1_000, currency: "USD" },
        { cents: -250, currency: "USD" },
      ),
    ).toEqual({ cents: 750, currency: "USD" });
  });

  it("does not mutate either input", () => {
    const left: Money = Object.freeze({ cents: 100, currency: "USD" });
    const right: Money = Object.freeze({ cents: 200, currency: "USD" });

    expect(addMoney(left, right)).toEqual({ cents: 300, currency: "USD" });
    expect(left).toEqual({ cents: 100, currency: "USD" });
    expect(right).toEqual({ cents: 200, currency: "USD" });
  });

  it("rejects mismatched currencies", () => {
    expect(() =>
      addMoney(
        { cents: 100, currency: "USD" },
        { cents: 100, currency: "EUR" },
      ),
    ).toThrow("Cannot add USD and EUR amounts.");
  });

  it.each(["usd", "US", "USDD", "12D", ""])(
    "rejects an invalid currency code: %j",
    (currency) => {
      expect(() =>
        addMoney({ cents: 100, currency }, { cents: 100, currency: "USD" }),
      ).toThrow(TypeError);
      expect(() =>
        addMoney({ cents: 100, currency: "USD" }, { cents: 100, currency }),
      ).toThrow(TypeError);
    },
  );

  it("rejects invalid cent values", () => {
    expect(() =>
      addMoney(
        { cents: 1.5, currency: "USD" },
        { cents: 100, currency: "USD" },
      ),
    ).toThrow(RangeError);
  });
});
