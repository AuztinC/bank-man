import { describe, expect, it } from "vitest";

import { addCents, formatCents } from "./money";

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
  it("formats cents as US dollars", () => {
    expect(formatCents(1_025)).toBe("$10.25");
  });
});
