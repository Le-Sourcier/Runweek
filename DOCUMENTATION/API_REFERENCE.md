# API Reference

## Introduction

Welcome to the Prospect Pro API documentation. This API allows you to interact with the Prospect Pro application to manage users, scraping jobs, data enrichment, and more.

**Base URL:**
The API is typically accessed via the base URL provided by your deployment (e.g., `http://localhost:3000` for local development, or your Vercel deployment URL). All endpoints listed below are relative to this base URL. Note that due to Vercel's rewrite rule (`"source": "/(.*)", "destination": "/api/$1"`), the `/api` prefix is handled internally and should not be included in public request URLs when deployed on Vercel. For local development, include `/api`. Example: `/api/user/login` locally, `/user/login` on Vercel. This documentation will use the paths as defined in the routers (e.g. `/api/user/login`).

**Authentication:**
Most API endpoints require authentication using a JSON Web Token (JWT).

1. Obtain an `accessToken` by calling the `POST /api/user/login` endpoint.
2. Include this token in the `Authorization` header for subsequent requests:
    `Authorization: Bearer <your_access_token>`

**Common Response Format:**
The API uses a standardized JSON response format facilitated by the `serverMessage` utility:

```json
{
  "error": false, // boolean: true if an error occurred, false otherwise
  "status": 200,  // number: HTTP status code
  "message": "LOGIN_SUCCESS", // string: A key representing the message (see src/utils/message.json for translations)
  "data": {}      // object|array: The actual data payload, if any
}
```

**Rate Limiting:**
Certain sensitive endpoints, such as login (`POST /api/user/login`) and password recovery initiation (`PUT /api/user/forget-password`), are rate-limited to prevent abuse. If the limit (typically 5 attempts per 15 minutes per IP) is exceeded, the API will respond with a `429 Too Many Requests` status and a "TOO_MANY_ATTEMPTS" message.

## User & Authentication Endpoints

Base Path: `/api/user`

---

### Register User

* **Endpoint:** `POST /register`
* **Description:** Creates a new user account and associated profile. Sends a verification email.
* **Auth:** None
* **Request Body:** `application/json`

    ```json
    {
        "fname": "John",
        "lname": "Doe",
        "company": "JD Inc.", // Optional
        "phone": "1234567890", // Must be unique
        "web_site": "https://johndoe.com", // Optional
        "email": "john.doe@example.com", // Must be unique
        "password": "securePassword123"
    }
    ```

* **Success Response (201 - Created):**

    ```json
    {
        "error": false,
        "status": 201,
        "message": "ACCOUNT_CREATED",
        "data": {
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
    }
    ```

* **Error Responses:**
  * `400 Bad Request` ("ACCOUNT_ALREADY_EXISTS", "PHONE_ALREADY_EXISTS", "REQUIRED_FIELDS_MISSING")
  * `500 Internal Server Error` ("SERVER_ERROR", "EMAIL_SINDING_FAILED")

---

### Verify Email

* **Endpoint:** `POST /verify-mail`
* **Description:** Verifies a user's email address using a token sent during registration or resend.
* **Auth:** None
* **Request Body:** `application/json`

    ```json
    {
        "token": "verification_token_from_email_link"
    }
    ```

* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "ACCOUNT_VALIDATED_SUCCESS",
        "data": []
    }
    ```

* **Error Responses:**
  * `401 Unauthorized` ("INVALID_OR_EXPIRED_TOKEN")
  * `500 Internal Server Error` ("SERVER_ERROR")

---

### Login User

* **Endpoint:** `POST /login`
* **Description:** Authenticates a user and returns JWT access and refresh tokens. Sets a `refreshToken` cookie.
* **Auth:** None (Rate-limited)
* **Request Body:** `application/json`

    ```json
    {
        "email": "john.doe@example.com",
        "password": "securePassword123"
    }
    ```

* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "LOGIN_SUCCESS",
        "data": {
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
    }
    ```

* **Error Responses:**
  * `404 Not Found` ("PROFILE_NOT_FOUND")
  * `400 Bad Request` ("INVALID_CREDENTIALS")
  * `401 Unauthorized` ("ACCOUNT_UNVERIFIED", "ACCOUNT_BLOKED", "ACCOUNT_ARCHIVED")
  * `429 Too Many Requests` ("TOO_MANY_ATTEMPTS")
  * `500 Internal Server Error` ("SERVER_ERROR")

---

### Get Current User

* **Endpoint:** `GET /me`
* **Description:** Retrieves the profile information of the currently authenticated user.
* **Auth:** Bearer Token
* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "SUCCESS",
        "data": {
            "id": "user-uuid",
            "email": "john.doe@example.com",
            "fname": "John",
            "lname": "Doe",
            "phone": "1234567890"
        }
    }
    ```

* **Error Responses:**
  * `401 Unauthorized` ("FORBIDDEN_RESOURCE", "TOKEN_EXPIRED", "TOKEN_INVALID")
  * `404 Not Found` ("ACCOUNT_NOT_FOUND")
  * `500 Internal Server Error` ("SERVER_ERROR")

---

### Refresh Access Token

* **Endpoint:** `POST /refresh`
* **Description:** Issues a new JWT access token and refresh token using a valid refresh token.
* **Auth:** None (expects `refreshToken` in body)
* **Request Body:** `application/json`

    ```json
    {
        "refreshToken": "valid_refresh_token_here"
    }
    ```

* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "SUCCESS",
        "data": {
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
    }
    ```

* **Error Responses:**
  * `401 Unauthorized` ("UNAUTHORIZED_ACCESS", "TOKEN_EXPIRED", "TOKEN_INVALID")
  * `404 Not Found` ("PROFILE_NOT_FOUND")
  * `500 Internal Server Error` ("SERVER_ERROR")

---

### Update User Profile

* **Endpoint:** `PUT /update`
* **Description:** Updates the profile data of the authenticated user.
* **Auth:** Bearer Token
* **Request Body:** `application/json` (Include fields to update)

    ```json
    {
        "fname": "Johnny",
        "lname": "Doer",
        "phone": "0987654321", // Optional, must be unique if provided
        "address": "123 Main St", // Optional
        "bio": "Software Developer" // Optional
    }
    ```

* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "PROFILE_UPDATED",
        "data": []
    }
    ```

* **Error Responses:**
  * `404 Not Found` ("PROFILE_NOT_FOUND")
  * `500 Internal Server Error` ("SERVER_ERROR")

---

### Resend Verification Email

* **Endpoint:** `POST /resend-mail`
* **Description:** Resends the account verification email to the user.
* **Auth:** None
* **Request Body:** `application/json`

    ```json
    {
        "email": "john.doe@example.com"
    }
    ```

* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "EMAIL_SINDING_SUCCESS",
        "data": []
    }
    ```

* **Error Responses:**
  * `404 Not Found` ("ACCOUNT_NOT_FOUND")
  * `401 Unauthorized` ("ACCOUNT_ALREADY_VERIFIED")
  * `500 Internal Server Error` ("SERVER_ERROR", "EMAIL_SINDING_FAILED")

---

### Change Password (While Logged In)

* **Endpoint:** `PUT /reset-password` (Note: This path is also used for forgotten password flow, but the controller logic `updatePassword` handles this scenario based on context or how it's called internally if `req.user` is present. The router has a single `PUT /reset-password` which calls `ctr.resetPassword`. The `userController` has an `updatePassword` method, which is not directly exposed via a distinct route name but its logic is for logged-in users. This section assumes the intent for a logged-in password change.)
* **Description:** Allows an authenticated user to change their password by providing their old and new passwords.
* **Auth:** Bearer Token
* **Request Body:** `application/json`

    ```json
    {
        "oldPassword": "currentSecurePassword123",
        "newPassword": "newStrongPassword456"
    }
    ```

* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "PASSWORD_RESET_SUCCESS", // Or a more specific "PASSWORD_CHANGED"
        "data": []
    }
    ```

* **Error Responses:**
  * `400 Bad Request` ("OLD_PASSWORD_INVALID")
  * `500 Internal Server Error` ("SERVER_ERROR")

---

### Initiate Forgot Password

* **Endpoint:** `PUT /forget-password`
* **Description:** Initiates the password recovery process. Sends an email with a password reset token/link.
* **Auth:** None (Rate-limited)
* **Request Body:** `application/json`

    ```json
    {
        "email": "john.doe@example.com"
    }
    ```

* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "EMAIL_SINDING_SUCCESS",
        "data": []
    }
    ```

* **Error Responses:**
  * `404 Not Found` ("PROFILE_NOT_FOUND")
  * `429 Too Many Requests` ("TOO_MANY_ATTEMPTS")
  * `500 Internal Server Error` ("SERVER_ERROR", "EMAIL_SINDING_FAILED")

---

### Verify Password Reset Token

* **Endpoint:** `POST /verify-token`
* **Description:** Verifies the validity of a password reset token.
* **Auth:** None
* **Request Body:** `application/json`

    ```json
    {
        "token": "password_reset_token_from_email"
    }
    ```

* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "NEXT_STEP", // Indicates token is valid
        "data": {
            "firstName": "John" // User's first name
        }
    }
    ```

* **Error Responses:**
  * `401 Unauthorized` ("INVALID_OR_EXPIRED_TOKEN")
  * `500 Internal Server Error` ("SERVER_ERROR")

---

### Reset Password (After Forgot Password)

* **Endpoint:** `PUT /reset-password`
* **Description:** Sets a new password for the user using a valid password reset token.
* **Auth:** None
* **Request Body:** `application/json`

    ```json
    {
        "token": "password_reset_token_from_email",
        "password": "newStrongPassword456"
    }
    ```

* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "PASSWORD_RECOVERED_SUCCESS",
        "data": []
    }
    ```

* **Error Responses:**
  * `401 Unauthorized` ("INVALID_OR_EXPIRED_TOKEN")
  * `500 Internal Server Error` ("SERVER_ERROR")

---

### Delete User (Admin)

* **Endpoint:** `DELETE /delete/:id`
* **Description:** Deletes a user account by their ID. (Requires Admin privileges, though role check not explicitly visible in controller, assumed via `authorize` or further up).
* **Auth:** Bearer Token (Admin)
* **Path Parameters:**
  * `id` (string, UUID): The ID of the user to delete.
* **Success Response (200 - OK):**

    ```json
    {
        "message": "User deleted successfully." // Note: This response doesn't follow the standard serverMessage format.
    }
    ```

* **Error Responses:**
  * `404 Not Found` (`{ "error": "User not found" }`)
  * `500 Internal Server Error` (`{ "error": "Error deleting user" }`)

---

### Get All Users (Admin)

* **Endpoint:** `GET /all`
* **Description:** Retrieves a list of all users with their profiles and sessions. (Admin)
* **Auth:** Bearer Token (Admin)
* **Success Response (200 - OK):**

    ```json
    // Array of user objects, e.g.:
    [
        {
            "id": "user-uuid-1",
            "email": "admin@example.com",
            // ... other user fields ...
            "profile": { /* ... profile data ... */ },
            "sessions": [ /* ... session data ... */ ]
        }
    ]
    ```

* **Error Responses:**
  * `500 Internal Server Error` (`{ "error": "Unable to fetch users" }`)

---

### Get User by ID (Admin)

* **Endpoint:** `GET /user/:id`
* **Description:** Retrieves a specific user by ID with their profile and sessions. (Admin)
* **Auth:** Bearer Token (Admin)
* **Path Parameters:**
  * `id` (string, UUID): The ID of the user to retrieve.
* **Success Response (200 - OK):**

    ```json
    {
        "id": "user-uuid-1",
        "email": "admin@example.com",
        // ... other user fields ...
        "profile": { /* ... profile data ... */ },
        "sessions": [ /* ... session data ... */ ]
    }
    ```

* **Error Responses:**
  * `404 Not Found` (`{ "error": "User not found" }`)
  * `500 Internal Server Error` (`{ "error": "Failed to get user" }`)

## Scraping Job Endpoints

Base Path: `/api/job`
Authentication: Bearer Token required for all `/api/job` endpoints (as `userRouter` which uses `authorize` is mounted on `/api`, and `jobRouter` itself doesn't specify `authorize` but it's applied at a higher level or implicitly for non-user routes). Assuming `authorize` middleware applies.

---

### Create Scraping Job

* **Endpoint:** `POST /create`
* **Description:** Creates a new scraping job.
* **Request Body:** `application/json`

    ```json
    {
        "user_id": "user-uuid",
        "source": "google-maps", // e.g., "google-maps", "pappers"
        "query": "restaurants",
        "location": "Paris", // Optional
        "results": 0, // Typically initialized to 0, updated by scraper
        "limite": 50 // Optional limit for number of results to scrape
    }
    ```

* **Success Response (201 - Created):**

    ```json
    {
        "error": false,
        "status": 201,
        "message": "JOB_CREATED",
        "data": {
            "id": "job-uuid",
            "source": "google-maps",
            "query": "restaurants",
            "location": "Paris",
            "results": 0,
            "status": "pending", // Initial status
            "createdAt": "2023-10-27T10:00:00.000Z"
        }
    }
    ```

* **Error Responses:**
  * `404 Not Found` ("USER_NOT_FOUND")
  * `500 Internal Server Error` ("SERVER_ERROR")

---

### Get All Scraping Jobs for User

* **Endpoint:** `GET /all/:id`
* **Description:** Retrieves all scraping jobs associated with a specific user ID.
* **Path Parameters:**
  * `id` (string, UUID): User ID.
* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "SUCCESS",
        "data": [
            {
                "id": "job-uuid-1",
                "name": "restaurants", // query field
                "source": "google-maps",
                "location": "Paris",
                "status": "completed",
                "date": "Fri Oct 2023 10:00" // Formatted createdAt
            }
            // ... other jobs
        ]
    }
    ```

* **Error Responses:**
  * `401 Unauthorized` ("UNAUTHORIZED_ACCESS") (if user not found or not authorized)
  * `404 Not Found` ("NO_JOBS_FOUND")
  * `500 Internal Server Error` ("SERVER_ERROR")

---

### Get Scraping Job List by User ID

* **Endpoint:** `GET /get/:id`
* **Description:** Retrieves all scraping jobs created by a specific user. (Functionally similar to `/all/:id`).
* **Path Parameters:**
  * `id` (string, UUID): User ID.
* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "JOB_FETCHED",
        "data": [
            {
                "id": "job-uuid-1",
                "user_id": "user-uuid",
                "source": "google-maps",
                "query": "restaurants",
                // ... other job fields ...
                "createdAt": "Fri Oct 2023 10:00" // Formatted
            }
        ]
    }
    ```

* **Error Responses:**
  * `404 Not Found` ("JOB_NOT_FOUND")
  * `500 Internal Server Error` ("FAILED_TO_GET_JOB", "SERVER_ERROR")

---

### Get Single Scraping Job Details (Results)

* **Endpoint:** `GET /single/:id`
* **Description:** Retrieves the detailed results of a specific scraping job. This fetches from `scraping_job_results` table.
* **Path Parameters:**
  * `id` (string, UUID): Job ID.
* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "JOB_FETCHED",
        "data": {
            "id": "job-uuid", // This is the PK of job_results, should match scraping_jobs id
            "result": [ /* array of scraped items */ ]
        }
    }
    ```

* **Error Responses:**
  * `404 Not Found` ("JOB_NOT_FOUND")
  * `500 Internal Server Error` ("FAILED_TO_GET_JOB")

---

### Start/Update Scraping Job

* **Endpoint:** `PUT /update/:id`
* **Description:** Updates a scraping job. If `status` is set to "running", it triggers the scraping process asynchronously.
* **Path Parameters:**
  * `id` (string, UUID): Job ID.
* **Request Body:** `application/json`

    ```json
    {
        "status": "running" // Or other fields like "limite" if allowed
        // query, location, source, results are preserved and not updatable here
    }
    ```

* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "JOB_UPDATED",
        "data": { /* updated job object from scraping_jobs table */ }
    }
    ```

    (The actual scraping happens in the background. Client should listen to Socket.IO or SSE for progress).
* **Error Responses:**
  * `404 Not Found` ("JOB_NOT_FOUND")
  * `500 Internal Server Error` ("SERVER_ERROR")

---

### Delete Scraping Job

* **Endpoint:** `DELETE /delete/:id`
* **Description:** Deletes a scraping job.
* **Path Parameters:**
  * `id` (string, UUID): Job ID.
* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "JOB_DELETED",
        "data": []
    }
    ```

* **Error Responses:**
  * `404 Not Found` ("JOB_NOT_FOUND")
  * `500 Internal Server Error` ("SERVER_ERROR")

---

### Server-Sent Events for Job Updates

* **Endpoint:** `GET /:id/events`
* **Description:** Establishes a Server-Sent Events (SSE) connection to receive real-time updates for a specific scraping job.
* **Path Parameters:**
  * `id` (string, UUID): Job ID.
* **Response:** `text/event-stream`

    ```
    data: {"status":"running","results":10}

    data: {"status":"running","results":20}

    data: {"status":"completed","results":50}
    ```

* **Note:** The client should handle the SSE connection appropriately.

## Enrichment Job Endpoints

Base Path: `/api/job/enrich` (mounted under `/api/job`)
Authentication: Bearer Token required.

---

### Create Enrichment Job (Upload & Map File)

* **Endpoint:** `POST /mapping`
* **Description:** Uploads a CSV/Excel file, defines column mapping and enrichment sources, and starts an enrichment job.
* **Request Type:** `multipart/form-data`
  * `file`: The CSV or Excel file to enrich.
  * `meta`: A JSON string containing metadata.

        ```json
        // Example for 'meta' field (as a JSON string)
        {
            "user_id": "user-uuid",
            "mapping": {
                "siret_number": "SIRET", // newKey (from model) : oldKey (from CSV header)
                "nom_entreprise": "CompanyName",
                "address": "FullAddress"
            },
            "sources": ["pappers", "google"], // Enrichment sources to use
            "expected_columns": ["siret", "company_name", "address"] // Optional, for validation
        }
        ```

* **Success Response (201 - Created):**

    ```json
    {
        "error": false,
        "status": 201,
        "message": "ENRICH_CREATED",
        "data": {
            "id": "enrich-job-uuid",
            "name": "original_filename_without_extension",
            "status": "in_progress", // Initial status, updates via Socket.IO
            "records": 150, // Total records in the file
            "enriched": 0,  // Enriched count, updates via Socket.IO
            "link": null,   // Link to enriched file, available on completion
            "date": "Fri Oct 2023 10:05",
            "sources": ["pappers", "google"]
        }
    }
    ```

* **Error Responses:**
  * `400 Bad Request` ("ENRICH_SOURCE_IS_EMPTY", "REQUIRED_FIELDS_MISSING")
  * `500 Internal Server Error` ("SERVER_ERROR", "ENRICHMENT_FAILED")

---

### Get All Enrichment Jobs for User

* **Endpoint:** `POST /get-all`
* **Description:** Retrieves all enrichment jobs for the authenticated user.
* **Request Body:** `application/json`

    ```json
    {
        "user_id": "user-uuid"
    }
    ```

* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "DATA_FETCH_SUCCESS",
        "data": [
            {
                "id": "enrich-job-uuid",
                "name": "original_filename_without_extension",
                "status": "completed",
                "records": 150,
                "enriched": 145,
                "date": "Fri Oct 2023 10:05",
                "sources": ["pappers", "google"]
            }
            // ... other enrichment jobs
        ]
    }
    ```

* **Error Responses:**
  * `401 Unauthorized` ("UNAUTHORIZED_ACCESS")
  * `500 Internal Server Error` ("SERVER_ERROR")

---

### Download Enriched File

* **Endpoint:** `GET /:fileId`
* **Description:** Downloads the CSV file generated by a completed enrichment job.
* **Path Parameters:**
  * `fileId` (string, UUID): The ID of the enrichment job.
* **Success Response:**
  * HTTP Status `200 OK`.
  * `Content-Type`: `text/csv` (or `application/octet-stream`).
  * `Content-Disposition`: `attachment; filename="original_job_name.csv"`.
  * The body will be the CSV file content.
* **Error Responses:**
  * `404 Not Found` ("FILE_NOT_FOUND")
  * `500 Internal Server Error` ("SERVER_ERROR")

## Notification & Activity Endpoints

Base Path: `/api/notif`
Authentication: Bearer Token required.

---

### Get All Recent Notifications/Activities

* **Endpoint:** `POST /get/all`
* **Description:** Fetches a list of recent activities (both scraping and enrichment jobs) for the user.
* **Request Body:** `application/json`

    ```json
    {
        "id": "user-uuid" // User ID
    }
    ```

* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "SUCCESS",
        "data": [
            {
                "id": "job-or-enrich-uuid",
                "type": "enrich_job", // or "scraping_job"
                "label": "UploadedFile1", // or "Scraping Query - google-maps"
                "createdAt": "Fri Oct 2023 10:00"
            }
            // ... sorted by most recent, limited to 20
        ]
    }
    ```

* **Error Responses:**
  * `500 Internal Server Error` ("SERVER_ERROR")

---

### Read Notification Details

* **Endpoint:** `GET /notif/:id`
* **Description:** (Currently, this endpoint's implementation is identical to `POST /get/all`. It is intended to fetch details of a specific notification, but this is not its current behavior.)
* **Path Parameters:**
  * `id` (string, UUID): Notification ID (intended).
* **Request Body (Current behavior):** `application/json`

    ```json
    {
        "id": "user-uuid" // User ID, due to current implementation
    }
    ```

* **Response:** Same as `POST /get/all`.

---

### Get Recent Activities

* **Endpoint:** `POST /activities`
* **Description:** (Currently, this endpoint's implementation is identical to `POST /get/all`.)
* **Request Body:** `application/json`

    ```json
    {
        "id": "user-uuid" // User ID
    }
    ```

* **Response:** Same as `POST /get/all`.

---

### Mark Notification as Read

* **Endpoint:** `POST /update-notif`
* **Description:** (Currently, this endpoint's implementation is identical to `POST /get/all`. It is intended to mark a notification as read, but this is not its current behavior.)
* **Request Body:** `application/json`

    ```json
    {
        "id": "user-uuid" // User ID, due to current implementation
        // Expected: notification_id, read_status
    }
    ```

* **Response:** Same as `POST /get/all`.

---

### Get Activity Metrics

* **Endpoint:** `GET /metrics/:id`
* **Description:** Retrieves activity metrics (job counts by status) for the specified user over the last 30 days, grouped by date.
* **Path Parameters:**
  * `id` (string, UUID): User ID.
* **Success Response (200 - OK):**

    ```json
    {
        "error": false,
        "status": 200,
        "message": "SUCCESS",
        "data": [
            {
                "date": "Oct 25", // Formatted date
                "scraping": { "completed": 5, "failed": 1, "pending": 0 },
                "enrichment": { "completed": 2, "failed": 0, "pending": 0 }
            }
            // ... up to 5 most recent days with activity from the last 30 days
        ]
    }
    ```

* **Error Responses:**
  * `500 Internal Server Error` ("SERVER_ERROR")

## Socket.IO Events

The server uses Socket.IO to push real-time updates, primarily for job statuses.

* **Event:** `jobStatusUpdate` (Server to Client)
  * **Description:** Emitted when the status or progress of a scraping job or enrichment job changes.
  * **Payload (Scraping Job Example from `jobsController`):**

        ```json
        {
            "status": "completed", // or "running", "failed"
            "name": "scraping_my_query" // "scraping_" + query
        }
        ```

  * **Payload (Enrichment Job Example from `enrichsmentController`):**

        ```json
        {
            "id": "enrich-job-uuid",
            "status": "in_progress", // or "completed", "failed"
            "name": "original_filename",
            "records": 100, // Total records
            "enriched": 50, // Current count of enriched records
            "link": null // or path to file upon completion
        }
        ```

  * Clients should listen for this event to update UI elements related to job progress.

---

*This API Reference is based on code analysis. Some behaviors, especially for error handling or specific edge cases, might require further testing to fully confirm.*
