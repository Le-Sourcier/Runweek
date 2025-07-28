# Deployment Guide

This document provides guidance on deploying the Prospect Pro application, with a focus on Vercel, as suggested by the `vercel.json` configuration file.

## Vercel Deployment

Vercel is a platform for frontend frameworks and static sites, but it also supports serverless Node.js functions, making it suitable for deploying this application.

### Configuration (`vercel.json`)

The project includes a `vercel.json` file with the following configuration:

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

*   **`version: 2`**: Specifies the Vercel configuration version.
*   **`rewrites`**: This rule is key for how the API is accessed.
    *   `"source": "/(.*)"`: Matches any incoming request path.
    *   `"destination": "/api/$1"`: Internally forwards the request to the `/api` path of the serverless function. For example, a public request to `https://<your-app-name>.vercel.app/user/login` will be routed to the `/api/user/login` handler within your application. This means your frontend application will not need to include `/api` in its requests to the backend deployed on Vercel.

### Entry Point

Vercel will typically detect the Node.js application and use `api/index.js` as the entry point for handling requests, especially given the rewrite rule and the common Vercel pattern of placing API handlers in an `/api` directory.

### Steps for Deployment:

1.  **Sign up/Log in to Vercel:** Create an account or log in at [vercel.com](https://vercel.com/).
2.  **Import Project:**
    *   You can import your Git repository (e.g., from GitHub, GitLab, Bitbucket) into Vercel.
    *   Vercel will usually auto-detect that it's a Node.js project.
3.  **Configure Project Settings:**
    *   **Build Command:** Vercel might automatically use `npm start` or a similar command. If your `package.json`'s `start` script correctly runs the server (e.g., `node api/index.js` or `node index.js` if Vercel handles the `/api` routing correctly at the function level), this should work. Often, for serverless functions, Vercel just needs to know the language (Node.js) and it handles the execution.
    *   **Output Directory:** Not typically needed for a Node.js backend unless you have a separate build step for static assets (which this project doesn't seem to have for the backend itself).
    *   **Root Directory:** Ensure this is set to the root of your project where `package.json` and `vercel.json` are located.
4.  **Environment Variables:**
    *   This is the most critical step. All necessary environment variables (as listed in `DOCUMENTATION/ENVIRONMENT_VARIABLES.md` and your `.env.local` file) must be configured in your Vercel project's settings.
    *   Navigate to your project on Vercel -> Settings -> Environment Variables.
    *   Add each variable (e.g., `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ORIGINE_URL`, `MAIL_HOST`, etc.) with its corresponding production value.
    *   **Important:** Set `NODE_ENV` to `production`.
5.  **Deploy:**
    *   Once configured, trigger a deployment. Vercel will build and deploy your application.
    *   You will receive a public URL (e.g., `https://<your-app-name>.vercel.app`).

### Considerations for Serverless Environment:

*   **Statelessness:** Serverless functions are generally stateless. Avoid storing session data or files directly on the function's filesystem if you expect them to persist across multiple invocations or scale instances.
    *   The current application uses a PostgreSQL database for user sessions (`Sessions` table), which is good for a stateless environment.
    *   File uploads (`src/uploads/`) and backups (`src/backups/`) are written to the local filesystem. In a serverless environment:
        *   Uploaded files (`temp/`, `mapped/`, `enriched/`) might only be available for the duration of the function invocation that handles them or shortly after. For persistent storage of enriched files, consider using a cloud storage service (like AWS S3, Google Cloud Storage) and updating `enrichsmentController.js` to upload there and store the URL in `EnrichJobs.link`. The current cleanup scripts (`cleanupMapped.js`) assume a persistent filesystem, which might not behave as expected long-term in all serverless environments.
        *   Database backups written to `src/backups/` will also be ephemeral. For reliable backups, consider using your database provider's backup solutions or a script that uploads the dump to cloud storage.
*   **Cold Starts:** Serverless functions can experience "cold starts" if they haven't been invoked recently, leading to a slight delay on the first request.
*   **Execution Time Limits:** Vercel has execution time limits for serverless functions (e.g., 10 seconds on the Hobby plan, up to 900 seconds on paid plans for some event types). Long-running scraping or enrichment jobs might exceed these limits.
    *   For very long tasks, consider breaking them down or using background job services that are better suited for long executions (e.g., Vercel Cron Jobs with background functions, AWS Lambda with SQS, Google Cloud Functions with Pub/Sub). The current implementation of starting scrapers directly within a request (`jobsController.js`, `enrichsmentController.js`) could be problematic for lengthy operations.

## Other Deployment Options

While Vercel is configured, you could also deploy this application to other platforms:

*   **Traditional VPS (e.g., DigitalOcean, Linode, AWS EC2):**
    *   Set up Node.js and PostgreSQL on the server.
    *   Use a process manager like PM2 to keep the application running.
    *   Configure a web server like Nginx or Apache as a reverse proxy.
    *   Manage environment variables directly on the server.
*   **Containerization (Docker):**
    *   Create a `Dockerfile` to package the application.
    *   Deploy the container to services like Docker Hub, AWS ECS, Google Kubernetes Engine, etc.
    *   This approach requires managing a Docker environment.
*   **Other PaaS (Platform as a Service) (e.g., Heroku, Render):**
    *   These platforms often have similar deployment models to Vercel, simplifying the process.
    *   You would typically connect your Git repository and configure environment variables.

Regardless of the platform, ensure all necessary environment variables are securely managed and that the `NODE_ENV` is set to `production`.
