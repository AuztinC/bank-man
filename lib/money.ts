export type Money = Readonly<{
  cents: number;
  currency: string;
}>;

function assertCents(cents: number, name: string): void {
  if (!Number.isSafeInteger(cents)) {
    throw new RangeError(`${name} must be a safe integer number of cents.`);
  }
}

function assertCurrency(currency: string, name: string): void {
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new TypeError(
      `${name} must be a three-letter uppercase currency code.`,
    );
  }
}

function assertSafeResult(cents: number): number {
  assertCents(cents, "The result");
  return Object.is(cents, -0) ? 0 : cents;
}

export function addCents(left: number, right: number): number {
  assertCents(left, "left");
  assertCents(right, "right");

  return assertSafeResult(left + right);
}

export function subtractCents(left: number, right: number): number {
  assertCents(left, "left");
  assertCents(right, "right");

  return assertSafeResult(left - right);
}

export function sumCents(amounts: readonly number[]): number {
  return amounts.reduce((total, amount) => addCents(total, amount), 0);
}

export function parseUsdToCents(value: string): number {
  const normalized = value.trim();
  const match = /^([+-]?)(?:(\d+)(?:\.(\d{1,2}))?|\.(\d{1,2}))$/.exec(
    normalized,
  );

  if (!match) {
    throw new TypeError(
      "USD amount must be a decimal number with at most two decimal places.",
    );
  }

  const [, sign, wholePart = "0", wholeFraction, fractionOnly] = match;
  const fraction = (wholeFraction ?? fractionOnly ?? "").padEnd(2, "0");
  const magnitude = BigInt(wholePart) * BigInt(100) + BigInt(fraction || "0");
  const signedCents = sign === "-" ? -magnitude : magnitude;

  if (
    signedCents > BigInt(Number.MAX_SAFE_INTEGER) ||
    signedCents < BigInt(Number.MIN_SAFE_INTEGER)
  ) {
    throw new RangeError("USD amount is outside the safe integer range.");
  }

  const cents = Number(signedCents);
  return Object.is(cents, -0) ? 0 : cents;
}

export function formatCents(cents: number): string {
  assertCents(cents, "cents");

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function addMoney(left: Money, right: Money): Money {
  assertCurrency(left.currency, "left.currency");
  assertCurrency(right.currency, "right.currency");

  if (left.currency !== right.currency) {
    throw new RangeError(
      `Cannot add ${left.currency} and ${right.currency} amounts.`,
    );
  }

  return {
    cents: addCents(left.cents, right.cents),
    currency: left.currency,
  };
}
