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

## 5. Docker-Compose Deployment

The `wuwa-api` can be deployed using Docker-Compose. The official Docker image is `ghcr.io/projektcode/wuwa-api:main` (note the lowercase).

To use with Docker-Compose:

1.  Ensure Docker and Docker-Compose are installed.
2.  Create a `docker-compose.yml` file (refer to project examples if available).
3.  Run:
    ```bash
    docker compose up -d
    ```

## 6. Configuration

Environment variables can be used to configure the API. Refer to the `.env.example` file in the project root for available options.