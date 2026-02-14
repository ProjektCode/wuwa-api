# Setting Up Your WuwaAPI Environment

This comprehensive guide will walk you through setting up and running the WuwaAPI. If you're looking for a quick start, please refer to the main `README.md` file.

## 1. Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js (LTS version) and npm (Node Package Manager):** Essential for running the API.
*   **Git:** For cloning the repository.
*   **Docker and Docker Compose (Optional):** If you plan to deploy or run the API using Docker containers.

## 2. Clone the Repository and Install Dependencies

First, clone the WuwaAPI repository and install its required dependencies:

```bash
git clone <repository-url> # Replace <repository-url> with the actual repository URL
cd wuwa-api
npm install
```

## 3. Configuration

The WuwaAPI is configured using environment variables. You can create a `.env` file in the `wuwa-api` directory based on the `.env.example` template to customize settings.

Key environment variables include:

*   `PORT`: The port on which the API will listen (default: `3000`).
*   `HOST`: The host address the API will bind to (default: `0.0.0.0`).
*   `DATA_ROOT`: Specifies the directory where the API finds its JSON data files (default: `assets/data`).
*   `IMAGES_ROOT`: Specifies the directory for optimized WebP image assets (default: `assets/images`).
*   **Rate Limiting:** Control API request limits with variables like `RATE_LIMIT_WINDOW`, `RATE_LIMIT_LIST_MAX`, `RATE_LIMIT_DETAIL_MAX`, `RATE_LIMIT_IMAGE_MAX`, and `RATE_LIMIT_DOCS_MAX`.

## 4. Development Workflow

To develop and test the API locally:

*   **Static Checks:**
    ```bash
    npm run typecheck
    ```
    Runs TypeScript static analysis to catch type-related issues.
*   **Run Tests:**
    ```bash
    npm test
    ```
    Executes unit and integration tests to ensure functionality.
*   **Start Development Server:**
    ```bash
    npm run dev
    ```
    Starts the Fastify server in watch mode, automatically restarting on code changes. The API will be available at `http://localhost:3000` by default, configurable via environment variables.

## 5. Production Deployment (Node.js)

For a production environment running directly with Node.js:

1.  **Build the Project:**
    ```bash
    npm run build
    ```
    This compiles the TypeScript code into JavaScript.
2.  **Start the Server:**
    ```bash
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