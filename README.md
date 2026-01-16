# wuwa-api

A Node.js (Fastify) REST API for **Wuthering Waves** data — serves structured JSON (characters, weapons) and optimized WebP images.

> Not affiliated with or endorsed by Kuro Games.

## Quick Start

```bash
npm install
cp .env.example .env   # optional
npm run dev            # http://127.0.0.1:3000/docs
```

**Production:** `npm run build && npm start`

## Features

- REST API at `/v1/*` with Swagger UI at `/docs`
- File-backed dataset (`assets/data`, `assets/images`)
- Characters: skills, scaling tables, stats at 20/50/90, images (icon/card/splash/attribute)
- Weapons: base ATK at 20/50/90, passive effects, icons
- Rate limiting by route tier
- Data validation: `npm run validate-data`

---

<details>
<summary><strong>API Endpoints</strong></summary>

| Endpoint | Description |
|----------|-------------|
| `GET /healthz` | Health check |
| `GET /docs` | Swagger UI |
| `GET /v1/meta` | API & dataset metadata |
| `GET /v1/characters` | List characters (`search`, `element`, `weaponType`, `rarity`, `limit`, `offset`) |
| `GET /v1/characters/:id` | Character details |
| `GET /v1/characters/:id/images` | List available images |
| `GET /v1/characters/:id/images/:file` | Get image file |
| `GET /v1/weapons` | List weapons (`search`, `type`, `rarity`, `limit`, `offset`) |
| `GET /v1/weapons/:id` | Weapon details |
| `GET /v1/images/...` | Static image files (legacy) |

**Examples:**
```bash
curl -s "http://127.0.0.1:3000/v1/characters?search=augusta" | jq
curl -s http://127.0.0.1:3000/v1/characters/augusta | jq
curl -s http://127.0.0.1:3000/v1/weapons/ages-of-harvest | jq
```

</details>

<details>
<summary><strong>Environment Variables</strong></summary>

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `HOST` | `0.0.0.0` | Server host |
| `DATA_ROOT` | `assets/data` | JSON data directory |
| `IMAGES_ROOT` | `assets/images` | Image directory |
| `RATE_LIMIT_WINDOW` | `1 minute` | Rate limit window |
| `RATE_LIMIT_LIST_MAX` | `15` | List endpoints limit |
| `RATE_LIMIT_DETAIL_MAX` | `60` | Detail endpoints limit |
| `RATE_LIMIT_IMAGE_MAX` | `60` | Image endpoints limit |
| `RATE_LIMIT_DOCS_MAX` | `120` | Docs endpoints limit |
| `CORS_ALLOWED_ORIGINS` | — | Comma-separated browser allowlist |
| `ENABLE_DEMO` | `false` | Enable `/demo/*` (local testing only) |

See `.env.example` for a complete template.

</details>

<details>
<summary><strong>Docker & Deployment</strong></summary>

### Local Docker

```bash
docker build -t wuwa-api .
docker run --rm -p 3000:3000 wuwa-api
```

### With Nginx Proxy Manager

Use `docker-compose.yml` on the same Docker network as NPM:

```bash
docker compose up -d          # first start
docker compose pull && docker compose up -d   # updates
```

**NPM setup:** Add proxy host → Forward `wuwa-api:3000` → Enable SSL.

### Hosting Options

| Platform | Notes |
|----------|-------|
| Fly.io / Render / Railway | Simple deploy; free tier limits apply |
| Google Cloud Run | Usage-based; scales to zero |
| Small VPS / Oracle Free VM | Best for always-on self-host |

### Scaling Images

Start with images in `assets/images`. If bandwidth becomes an issue, move to object storage + CDN (S3/R2) and update image URLs.

</details>

---

## Data Sources

Dataset in `assets/` is sourced from community resources (Prydwen, Fandom).