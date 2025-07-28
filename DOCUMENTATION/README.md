# Prospect Pro - Documentation Hub

## Overview

Prospect Pro is a Node.js application designed for web scraping, data enrichment, and prospecting. It provides an API to manage users, initiate scraping jobs (e.g., from Google Maps, Pappers), enrich uploaded CSV data with company information, and track job progress. The system uses a PostgreSQL database and leverages Puppeteer for scraping tasks.

## Project Structure

The project is organized into several key directories:

* `index.js`: Main application entry point for local execution.
* `api/index.js`: Entry point for Vercel serverless deployment.
* `db.js`: Handles database initialization and Sequelize model synchronization.
* `src/`: Contains the core application logic.
  * `config/`: Environment-based application configuration.
  * `controllers/`: HTTP request handlers that orchestrate business logic.
  * `functions/`: Core scraping logic and interactions with external APIs (Google, Pappers, etc.).
  * `events/`: Scheduled tasks (cron jobs for cleanup, backups) and event emitters.
  * `middlewares/`: Authentication (JWT) and other Express middleware.
  * `models/`: Sequelize database model definitions and associations.
  * `routers/`: API route definitions using Express Router.
  * `utils/`: Helper utilities like logging, standardized API responses, and file parsing.
  * `uploads/`: Default directory for storing uploaded and processed files.
  * `backups/`: Stores database backups.
* `logs/` (or `logsDir/` in production): Stores application logs.
* `DOCUMENTATION/`: Contains all project documentation files.

For a more detailed explanation of the project structure, please see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

## Setup and Installation

### Prerequisites

* Node.js (version 16.x or higher recommended)
* npm (Node Package Manager)
* PostgreSQL database server

### Steps

1. **Clone the Repository:**

    ```bash
    git clone <repository-url>
    cd prospect_pro
    ```

2. **Install Dependencies:**

    ```bash
    npm install
    ```

3. **Environment Variables:**
    * Create a `.env.local` file in the root directory by copying `.env.example`.
    * Update the placeholder values in `.env.local` with your actual configuration (database credentials, API keys, JWT secrets, etc.).
    * Refer to [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for details on each variable.

4. **Database Setup:**
    * Ensure your PostgreSQL server is running.
    * The application will attempt to create the database specified in your environment variables if it doesn't exist, upon the first run.

5. **Running the Application:**
    * **Development Mode:**

        ```bash
        npm start
        ```

        This typically uses settings from the `development` block in `src/config/index.js` and loads variables from `.env.local`.
    * **Production Mode:**
        Set `NODE_ENV=production` in your environment and ensure all production-specific environment variables are correctly set.

        ```bash
        NODE_ENV=production npm start
        ```

## Core Technologies

* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL, Sequelize (ORM)
* **Web Scraping:** Puppeteer (for Google Maps, PagesJaunes), Cheerio, node-fetch
* **External APIs:** Pappers API, INSEE Sirene API
* **Authentication:** JSON Web Tokens (JWT)
* **Real-time Communication:** Socket.IO (for job status updates), Server-Sent Events (SSE)
* **File Handling:** Multer (for uploads), csv-parser, xlsx
* **Scheduling:** node-cron
* **Logging:** Winston

## API Documentation

For detailed information about API endpoints, request/response formats, and authentication, please refer to the [API_REFERENCE.md](./API_REFERENCE.md).

## Database Schema

The database structure, models, and their relationships are documented in [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md).

## Deployment

This application is configured for deployment on Vercel. See [DEPLOYMENT.md](./DEPLOYMENT.md) for more details.

## Developer Utilities/Testing

The project includes manual utility scripts for testing specific functionalities:

* `scrapTest.js`: For testing website contact information scraping.
* `test.js`: For testing data enrichment logic and CSV utilities.
These are not part of an automated test suite but can be run directly with Node.js.

## Contributing

(Optional: Add a link to `CONTRIBUTING.md` if created)
For guidelines on contributing to the project, please see [CONTRIBUTING.md](./CONTRIBUTING.md).
