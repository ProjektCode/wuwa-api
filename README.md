# wuwa-api

A Node.js (Fastify) REST API + importer for **Wuthering Waves** data. It serves structured JSON (characters, weapons, metadata) and local images.

Not affiliated with or endorsed by Kuro Games.

## Features

- REST API under `/v1/*`
- Swagger UI at `/docs`
- File-backed dataset:
  - `assets/data/**/en.json`
  - `assets/images/**` (normalized `.webp`)
- Importer that pulls from community sources (Prydwen + Fandom) and normalizes:
  - character skills + scaling tables
  - character base stats at levels `20/50/90`
  - character images: `icon/card/splash/attribute`
  - weapon base ATK at `20/50/90` + passive effects + weapon icon
- Data validation command (`npm run validate-data`)

## Requirements

- Node.js (recommend current LTS)

## Install

```bash
npm install
```

## Run

### Development

```bash
# optional: copy and tweak env
cp .env.example .env

npm run dev
```

Open:
- Swagger UI: `http://127.0.0.1:3000/docs`

### Build + start

```bash
npm run build
npm run start
```

## Environment variables

- `PORT` (default `3000`)
- `HOST` (default `0.0.0.0`)
- `DATA_ROOT` (default `assets/data`)
- `IMAGES_ROOT` (default `assets/images`)

Rate limit tiers (self-hosters can change these in `.env` or in `docker-compose.yml`):
- `RATE_LIMIT_WINDOW` (default `1 minute`)
- `RATE_LIMIT_LIST_MAX` (default `15`) — list endpoints (`/v1/characters`, `/v1/weapons`)
- `RATE_LIMIT_DETAIL_MAX` (default `60`) — detail endpoints (`/v1/characters/:id`, `/v1/weapons/:id`)
- `RATE_LIMIT_IMAGE_MAX` (default `60`) — character image routes
- `RATE_LIMIT_DOCS_MAX` (default `120`) — docs routes (`/docs`, `/documentation/*`)

CORS:
- `CORS_ALLOWED_ORIGINS` (comma-separated) — browser allowlist for cross-origin requests (curl/server-to-server clients are unaffected)

Demo:
- `ENABLE_DEMO` (default `false`) — enables `/demo/*` (served from `.local/demo` and not intended for public deploys)

Example:

```bash
# easiest way: use a .env file
cp .env.example .env

# then edit .env and run
npm run dev
```

## API endpoints

### Health

- `GET /healthz`

```bash
curl -s http://127.0.0.1:3000/healthz
```

### Swagger docs

- `GET /docs`

### Meta

- `GET /v1/meta`

```bash
curl -s http://127.0.0.1:3000/v1/meta
```

### Characters

- `GET /v1/characters` (supports `search`, `element`, `weaponType`, `rarity`, `limit`, `offset`)
- `GET /v1/characters/:id`

```bash
curl -s "http://127.0.0.1:3000/v1/characters?search=augusta" | jq
curl -s http://127.0.0.1:3000/v1/characters/augusta | jq
```

### Character images

- `GET /v1/characters/:id/images` (lists available `.webp` files)
- `GET /v1/characters/:id/images/:file`

```bash
curl -s http://127.0.0.1:3000/v1/characters/augusta/images | jq
curl -L http://127.0.0.1:3000/v1/characters/augusta/images/splash.webp --output splash.webp
```

### Weapons

- `GET /v1/weapons` (supports `search`, `type`, `rarity`, `limit`, `offset`)
- `GET /v1/weapons/:id`

```bash
curl -s "http://127.0.0.1:3000/v1/weapons?search=harvest" | jq
curl -s http://127.0.0.1:3000/v1/weapons/ages-of-harvest | jq
```

### Static image root (legacy/compat)

- `GET /v1/images/...` serves static files rooted at `IMAGES_ROOT`.

Example:

```bash
curl -I http://127.0.0.1:3000/v1/images/characters/augusta/splash.webp
```

## Rate limiting

Rate limiting is enforced by `@fastify/rate-limit` using **route-level tiers**.

- List endpoints (`/v1/characters`, `/v1/weapons`): `RATE_LIMIT_LIST_MAX` per `RATE_LIMIT_WINDOW`
- Detail endpoints (`/v1/characters/:id`, `/v1/weapons/:id`): `RATE_LIMIT_DETAIL_MAX` per `RATE_LIMIT_WINDOW`
- Character image endpoints (`/v1/characters/:id/images*`): `RATE_LIMIT_IMAGE_MAX` per `RATE_LIMIT_WINDOW`
- Docs endpoints (`/docs`, `/documentation/*`): `RATE_LIMIT_DOCS_MAX` per `RATE_LIMIT_WINDOW`

This API is designed to be public but discourage heavy usage (encourage self-hosting).

## Importer (private)

This repository intentionally does **not** include the importer/scraper.

Reason: publishing scraping code in a public repository can cause unwanted load on upstream community sites.

If you are the maintainer and want the importer:
- keep it in a **private** repo
- run it locally to generate `assets/data` and `assets/images`
- then publish only the dataset you’re comfortable making public (or keep the repo private)

## Validate data

After importing (or after manual edits):

```bash
npm run validate-data
```

## Temporary demo page

A temporary demo page exists at:
- `/demo/augusta.html`

It is **disabled by default**. Enable it only for local testing:

```bash
ENABLE_DEMO=true npm run dev
```

The demo HTML is loaded from `.local/demo` (gitignored) so it won’t be published with the repo.

## Data sources

The dataset in `assets/` is sourced from community resources (e.g. Prydwen and Fandom).

If you maintain your own private importer, be respectful:
- avoid tight loops
- keep delays reasonable
- comply with site rules/ToS

## Docker + deployment notes

This repo can be deployed anywhere that runs Docker.

### Build + run locally

```bash
docker build -t wuwa-api .
docker run --rm -p 3000:3000 wuwa-api
```

The API is then available at:
- `http://127.0.0.1:3000/docs`

### Deploy with Nginx Proxy Manager (recommended for home server)

Use `docker-compose.yml` and connect the container to the same external Docker network as Nginx Proxy Manager. (GHCR image names must be lowercase; this repo uses `ghcr.io/projektcode/wuwa-api`.)

Key points:
- Do **not** publish the API container port to the internet (no `ports:` section).
- Use `expose: 3000` and attach to the NPM network (this repo’s compose uses the external network name `nginx_proxy`).

Run:

```bash
# first start
docker compose up -d

# updates (pull new image)
docker compose pull
docker compose up -d
```

#### NPM UI setup

In Nginx Proxy Manager → **Proxy Hosts** → **Add Proxy Host**:
- **Domain Names**: `api.custom.domain`
- **Scheme**: `http`
- **Forward Hostname / IP**: `wuwa-api`
- **Forward Port**: `3000`

Then under **SSL**:
- request/choose a cert for `api.custom.domain`
- enable **Force SSL**

After that, your API should be reachable at:
- `https://api.custom.domain/v1/characters/augusta`

### Hosting recommendations

Because this API serves a lot of image bytes, free tiers are often limited by bandwidth.

Good fits:
- Fly.io / Render / Railway / Koyeb (simple deploy; expect cold starts/limits on free tiers)
- Google Cloud Run (good free usage-based tier; container-based; scales to zero)
- A small VPS / Oracle Cloud Always Free VM (best for always-on self-host)

### Images: cache vs object storage

Start simple:
- keep images in `assets/images`
- run with `NODE_ENV=production` so image responses can be cached aggressively

If bandwidth becomes a problem:
- move images to object storage + CDN (e.g., S3/R2 + a CDN)
- keep the JSON API here, but change image URLs to point at the CDN
