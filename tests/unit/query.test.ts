import { describe, it, expect } from "vitest";
import { toNumber, includesCI, parsePagination } from "../../src/utils/query";

describe("toNumber", () => {
  it("parses valid number strings", () => {
    expect(toNumber("42")).toBe(42);
    expect(toNumber("3.14")).toBe(3.14);
    expect(toNumber("0")).toBe(0);
    expect(toNumber("-5")).toBe(-5);
  });

  it("handles number inputs (from schema coercion)", () => {
    expect(toNumber(42)).toBe(42);
    expect(toNumber(3.14)).toBe(3.14);
    expect(toNumber(0)).toBe(0);
    expect(toNumber(-5)).toBe(-5);
  });

  it("returns null for invalid inputs", () => {
    expect(toNumber("abc")).toBeNull();
    expect(toNumber("")).toBeNull();
    expect(toNumber("   ")).toBeNull();
    expect(toNumber("12abc")).toBeNull();
    expect(toNumber(undefined)).toBeNull();
    expect(toNumber(null)).toBeNull();
    expect(toNumber({})).toBeNull();
    expect(toNumber([])).toBeNull();
  });

  it("returns null for non-finite numbers", () => {
    expect(toNumber("Infinity")).toBeNull();
    expect(toNumber("-Infinity")).toBeNull();
    expect(toNumber("NaN")).toBeNull();
    expect(toNumber(Infinity)).toBeNull();
    expect(toNumber(NaN)).toBeNull();
  });
});

describe("includesCI", () => {
  it("finds substrings case-insensitively", () => {
    expect(includesCI("Augusta", "aug")).toBe(true);
    expect(includesCI("Augusta", "AUG")).toBe(true);
    expect(includesCI("Augusta", "usta")).toBe(true);
    expect(includesCI("CAMELLYA", "camel")).toBe(true);
  });

  it("returns false when substring not found", () => {
    expect(includesCI("Augusta", "xyz")).toBe(false);
    expect(includesCI("Augusta", "augustaa")).toBe(false);
  });

  it("handles empty strings", () => {
    expect(includesCI("Augusta", "")).toBe(true); // empty string is in everything
    expect(includesCI("", "aug")).toBe(false);
    expect(includesCI("", "")).toBe(true);
  });
});

describe("parsePagination", () => {
  it("uses defaults when no params provided", () => {
    const result = parsePagination({});
    expect(result).toEqual({ limit: 50, offset: 0 });
  });

  it("parses valid limit and offset", () => {
    const result = parsePagination({ limit: "25", offset: "10" });
    expect(result).toEqual({ limit: 25, offset: 10 });
  });

  it("clamps limit to max (200)", () => {
    const result = parsePagination({ limit: "999" });
    expect(result.limit).toBe(200);
  });

  it("clamps limit to min (1)", () => {
    const result = parsePagination({ limit: "0" });
    expect(result.limit).toBe(1);

    const negative = parsePagination({ limit: "-5" });
    expect(negative.limit).toBe(1);
  });

  it("clamps offset to min (0)", () => {
    const result = parsePagination({ offset: "-10" });
    expect(result.offset).toBe(0);
  });

  it("handles invalid values gracefully", () => {
    const result = parsePagination({ limit: "abc", offset: "xyz" });
    expect(result).toEqual({ limit: 50, offset: 0 });
  });

  it("respects custom defaults", () => {
    const result = parsePagination({}, { limit: 20, maxLimit: 100 });
    expect(result.limit).toBe(20);

    const clamped = parsePagination({ limit: "150" }, { limit: 20, maxLimit: 100 });
    expect(clamped.limit).toBe(100);
  });
});
