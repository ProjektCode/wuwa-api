# WuwaAPI Public API Reference

Welcome to the WuwaAPI Public API Reference! This document provides a high-level overview of the available endpoints for accessing Wuthering Waves game data. For more detailed schema information, request/response examples, and interactive testing, please consult the `/docs` (Swagger UI) endpoint on a running API instance.

## Base URL

The API is typically accessible at `http://localhost:3000/v1` during development. In a production environment, you'll use the configured domain (e.g., `https://wuwa-api.projektcode.com/v1`).

## Endpoints Overview

The WuwaAPI offers a set of endpoints designed to provide comprehensive Wuthering Waves character and weapon data.

### `GET /v1/meta`

*   **Description:** Retrieves essential metadata about the API and the version of the game data it currently serves.
*   **Response:** Includes information such as the API version, a unique dataset hash, and other relevant system details.

### `GET /v1/characters`

*   **Description:** Fetches a list of all available characters in the Wuthering Waves universe.
*   **Query Parameters:** Supports powerful filtering and pagination options, including `search` (for character names), `element`, `weaponType`, `rarity`, `limit` (for result count), and `offset` (for pagination).
*   **Character Schema Notes:** The character data includes various enriched fields, such as:
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

### `GET /v1/characters/:id`

*   **Description:** Retrieves detailed information for a specific character using their unique identifier (`:id`).

### `GET /v1/weapons`

*   **Description:** Fetches a list of all available weapons in the Wuthering Waves universe.
*   **Query Parameters:** Supports filtering and pagination options, including `search` (for weapon names), `type`, `rarity`, `limit` (for result count), and `offset` (for pagination).

### `GET /v1/weapons/:id`

*   **Description:** Retrieves detailed information for a specific weapon using its unique identifier (`:id`).

### `GET /v1/images/...`

*   **Description:** Serves static image assets related to characters, weapons, and other game elements.

## API Features

*   **CORS Allowlist:** The API enforces a configurable CORS allowlist to manage access from web browsers, enhancing security.
*   **Security Headers:** Various security headers are implemented to provide robust protection against common web vulnerabilities.
*   **Rate Limits:** To ensure fair usage and prevent abuse, different rate limits are applied across various endpoint tiers (e.g., for listing data, fetching details, serving images, and accessing documentation).
*   **Data Consistency:** Statistical values within the served game data (e.g., character stats) are consistently rounded for accuracy and alignment with in-game displays.
*   **Docs Tier:** The `/docs` (Swagger UI) endpoint has its own dedicated rate limit tier, allowing for extensive exploration without impacting other API usage.