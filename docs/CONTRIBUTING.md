# Contributing to WuwaAPI

We truly appreciate your interest in contributing to the WuwaAPI project! To ensure a smooth and effective collaboration, please take a moment to review these guidelines.

## How to Contribute

Follow these steps to make your contribution:

1.  **Fork the Repository:**
    Begin by forking the `WuwaAPI` repository to your personal GitHub account. This creates a copy of the project that you can freely modify.

2.  **Clone Your Fork:**
    Next, clone your forked repository to your local machine. Remember to replace `YOUR_USERNAME` with your actual GitHub username.
    ```bash
    git clone https://github.com/YOUR_USERNAME/WuwaAPI.git
    cd wuwa-api
    ```

3.  **Create a New Branch:**
    It's good practice to create a new branch for each feature or bug fix you're working on. This keeps your changes organized.
    ```bash
    git checkout -b feature/your-feature-name
    ```
    or for bug fixes:
    ```bash
    git checkout -b bugfix/your-bug-fix-name
    ```

4.  **Make Your Changes:**
    Implement your changes, always striving to adhere to the project's coding style and conventions.

    *   **Code Style:** We utilize ESLint and Prettier for code formatting and style enforcement. Please ensure your code passes all linting checks by running `npm run lint`.
    *   **Testing:** For any new features or bug fixes, please write appropriate unit and/or integration tests. Ensure all existing tests pass by running `npm test`.
    *   **Documentation:** For any new features or significant changes, remember to update relevant documentation files (e.g., `README.md`, files within `docs/`).

5.  **Test Your Changes:**
    Before committing, thoroughly test your changes to ensure they work as expected and don't introduce any regressions.

6.  **Commit Your Changes:**
    Commit your changes with a clear, concise, and descriptive commit message. If possible, follow conventional commit guidelines (e.g., `feat: add new endpoint`, `fix: resolve character bug`).
    ```bash
    git commit -m "feat: short description of your changes"
    ```

7.  **Push to Your Fork:**
    Once your changes are committed, push them to your forked repository on GitHub:
    ```bash
    git push origin feature/your-feature-name
    ```

8.  **Create a Pull Request:**
    *   Navigate to the original `WuwaAPI` repository on GitHub.
    *   You should see a prompt to create a pull request from your recently pushed branch.
    *   Provide a detailed description of your changes, explaining their purpose, why they are necessary, and any relevant context.
    *   If your changes address an existing issue, please link to it in your pull request description.

## Code of Conduct

Please adhere to the project's Code of Conduct, which outlines our expectations for respectful and collaborative behavior.

Thank you for contributing! Your efforts help make WuwaAPI better for everyone.
