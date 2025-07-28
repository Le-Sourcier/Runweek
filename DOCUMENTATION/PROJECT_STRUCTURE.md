# Project Structure

This document provides a detailed explanation of the Prospect Pro project's directory and file structure.

```
.
├── DOCUMENTATION/            # All project documentation files
│   ├── README.md
│   ├── PROJECT_STRUCTURE.md
│   ├── API_REFERENCE.md
│   ├── DATABASE_SCHEMA.md
│   ├── ENVIRONMENT_VARIABLES.md
│   └── DEPLOYMENT.md
├── api/
│   └── index.js            # Vercel entry point for serverless deployment
├── logs/                   # Log files (development, typically .gitignored)
│   ├── combined.log
│   └── error.log
├── node_modules/           # Project dependencies (managed by npm, .gitignored)
├── src/
│   ├── backups/            # Database backup files
│   ├── config/
│   │   └── index.js        # Application configuration (DB, CORS, etc.) based on environment
│   ├── controllers/
│   │   ├── components/     # Individual controller files
│   │   │   ├── activitiesController.js
│   │   │   ├── enrichsmentController.js (Note: "enrichsment" typo)
│   │   │   ├── jobsController.js
│   │   │   └── userController.js
│   │   └── index.js        # (Potentially an aggregator, though controllers are directly imported)
│   ├── events/
│   │   ├── cleanupEnriched.js # Placeholder for cleaning enriched files
│   │   ├── cleanupMapped.js   # Cron job to clean temporary mapped files
│   │   ├── dbDownloader.js    # Cron job for daily database backups
│   │   └── jobEvent.js        # Basic Socket.IO connection handling
│   ├── functions/
│   │   ├── components/     # Core business logic: scrapers and external API clients
│   │   │   ├── extractDataFromDomain.js
│   │   │   ├── googleMapsScraper.js
│   │   │   ├── inseeSirenScraper.js
│   │   │   ├── pappersScraper.js
│   │   │   ├── sendMail.js
│   │   │   └── yellowPageScraper.js
│   │   └── index.js        # Exports functions from components/
│   ├── middlewares/
│   │   └── authMiddleware.js # JWT authentication and rate limiting middleware
│   ├── models/
│   │   ├── components/     # Individual Sequelize model definitions
│   │   │   ├── EnrichJobs.js
│   │   │   ├── Profiles.js
│   │   │   ├── ScrapingJobs.js
│   │   │   ├── Sessions.js
│   │   │   ├── Users.js
│   │   │   └── jobResults.js
│   │   └── index.js        # Sequelize model loader and associator
│   ├── routers/
│   │   ├── components/     # Individual Express router files
│   │   │   ├── activitiesRouter.js
│   │   │   ├── businessesRouter.js (Currently unused in main router)
│   │   │   ├── enrichmentRouter.js
│   │   │   ├── jobRouter.js
│   │   │   └── userRouter.js
│   │   └── index.js        # Main Express router, aggregates component routers
│   ├── uploads/            # Directory for file uploads and processing
│   │   ├── enriched/       # Stores successfully enriched files (CSVs)
│   │   ├── mapped/         # Stores temporarily re-mapped CSVs before enrichment
│   │   └── temp/           # Temporary storage for initial uploads (managed by enrichsmentController)
│   └── utils/
│       ├── components/     # Utility modules
│       │   ├── logger.js     # Winston logger configuration
│       │   ├── serverMessage.js # Standardized API response handler
│       │   └── uploadFile.js # CSV/Excel file parsing and validation utility
│       ├── index.js        # Exports utilities from components/
│       ├── message.json    # i18n messages for serverMessage.js
│       └── parseFile.js    # (Redundant) Older file parsing logic
├── .editorconfig           # Editor configuration settings
├── .env.example            # Example environment variables file (to be created)
├── .env.local              # Local environment variables (gitignored)
├── .gitignore              # Specifies intentionally untracked files for Git
├── db.js                   # Database connection setup and Sequelize initialization/sync
├── index.js                # Main application entry point for local/Node.js execution
├── package-lock.json       # Records exact versions of dependencies
├── package.json            # Project metadata, dependencies, and scripts
├── scrapTest.js            # Developer utility script for testing domain scraping
├── test.js                 # Developer utility script for testing enrichment/CSV functions
└── vercel.json             # Vercel deployment configuration
```

## Key Files and Directories Explained

* **`index.js`**: The primary entry point when running the application directly with Node.js (e.g., `npm start`). It sets up the Express server, middleware, Socket.IO, routes, and starts listening for requests.
* **`api/index.js`**: This file is structured very similarly to `index.js` and serves as the entry point for Vercel serverless deployments. The `vercel.json` configuration typically directs requests to this handler.
* **`db.js`**: Initializes the Sequelize ORM, connects to the PostgreSQL database (creating it if it doesn't exist during initial setup), and synchronizes all defined models with the database schema.
* **`src/config/index.js`**: Provides environment-specific configurations (e.g., database credentials, CORS settings). It loads settings based on the `NODE_ENV` environment variable.
* **`src/controllers/`**: Contains the request handlers (controller functions) for different API resources. These controllers take incoming requests, interact with services/models, and use utility functions (like `serverMessage`) to send responses.
  * `userController.js`: Handles user registration, login, profile updates, etc.
  * `jobsController.js`: Manages scraping jobs.
  * `enrichsmentController.js`: Manages data enrichment jobs from uploaded files.
  * `activitiesController.js`: Handles fetching user activities and metrics.
* **`src/functions/`**: Houses the core business logic, especially for external interactions:
  * `googleMapsScraper.js`, `yellowPageScraper.js`: Use Puppeteer to scrape data from Google Maps and PagesJaunes.
  * `pappersScraper.js`, `inseeSirenScraper.js`: API clients for Pappers and INSEE Sirene services.
  * `extractDataFromDomain.js`: Scrapes contact information from arbitrary websites.
  * `sendMail.js`: Utility for sending emails via SMTP (e.g., for verification, password resets).
* **`src/events/`**:
  * `dbDownloader.js`: A cron job that performs daily database backups using `pg_dump` and cleans up old backups.
  * `cleanupMapped.js`: A cron job to delete temporary files from the `src/uploads/mapped/` directory once associated enrichment jobs are complete.
  * `jobEvent.js`: Handles basic Socket.IO connection events (connect, disconnect). Actual job status updates via Socket.IO are emitted from controllers.
* **`src/middlewares/authMiddleware.js`**:
  * `authorize`: JWT-based authentication middleware to protect routes. It verifies tokens and attaches user information to requests.
  * `loginLimiter`: Rate-limiting middleware for login and password recovery routes to prevent brute-force attacks.
* **`src/models/`**: Defines the database schema using Sequelize.
  * `index.js` in this directory loads all model files from `components/`, establishes their associations (relationships), and exports them along with the Sequelize instance.
  * Model files like `Users.js`, `ScrapingJobs.js`, etc., define table structures, fields, data types, and relationships.
* **`src/routers/`**: Contains Express router definitions.
  * `index.js` is the main router that aggregates other specific routers from the `components/` subdirectory (e.g., `userRouter.js`, `jobRouter.js`). These specific routers define the API endpoints and link them to controller functions.
* **`src/utils/`**: Provides shared utility functions.
  * `logger.js`: Configures Winston for application-wide logging.
  * `serverMessage.js`: A centralized function to create standardized JSON responses for the API, used by controllers.
  * `message.json`: Contains message strings (EN/FR) for `serverMessage.js`, supporting i18n for API responses.
  * `uploadFile.js`: Utilities for validating and parsing uploaded CSV and Excel files.
* **`src/uploads/`**: This directory and its subdirectories (`enriched/`, `mapped/`, `temp/`) are used to store files related to the enrichment process.
  * `temp/`: Initial storage for files uploaded via `multer`.
  * `mapped/`: Stores CSV files after their columns have been re-mapped according to user specifications, before enrichment.
  * `enriched/`: Stores the final CSV files after data enrichment.
* **`src/backups/`**: Stores SQL dump files generated by the `dbDownloader.js` cron job.
* **`.env.local` & `.env.example`**: Manage environment-specific variables. `.env.local` (gitignored) holds actual development secrets, while `.env.example` serves as a template.
* **`package.json`**: Defines project metadata, scripts (like `start`), and lists all dependencies.
* **`vercel.json`**: Configuration file for deploying the application to Vercel, including rewrite rules.
* **`scrapTest.js`, `test.js`**: Standalone scripts used by developers for manual testing of specific scraping or enrichment functionalities. They are not part of the automated test suite.
