import { describe, expect, it } from "vitest";

import { addCents, formatCents } from "@/lib/money";

describe("addCents", () => {
  it("adds two monetary amounts represented in cents", () => {
    expect(addCents(1_025, 250)).toBe(1_275);
  });

  it("reduces the total when adding a negative amount", () => {
    expect(addCents(1_275, -250)).toBe(1_025);
  });

  it("returns zero when adding two zero-dollar amounts", () => {
    expect(addCents(0, 0)).toBe(0);
  });

  it("allows an expense to produce a negative balance", () => {
    expect(addCents(500, -750)).toBe(-250);
  });
});

describe("formatCents", () => {
  it("formats the result of adding two positive amounts", () => {
    expect(formatCents(1_275)).toBe("$12.75");
  });

  it("formats a positive balance after adding a negative amount", () => {
    expect(formatCents(1_025)).toBe("$10.25");
  });

  it("formats a zero-dollar amount", () => {
    expect(formatCents(0)).toBe("$0.00");
  });

  it("formats a negative balance", () => {
    expect(formatCents(-250)).toBe("-$2.50");
  });

  it("formats an amount below one dollar", () => {
    expect(formatCents(5)).toBe("$0.05");
  });

  it("formats a whole-dollar amount with two decimal places", () => {
    expect(formatCents(1_000)).toBe("$10.00");
  });

  it("formats a large amount with thousands separators", () => {
    expect(formatCents(123_456)).toBe("$1,234.56");
  });
});
