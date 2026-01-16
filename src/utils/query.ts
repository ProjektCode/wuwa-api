/**
 * Shared query utilities for route handlers.
 */

/**
 * Parses a value to a number, returning null if invalid.
 * Handles both string inputs (from raw query params) and
 * number inputs (from Fastify schema coercion).
 */
export function toNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string") return null;
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Case-insensitive substring check.
 */
export function includesCI(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

/**
 * Parses and clamps pagination parameters.
 */
export function parsePagination(
  query: Record<string, unknown>,
  defaults: { limit: number; maxLimit: number } = { limit: 50, maxLimit: 200 }
): { limit: number; offset: number } {
  const limit = Math.min(
    Math.max(toNumber(query.limit) ?? defaults.limit, 1),
    defaults.maxLimit
  );
  const offset = Math.max(toNumber(query.offset) ?? 0, 0);
  return { limit, offset };
}

/**
 * Rate limiting tier configuration.
 */
export type RateLimitTiers = {
  timeWindow: string;
  list: { max: number };
  detail: { max: number };
  image: { max: number };
  docs: { max: number };
};
