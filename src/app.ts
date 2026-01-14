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

  const poweredBy = "OpenCode + GPT-5.2";

  const isProd = process.env.NODE_ENV === "production";

  const defaultCorsOrigins = ["https://wuwa.projektcode.com", "https://projektcode.github.io"];
  const devCorsOrigins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];

  const allowedCorsOrigins = (
    process.env.CORS_ALLOWED_ORIGINS ??
    [...defaultCorsOrigins, ...(isProd ? [] : devCorsOrigins)].join(",")
  )
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  await app.register(cors, {
    origin: (origin, cb) => {
      // allow non-browser clients (curl, server-to-server)
      if (!origin) return cb(null, true);
      return cb(null, allowedCorsOrigins.includes(origin));
    },
  });

  app.addHook("onRequest", async (req, reply) => {
    reply.header("X-Powered-By", poweredBy);
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("Referrer-Policy", "strict-origin-when-cross-origin");
    reply.header("X-Frame-Options", "SAMEORIGIN");
    reply.header(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    );

    // HSTS only makes sense behind HTTPS.
    const forwardedProto = req.headers["x-forwarded-proto"];
    const isHttps =
      forwardedProto === "https" ||
      (Array.isArray(forwardedProto) && forwardedProto.includes("https"));
    if (isProd && isHttps) {
      reply.header("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
    }
  });

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
        description: `Powered by ${poweredBy}`,
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
      poweredBy,
      dataset,
    };
  });

  const docsMax = Number(process.env.RATE_LIMIT_DOCS_MAX ?? 120);

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
    docs: {
      max: Number.isFinite(docsMax) ? docsMax : 120,
    },
  };

  const docsLimiter = app.rateLimit({
    max: rateTiers.docs.max,
    timeWindow: rateTiers.timeWindow,
    groupId: "docs",
  });
  app.addHook("preHandler", async (req, reply) => {
    const url = req.url;
    if (!url.startsWith("/docs") && !url.startsWith("/documentation")) return;

    await docsLimiter.call(app, req, reply);
  });

  await registerCharacterRoutes(app, store, config.imagesRoot, rateTiers);
  await registerWeaponRoutes(app, store, rateTiers);

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
