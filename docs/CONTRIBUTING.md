# Contributing to WuwaAPI

We welcome contributions to the WuwaAPI project! Please follow these guidelines to ensure a smooth collaboration.

## How to Contribute

1.  **Fork the Repository:**
    Start by forking the `WuwaAPI` repository to your GitHub account.

2.  **Clone Your Fork:**
    Clone your forked repository to your local machine:
    ```bash
    git clone https://github.com/YOUR_USERNAME/WuwaAPI.git
    cd WuwaAPI
    ```

3.  **Create a New Branch:**
    Create a new branch for your feature or bug fix:
    ```bash
    git checkout -b feature/your-feature-name
    ```
    or
    ```bash
    git checkout -b bugfix/your-bug-fix-name
    ```

4.  **Make Your Changes:**
    Implement your changes, adhering to the project's coding style and conventions.

    *   **Code Style:** We use ESLint and Prettier. Ensure your code passes linting checks (`npm run lint`).
    *   **Testing:** Write unit and/or integration tests for your changes. Ensure all existing tests pass (`npm test`).
    *   **Documentation:** Update relevant documentation (`README.md`, `docs/`, etc.) for any new features or changes.

5.  **Test Your Changes:**
    Before committing, thoroughly test your changes to ensure they work as expected and don't introduce any regressions.

6.  **Commit Your Changes:**
    Commit your changes with a clear and concise commit message. Follow conventional commit guidelines if possible (e.g., `feat: add new endpoint`, `fix: resolve character bug`).

    ```bash
    git commit -m "feat: short description of your changes"
    ```

7.  **Push to Your Fork:**
    ```bash
    git push origin feature/your-feature-name
    ```

8.  **Create a Pull Request:**
    *   Go to the original `WuwaAPI` repository on GitHub.
    *   You should see a prompt to create a pull request from your recently pushed branch.
    *   Provide a detailed description of your changes, why they are necessary, and any relevant context.
    *   Link to any related issues.

## Importer Contributions

If you are contributing to the importer:

*   Be mindful of the `--help` warning (it doesn't work as expected).
*   Do not move `scripts/importer/mappings.json`.
*   Ensure your changes are compatible with the `dist`-only execution of the importer.

## Code of Conduct

Please adhere to the project's Code of Conduct.

Thank you for contributing!