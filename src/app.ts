import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import compress from "@fastify/compress";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import crypto from "node:crypto";

import { AppConfig } from "./config";
import { createDataStore } from "./services/dataStore";
import { computeDatasetInfo } from "./services/datasetInfo";
import { registerCharacterRoutes } from "./routes/v1/characters";
import { registerWeaponRoutes } from "./routes/v1/weapons";

export async function buildApp(config: AppConfig): Promise<FastifyInstance> {
  const app = Fastify({
    // Required when running behind Nginx Proxy Manager so req.ip uses X-Forwarded-For.
    trustProxy: true,
    logger: {
      transport:
        process.env.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
              options: { colorize: true, translateTime: "SYS:standard" },
            }
          : undefined,
    },
  });

  await app.register(cors, { origin: true });
  await app.register(compress, { global: true });
  const rateLimitWindow = process.env.RATE_LIMIT_WINDOW ?? "1 minute";
  const listMax = Number(process.env.RATE_LIMIT_LIST_MAX ?? 15);
  const detailMax = Number(process.env.RATE_LIMIT_DETAIL_MAX ?? 60);
  const imageMax = Number(process.env.RATE_LIMIT_IMAGE_MAX ?? 60);

  await app.register(rateLimit, {
    // We'll apply limits per-route using `app.rateLimit()`.
    global: false,
    timeWindow: rateLimitWindow,
    // show headers on both normal + exceeded responses
    addHeadersOnExceeding: {
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
    },
    addHeaders: {
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
      "retry-after": true,
    },
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Wuthering Waves API",
        version: "0.1.0",
      },
    },
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  app.addHook("onSend", async (req, reply, payload) => {
    if (reply.statusCode !== 200) return payload;

    const contentType = String(reply.getHeader("content-type") ?? "");
    if (!contentType.includes("application/json")) return payload;

    const body =
      typeof payload === "string"
        ? payload
        : Buffer.isBuffer(payload)
          ? payload.toString("utf8")
          : null;

    if (body === null) return payload;

    const etag = `W/\"${crypto.createHash("sha1").update(body).digest("hex")}\"`;
    reply.header("ETag", etag);
    reply.header("Cache-Control", "public, max-age=300");

    const ifNoneMatch = req.headers["if-none-match"];
    if (typeof ifNoneMatch === "string" && ifNoneMatch === etag) {
      reply.code(304);
      return "";
    }

    return payload;
  });

  const [store, dataset] = await Promise.all([
    createDataStore(config.dataRoot),
    computeDatasetInfo(config.dataRoot),
  ]);

  app.get("/healthz", async () => {
    return { ok: true };
  });

  app.get("/v1/meta", async () => {
    return {
      name: "wuwa-api",
      version: "0.1.0",
      dataset,
    };
  });

  const rateTiers = {
    timeWindow: rateLimitWindow,
    list: {
      max: Number.isFinite(listMax) ? listMax : 15,
    },
    detail: {
      max: Number.isFinite(detailMax) ? detailMax : 60,
    },
    image: {
      max: Number.isFinite(imageMax) ? imageMax : 60,
    },
  };

  await registerCharacterRoutes(app, store, config.imagesRoot, rateTiers);
  await registerWeaponRoutes(app, store, rateTiers);

  const isProd = process.env.NODE_ENV === "production";

  await app.register(fastifyStatic, {
    root: path.resolve(config.imagesRoot),
    prefix: "/v1/images/",
    decorateReply: false,
    cacheControl: isProd,
    immutable: isProd,
    maxAge: isProd ? "365d" : 0,
  });

  const enableDemo = process.env.ENABLE_DEMO === "true";
  if (enableDemo) {
    await app.register(fastifyStatic, {
      root: path.resolve(".local/demo"),
      prefix: "/demo/",
      decorateReply: false,
      cacheControl: false,
    });
  }

  return app;
}
