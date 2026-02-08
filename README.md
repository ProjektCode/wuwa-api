# WuwaAPI

A Fastify REST API, assets-driven, designed to serve Wuthering Waves data.

## Quickstart

This section provides a quick guide to get the WuwaAPI up and running.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The API will be accessible at `http://localhost:3000` (or configured port).
3.  **Start Production Server:**
    ```bash
    npm start
    ```
4.  **Importer Usage (Dry Run):**
    To run the importer without publishing data, which writes staged data to `.local/import-output`:
    ```bash
    node dist/scripts/importer/run.js
    ```
5.  **Importer Usage (Publish):**
    To publish data directly to the API's data store:
    ```bash
    node dist/scripts/importer/run.js --publish
    ```

## Badges

*(Add relevant badges here, e.g., build status, license, etc.)*

## Further Documentation

*   **Setup & Installation:** See `docs/SETUP.md` for detailed installation and configuration steps.
*   **Contributing:** Refer to `docs/CONTRIBUTING.md` for guidelines on how to contribute to this project.
*   **API Reference:** Detailed API endpoint descriptions are available in `docs/API.md`.
*   **Version History:** Check `CHANGELOG.md` for a record of all changes.