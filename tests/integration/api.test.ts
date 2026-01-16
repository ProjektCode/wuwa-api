import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import path from "node:path";
import { buildApp } from "../../src/app";

describe("API Integration Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    // Use test fixtures instead of real data
    app = await buildApp({
      port: 0,
      host: "127.0.0.1",
      dataRoot: path.join(__dirname, "../fixtures/data"),
      imagesRoot: path.join(__dirname, "../fixtures/images"),
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // =========================================================================
  // Health & Meta
  // =========================================================================

  describe("GET /healthz", () => {
    it("returns ok: true", async () => {
      const res = await app.inject({ method: "GET", url: "/healthz" });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ ok: true });
    });
  });

  describe("GET /v1/meta", () => {
    it("returns API metadata", async () => {
      const res = await app.inject({ method: "GET", url: "/v1/meta" });
      expect(res.statusCode).toBe(200);

      const body = res.json();
      expect(body.name).toBe("wuwa-api");
      expect(body.version).toBe("1.0.0");
      expect(body.dataset).toBeDefined();
      expect(body.dataset.counts.characters).toBe(1);
      expect(body.dataset.counts.weapons).toBe(1);
    });
  });

  // =========================================================================
  // Characters
  // =========================================================================

  describe("GET /v1/characters", () => {
    it("returns paginated list", async () => {
      const res = await app.inject({ method: "GET", url: "/v1/characters" });
      expect(res.statusCode).toBe(200);

      const body = res.json();
      expect(body.total).toBe(1);
      expect(body.limit).toBe(50);
      expect(body.offset).toBe(0);
      expect(body.items).toHaveLength(1);
      expect(body.items[0].id).toBe("test-char");
    });

    it("filters by search", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/characters?search=test",
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().items).toHaveLength(1);

      const noMatch = await app.inject({
        method: "GET",
        url: "/v1/characters?search=nonexistent",
      });
      expect(noMatch.json().items).toHaveLength(0);
    });

    it("filters by element", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/characters?element=Spectro",
      });
      expect(res.json().items).toHaveLength(1);

      const noMatch = await app.inject({
        method: "GET",
        url: "/v1/characters?element=Havoc",
      });
      expect(noMatch.json().items).toHaveLength(0);
    });

    it("filters by rarity", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/characters?rarity=5",
      });
      expect(res.json().items).toHaveLength(1);

      const noMatch = await app.inject({
        method: "GET",
        url: "/v1/characters?rarity=4",
      });
      expect(noMatch.json().items).toHaveLength(0);
    });

    it("respects pagination params", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/characters?limit=10&offset=0",
      });
      const body = res.json();
      expect(body.limit).toBe(10);
      expect(body.offset).toBe(0);
    });
  });

  describe("GET /v1/characters/:id", () => {
    it("returns character by ID", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/characters/test-char",
      });
      expect(res.statusCode).toBe(200);

      const body = res.json();
      expect(body.id).toBe("test-char");
      expect(body.name).toBe("Test Character");
      expect(body.rarity).toBe(5);
      expect(body.element).toBe("Spectro");
      expect(body.statsByLevel).toBeDefined();
      expect(body.skills).toHaveLength(1);
    });

    it("returns 404 for unknown ID", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/characters/unknown",
      });
      expect(res.statusCode).toBe(404);
      expect(res.json().error).toBe("not_found");
    });
  });

  describe("GET /v1/characters/:id/images", () => {
    it("returns empty array when no images exist", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/characters/test-char/images",
      });
      expect(res.statusCode).toBe(200);

      const body = res.json();
      expect(body.id).toBe("test-char");
      expect(body.images).toEqual([]); // No actual image files in fixtures
    });

    it("returns 404 for unknown character", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/characters/unknown/images",
      });
      expect(res.statusCode).toBe(404);
    });
  });

  // =========================================================================
  // Weapons
  // =========================================================================

  describe("GET /v1/weapons", () => {
    it("returns paginated list", async () => {
      const res = await app.inject({ method: "GET", url: "/v1/weapons" });
      expect(res.statusCode).toBe(200);

      const body = res.json();
      expect(body.total).toBe(1);
      expect(body.items).toHaveLength(1);
      expect(body.items[0].id).toBe("test-weapon");
    });

    it("filters by search", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/weapons?search=sword",
      });
      expect(res.json().items).toHaveLength(1);
    });

    it("filters by type", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/weapons?type=Sword",
      });
      expect(res.json().items).toHaveLength(1);

      const noMatch = await app.inject({
        method: "GET",
        url: "/v1/weapons?type=Gauntlets",
      });
      expect(noMatch.json().items).toHaveLength(0);
    });
  });

  describe("GET /v1/weapons/:id", () => {
    it("returns weapon by ID", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/weapons/test-weapon",
      });
      expect(res.statusCode).toBe(200);

      const body = res.json();
      expect(body.id).toBe("test-weapon");
      expect(body.name).toBe("Test Sword");
      expect(body.passive).toBeDefined();
    });

    it("returns 404 for unknown ID", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/weapons/unknown",
      });
      expect(res.statusCode).toBe(404);
    });
  });

  // =========================================================================
  // Security Headers
  // =========================================================================

  describe("Security Headers", () => {
    it("includes security headers in response", async () => {
      const res = await app.inject({ method: "GET", url: "/healthz" });

      expect(res.headers["x-content-type-options"]).toBe("nosniff");
      expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
      expect(res.headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(res.headers["x-powered-by"]).toContain("OpenCode");
    });
  });

  // =========================================================================
  // Caching
  // =========================================================================

  describe("Caching", () => {
    it("includes ETag and Cache-Control for JSON responses", async () => {
      const res = await app.inject({ method: "GET", url: "/v1/meta" });

      expect(res.headers["etag"]).toBeDefined();
      expect(res.headers["cache-control"]).toBe("public, max-age=300");
    });

    it("returns 304 when ETag matches", async () => {
      const first = await app.inject({ method: "GET", url: "/v1/meta" });
      const etag = first.headers["etag"];

      const second = await app.inject({
        method: "GET",
        url: "/v1/meta",
        headers: { "if-none-match": etag },
      });

      expect(second.statusCode).toBe(304);
    });
  });
});
