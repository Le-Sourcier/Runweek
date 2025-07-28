# Contributing to Prospect Pro

Thank you for considering contributing to Prospect Pro! Your help is appreciated. Here are some guidelines to follow.

## How to Contribute

* **Reporting Bugs:** If you find a bug, please open an issue on the project's issue tracker. Include as much detail as possible:
  * Steps to reproduce the bug.
  * Expected behavior.
  * Actual behavior.
  * Any error messages or logs.
  * Your environment (Node.js version, OS, browser if applicable).
* **Suggesting Enhancements:** If you have an idea for a new feature or an improvement to an existing one, please open an issue to discuss it. This allows for feedback before significant work is done.
* **Pull Requests:**
    1. Fork the repository.
    2. Create a new branch for your feature or bugfix (e.g., `feature/new-scraper` or `fix/login-bug`).
    3. Make your changes.
    4. Ensure your code adheres to any existing coding style (see below).
    5. If you add new functionality, consider adding or updating documentation.
    6. Test your changes thoroughly.
    7. Commit your changes with clear and descriptive commit messages.
    8. Push your branch to your fork.
    9. Open a pull request against the main repository's `main` or `develop` branch (as appropriate).
    10. Provide a clear description of your changes in the pull request.

## Coding Style and Conventions

While there isn't a strict linting setup enforced in the current project structure (e.g., ESLint or Prettier configuration files are not present), please try to follow these general guidelines:

* **Consistency:** Try to match the coding style of the existing codebase.
* **Naming:**
  * Use camelCase for variables and functions (e.g., `myVariable`, `calculateValue`).
  * Use PascalCase for classes and constructor functions (e.g., `UserSession`, `ScrapingJob`).
  * Use UPPER_SNAKE_CASE for constants (e.g., `MAX_RETRIES`).
* **Comments:** Add comments to explain complex logic or non-obvious code sections.
* **Modularity:** Keep functions and modules focused on a single responsibility.
* **Error Handling:** Ensure proper error handling is in place, especially for asynchronous operations and API interactions. Use the provided `serverMessage` utility for API responses where appropriate.
* **Dependencies:** If adding new dependencies, ensure they are necessary and well-maintained. Update `package.json` accordingly.

## Code Structure

Familiarize yourself with the existing project structure (see `DOCUMENTATION/PROJECT_STRUCTURE.md`). New features should generally follow the established patterns:

* API endpoints are defined in `src/routers/`.
* Request handling logic is in `src/controllers/`.
* Core business logic, scraping, and external API calls are in `src/functions/`.
* Database models are in `src/models/`.
* Middleware is in `src/middlewares/`.
* Shared utilities are in `src/utils/`.

## Commit Messages

* Use clear and concise commit messages.
* A good practice is to use the imperative mood (e.g., "Fix login bug" rather than "Fixed login bug" or "Fixes login bug").
* Reference issue numbers if applicable (e.g., "Fix: Resolve issue #123 related to user registration").

## Questions

If you have any questions, feel free to open an issue or reach out to the project maintainers.

Thank you for contributing!
