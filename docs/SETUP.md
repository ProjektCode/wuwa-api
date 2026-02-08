# Setup and Installation for WuwaAPI

This document provides detailed instructions for setting up and installing the WuwaAPI project.

## 1. Prerequisites

Ensure you have the following installed:

*   Node.js (LTS version recommended)
*   npm (comes with Node.js)
*   Git

## 2. Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd wuwa-api
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```

## 3. Development Setup

1.  **Type Checking:**
    ```bash
    npm run typecheck
    ```
2.  **Run Tests:**
    ```bash
    npm test
    ```
3.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    This will start the Fastify server, typically accessible at `http://localhost:3000`.

## 4. Production Deployment

1.  **Build and Start Production Server:**
    ```bash
    npm run build
    npm start
    ```

## 5. Importer Usage

The importer is a critical component for populating the API's data store. It is located at `dist/scripts/importer/run.js`.

### Importer Arguments

The importer accepts several command-line arguments:

*   `--publish`: (Default: `false`) When present, the importer will write data directly to the API's data store. If omitted, it performs a "dry run" and writes staging output to `.local/import-output`.
*   `--force`: Can only be used with `--publish`. Forces the importer to overwrite existing data.
*   `--only <type>`: Imports only a specific type (e.g., `characters`, `weapons`).
*   `--onlyWeapons`: Shorthand to import only weapons.
*   `--skipCharacters`: Skips importing characters.
*   `--skipWeapons`: Skips importing weapons.
*   `--delayMs <milliseconds>`: (Default: `250`) Delay between requests to external sources.
*   `--concurrency <number>`: (Default: `2`) Number of concurrent requests.

**Example Dry Run:**
```bash
node dist/scripts/importer/run.js --only characters
```

**Example Publish Run:**
```bash
node dist/scripts/importer/run.js --publish --force --skipWeapons
```

### Important Notes on Importer

*   **`--help` Warning:** The importer's CLI does not correctly process `--help` and will throw an "Unknown flag: --help" error.
*   **`mappings.json`:** This file, located at `scripts/importer/mappings.json`, is crucial for the importer's operation. Do not move or modify it unless you understand the implications.
*   **Dist-Only Importer:** The importer should only be run from its compiled JavaScript output in the `dist/` directory.

## 6. Docker-Compose Deployment

The `wuwa-api` can be deployed using Docker-Compose. The official Docker image is `ghcr.io/projektcode/wuwa-api:main` (note the lowercase).

To use with Docker-Compose:

1.  Ensure Docker and Docker-Compose are installed.
2.  Create a `docker-compose.yml` file (refer to project examples if available).
3.  Run:
    ```bash
    docker compose up -d
    ```

## 7. Configuration

Environment variables can be used to configure the API. Refer to the `.env.example` file in the project root for available options.