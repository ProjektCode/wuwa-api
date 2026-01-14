import { FastifyInstance } from "fastify";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { DataStore } from "../../services/dataStore";

function toNumber(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function includesCI(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export type RateLimitTiers = {
  timeWindow: string;
  list: { max: number };
  detail: { max: number };
  image: { max: number };
  docs: { max: number };
};

export async function registerCharacterRoutes(
  app: FastifyInstance,
  store: DataStore,
  imagesRoot: string,
  rate: RateLimitTiers
): Promise<void> {
  app.get(
    "/v1/characters",
    {
      preHandler: app.rateLimit({
        max: rate.list.max,
        timeWindow: rate.timeWindow,
        groupId: "characters:list",
      }),
    },
    async (req) => {
    const query = req.query as Record<string, unknown>;

    const search = typeof query.search === "string" ? query.search.trim() : "";
    const element = typeof query.element === "string" ? query.element.trim() : "";
    const weaponType =
      typeof query.weaponType === "string" ? query.weaponType.trim() : "";
    const rarity = toNumber(query.rarity);

    const limit = Math.min(Math.max(toNumber(query.limit) ?? 50, 1), 200);
    const offset = Math.max(toNumber(query.offset) ?? 0, 0);

    let items = store.listCharacters();

    if (search) items = items.filter((c) => includesCI(c.name, search));
    if (element)
      items = items.filter((c) => (c.element ?? "").toLowerCase() === element.toLowerCase());
    if (weaponType)
      items = items.filter(
        (c) => (c.weaponType ?? "").toLowerCase() === weaponType.toLowerCase()
      );
    if (rarity !== null) items = items.filter((c) => c.rarity === rarity);

    const total = items.length;
    const paged = items.slice(offset, offset + limit);

    return {
      total,
      limit,
      offset,
      items: paged,
    };
  }
  );

  app.get(
    "/v1/characters/:id",
    {
      preHandler: app.rateLimit({
        max: rate.detail.max,
        timeWindow: rate.timeWindow,
        groupId: "characters:detail",
      }),
    },
    async (req, reply) => {
    const { id } = req.params as { id: string };
    const character = store.getCharacter(id);
    if (!character) {
      reply.code(404);
      return { error: "not_found", message: `Character '${id}' not found` };
    }
    return character;
  }
  );

  app.get(
    "/v1/characters/:id/images",
    {
      preHandler: app.rateLimit({
        max: rate.image.max,
        timeWindow: rate.timeWindow,
        groupId: "characters:images:list",
      }),
    },
    async (req, reply) => {
    const { id } = req.params as { id: string };
    const character = store.getCharacter(id);
    if (!character) {
      reply.code(404);
      return { error: "not_found", message: `Character '${id}' not found` };
    }

    const dirPath = path.resolve(imagesRoot, "characters", id);
    let files: string[];
    try {
      files = await readdir(dirPath);
    } catch {
      files = [];
    }

    const images = files
      .filter((f) => f.toLowerCase().endsWith(".webp"))
      .sort()
      .map((file) => ({
        file,
        url: `/v1/characters/${id}/images/${file}`,
      }));

    return {
      id,
      images,
    };
  }
  );

  app.get(
    "/v1/characters/:id/images/:file",
    {
      preHandler: app.rateLimit({
        max: rate.image.max,
        timeWindow: rate.timeWindow,
        groupId: "characters:images:file",
      }),
    },
    async (req, reply) => {
    const { id, file } = req.params as { id: string; file: string };

    // Basic traversal protection.
    if (file !== path.posix.basename(file)) {
      reply.code(400);
      return { error: "bad_request", message: "Invalid file name" };
    }

    const filePath = path.resolve(imagesRoot, "characters", id, file);

    let bytes: Buffer;
    try {
      bytes = await readFile(filePath);
    } catch {
      reply.code(404);
      return { error: "not_found", message: "Image not found" };
    }

    // Content-type: for now we only store webp.
    reply.type("image/webp");

    if (process.env.NODE_ENV === "production") {
      reply.header("Cache-Control", "public, max-age=31536000, immutable");
    }

    return bytes;
  }
  );
}
