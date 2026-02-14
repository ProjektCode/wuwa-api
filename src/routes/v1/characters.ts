import { FastifyInstance } from "fastify";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { DataStore } from "../../services/dataStore";
import {
  toNumber,
  includesCI,
  parsePagination,
  RateLimitTiers,
} from "../../utils/query";
import {
  listCharactersSchema,
  getCharacterSchema,
  listCharacterImagesSchema,
  getCharacterImageSchema,
  CharacterListQuery,
  IdParams,
  ImageFileParams,
} from "../../schemas";

export async function registerCharacterRoutes(
  app: FastifyInstance,
  store: DataStore,
  imagesRoot: string,
  rate: RateLimitTiers
): Promise<void> {
  app.get<{ Querystring: CharacterListQuery }>(
    "/v1/characters",
    {
      schema: listCharactersSchema,
      preHandler: app.rateLimit({
        max: rate.list.max,
        timeWindow: rate.timeWindow,
        groupId: "characters:list",
      }),
    },
    async (req) => {
      const query = req.query;

      const search = query.search?.trim() ?? "";
      const element = query.element?.trim() ?? "";
      const weaponType = query.weaponType?.trim() ?? "";
      const rarity = toNumber(query.rarity);

      const { limit, offset } = parsePagination(query);

      let items = store.listCharacters();

      if (search) items = items.filter((c) => includesCI(c.name, search));
      if (element)
        items = items.filter(
          (c) => (c.element ?? "").toLowerCase() === element.toLowerCase()
        );
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

  app.get<{ Params: IdParams }>(
    "/v1/characters/:id",
    {
      schema: getCharacterSchema,
      preHandler: app.rateLimit({
        max: rate.detail.max,
        timeWindow: rate.timeWindow,
        groupId: "characters:detail",
      }),
    },
    async (req, reply) => {
      const { id } = req.params;
      const character = store.getCharacter(id);
      if (!character) {
        reply.code(404);
        return { error: "not_found", message: `Character '${id}' not found` };
      }
      return character;
    }
  );

  app.get<{ Params: IdParams }>(
    "/v1/characters/:id/images",
    {
      schema: listCharacterImagesSchema,
      preHandler: app.rateLimit({
        max: rate.image.max,
        timeWindow: rate.timeWindow,
        groupId: "characters:images:list",
      }),
    },
    async (req, reply) => {
      const { id } = req.params;
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

  app.get<{ Params: ImageFileParams }>(
    "/v1/characters/:id/images/:file",
    {
      schema: getCharacterImageSchema,
      preHandler: app.rateLimit({
        max: rate.image.max,
        timeWindow: rate.timeWindow,
        groupId: "characters:images:file",
      }),
    },
    async (req, reply) => {
      const { id, file } = req.params;

      const normalizedFile = file.toLowerCase();
      const isInvalidFile =
        file.includes("/") ||
        file.includes("\\") ||
        file.includes("..") ||
        !normalizedFile.endsWith(".webp") ||
        !/^[a-z0-9-]+\.webp$/.test(normalizedFile);

      if (isInvalidFile) {
        reply.code(400);
        return { error: "bad_request", message: "Invalid file name" };
      }

      const filePath = path.resolve(imagesRoot, "characters", id, normalizedFile);

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
