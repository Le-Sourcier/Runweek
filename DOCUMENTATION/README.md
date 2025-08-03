# Runweek - Documentation Hub

## Overview

Runweek is a comprehensive Node.js application designed to manage sports activities, particularly for running. It provides a robust API to handle user management, activity tracking, subscriptions, payments via Stripe, and a sponsorship system. The application uses a PostgreSQL database and is built to be deployed on Vercel.

## Project Structure

The project is organized into several key directories:

*   `index.js`: Main application entry point for local execution.
*   `api/index.js`: Entry point for Vercel serverless deployment.
*   `db.js`: Handles database initialization and Sequelize model synchronization.
*   `src/`: Contains the core application logic.
    *   `config/`: Environment-based application configuration.
    *   `controllers/`: HTTP request handlers that orchestrate business logic (e.g., `userController`, `activitiesController`).
    *   `models/`: Sequelize database model definitions (e.g., `Users`, `Plans`, `Subscriptions`).
    *   `routers/`: API route definitions using Express Router.
    *   `middlewares/`: Authentication (JWT) and other Express middleware.
    *   `events/`: Scheduled tasks (cron jobs for subscription checks).
    *   `functions/`: Specific utility functions (e.g., `sendMail`).
    *   `lib/`: Contains templates (HTML for emails) and various scripts.
*   `logs/`: Stores application logs.
*   `DOCUMENTATION/`: Contains all project documentation files.

For a more detailed explanation of the project structure, please see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

## Setup and Installation

### Prerequisites

*   Node.js (version 16.x or higher recommended)
*   npm (Node Package Manager)
*   PostgreSQL database server

### Steps

1.  **Clone the Repository:**

    ```bash
    git clone <repository-url>
    cd Runweek
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Variables:**
    *   Create a `.env.local` file in the root directory. You can copy `.env.example` if it exists.
    *   Update the placeholder values in `.env.local` with your actual configuration (database credentials, API keys, JWT secrets, etc.).
    *   Refer to [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for details on each variable.

4.  **Database Setup:**
    *   Ensure your PostgreSQL server is running.
    *   The application will attempt to synchronize the database schema on the first run.

5.  **Running the Application:**
    *   **Development Mode:**

        ```bash
        npm start
        ```

## Core Technologies

*   **Backend:** Node.js, Express.js
*   **Database:** PostgreSQL, Sequelize (ORM)
*   **Authentication:** JSON Web Tokens (JWT)
*   **Payments:** Stripe
*   **Emailing:** Nodemailer
*   **Scheduling:** node-cron
*   **File Handling:** Multer
*   **Real-time Communication:** Socket.IO
*   **API Documentation:** Swagger

## API Documentation

For detailed information about API endpoints, request/response formats, and authentication, please refer to the [API_REFERENCE.md](./API_REFERENCE.md). The project uses `swagger-jsdoc` and `swagger-ui-express` to provide interactive API documentation.

## Database Schema

The database structure, models, and their relationships are documented in [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md).

## Deployment

This application is configured for deployment on Vercel. See [DEPLOYMENT.md](./DEPLOYMENT.md) for more details.