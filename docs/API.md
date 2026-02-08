# WuwaAPI Public API Reference

This document provides a high-level overview of the public API endpoints exposed by the WuwaAPI. For detailed schema information and interactive exploration, please refer to the `/docs` (Swagger UI) endpoint on a running instance of the API.

## Base URL

The API is typically served at `http://localhost:3000/v1` in development, or your configured domain in production.

## Endpoints Overview

The API provides endpoints for accessing data related to Wuthering Waves characters and weapons.

### `GET /v1/meta`

*   **Description:** Retrieves metadata about the API and the current dataset.
*   **Response:** Includes information such as the API version, dataset hash, and potentially other relevant system information.

### `GET /v1/characters`

*   **Description:** Lists all available characters.
*   **Query Parameters:** Supports filtering and pagination (e.g., `search`, `element`, `weaponType`, `rarity`, `limit`, `offset`).
*   **Character Schema Notes:** The character schema now includes new optional fields:
    *   `combatRoles`
    *   `officialIntroduction`
    *   `releaseDate`
    *   `nation`
    *   `gender`
    *   `class`
    *   `birthplace`
    *   `additionalTitles`
    *   `affiliations`
    *   `skinImages`
    *   `resonanceChain`
    *   Aemeath has also been added to the dataset.

### `GET /v1/characters/:id`

*   **Description:** Retrieves detailed information for a specific character by their unique identifier.

### `GET /v1/weapons`

*   **Description:** Lists all available weapons.
*   **Query Parameters:** Supports filtering and pagination (e.g., `search`, `type`, `rarity`, `limit`, `offset`).

### `GET /v1/weapons/:id`

*   **Description:** Retrieves detailed information for a specific weapon by its unique identifier.

### `GET /v1/images/...`

*   **Description:** Serves static image assets.

## API Features

*   **CORS Allowlist:** The API respects a configurable CORS allowlist to control access from web browsers.
*   **Security Headers:** Implements various security headers to enhance protection.
*   **Rate Limits:** Different rate limits are applied per tier of endpoints (e.g., list, detail, image, docs) to prevent abuse.
*   **Data Store:** Random stats in the data store are subject to rounding.
*   **Docs Tier:** The `/docs` (Swagger UI) endpoint has its own rate limit tier.