# Environment Variables

This document lists the environment variables required or used by the Prospect Pro application. These variables configure aspects like database connections, API keys, JWT secrets, and application behavior.

For local development, create a `.env.local` file in the root of the project by copying the `.env.example` file and filling in the appropriate values. In production environments (like Vercel), these variables should be set directly in the environment settings of the hosting platform.

## Key Environment Variables

| Variable Name         | Required | Example Value                      | Description                                                                 |
| :-------------------- | :------- | :--------------------------------- | :-------------------------------------------------------------------------- |
| `NODE_ENV`            | Yes      | `development` / `production`       | Determines the application environment (impacts config loading, logging).   |
| `PORT`                | Yes      | `3000`                             | The port on which the Node.js server will listen.                           |
| `ORIGINE_URL`         | Yes      | `http://localhost:3001`            | URL of the frontend application. Used for CORS in production and for generating email links (verification, password reset). |
| `JWT_SECRET`          | Yes      | `<YOUR_JWT_SECRET_KEY>`            | Secret key for signing and verifying standard JSON Web Tokens (access tokens). |
| `JWT_REFRESH_SECRET`  | Yes      | `<YOUR_JWT_REFRESH_SECRET_KEY>`    | Secret key for signing and verifying JWT refresh tokens.                    |
| `API_PAPPERS_TOKEN`   | No       | `<YOUR_PAPPERS_API_TOKEN>`         | API token for accessing the Pappers service. (Note: Currently also hardcoded in `pappersScraper.js`, using env var is preferred). |

### Database Configuration (primarily for Production)

These variables are used by `src/config/index.js` when `NODE_ENV` is set to `production`. For development, the config file uses hardcoded defaults, but these can be overridden if set.

| Variable Name         | Required (Prod) | Example Value                      | Description                                     |
| :-------------------- | :-------------- | :--------------------------------- | :---------------------------------------------- |
| `DB_HOST`             | Yes             | `your-db-host.example.com`         | Hostname or IP address of the PostgreSQL server. |
| `DB_NAME`             | Yes             | `prospect_pro_prod_db`             | Name of the PostgreSQL database.                |
| `DB_USER`             | Yes             | `prod_db_user`                     | Username for connecting to the database.        |
| `DB_PASS`             | Yes             | `<YOUR_PROD_DB_PASSWORD>`          | Password for the database user.                 |
| `DB_DIALECT`          | No (Defaults)   | `postgres`                         | Specifies the SQL dialect (fixed to postgres).  |
| `DB_PORT`             | No (Defaults)   | `5432`                             | Port for the PostgreSQL server.                 |

### Mail Configuration (for `sendMail.js`)

| Variable Name         | Required | Example Value                      | Description                                                                 |
| :-------------------- | :------- | :--------------------------------- | :-------------------------------------------------------------------------- |
| `MAIL_HOST`           | Yes      | `smtp.example.com`                 | SMTP server hostname for sending emails.                                    |
| `MAIL_PORT`           | Yes      | `465` or `587`                     | SMTP server port.                                                           |
| `MAIL_SECURE`         | Yes      | `true` / `false`                   | `true` if using SSL/TLS (e.g., port 465), `false` otherwise (e.g., port 587 with STARTTLS). |
| `MAIL_USERNAME`       | Yes      | `<YOUR_SMTP_USERNAME>`             | Username for SMTP authentication.                                           |
| `MAIL_PASSWORD`       | Yes      | `<YOUR_SMTP_PASSWORD>`             | Password for SMTP authentication.                                           |
| `MAIL_FROM_ADDRESS`   | Yes      | `noreply@yourdomain.com`           | The "From" email address for outgoing emails.                             |
| `MAIL_FROM_NAME`      | No       | `Prospect Pro`                     | The "From" name for outgoing emails (defaults to "Prospect Pro" if `APP_NAME` is set or just the from address). |

### Logging Configuration

| Variable Name         | Required | Example Value                      | Description                                                                 |
| :-------------------- | :------- | :--------------------------------- | :-------------------------------------------------------------------------- |
| `LOG_LEVEL`           | No       | `info` / `warn` / `error` / `debug` | Controls the verbosity of logs generated by Winston. Defaults to `info`.    |

## Example `.env.example` File

Create a `.env.local` file by copying the content of `.env.example` (which will be created in the project root) and update the placeholder values.

```env
# Server Configuration
PORT=3000
NODE_ENV=development # set to 'production' for production builds

# Application URLs
ORIGINE_URL=http://localhost:3001 # Frontend URL

# JWT Secrets (generate strong random strings for these)
JWT_SECRET=<YOUR_JWT_SECRET_KEY_HERE>
JWT_REFRESH_SECRET=<YOUR_JWT_REFRESH_SECRET_KEY_HERE>

# Pappers API Token (Optional - if not using the hardcoded one)
API_PAPPERS_TOKEN=<YOUR_PAPPERS_API_TOKEN_HERE>

# Database Configuration (PostgreSQL)
# For development, these are often overridden by hardcoded values in src/config/index.js
# For production, these MUST be set.
DB_HOST=localhost
DB_PORT=5432 # Default PostgreSQL port
DB_NAME=propecpro_db # Development DB name from config
DB_USER=postgres     # Development DB user from config
DB_PASS=admin        # Development DB password from config

# Mail Configuration (using Gmail as an example)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USERNAME=<YOUR_GMAIL_APP_USERNAME_OR_EMAIL>
MAIL_PASSWORD=<YOUR_GMAIL_APP_PASSWORD_OR_REGULAR_PASSWORD> # Use App Password if 2FA is enabled
MAIL_FROM_ADDRESS=<YOUR_GMAIL_EMAIL_ADDRESS>
MAIL_FROM_NAME="Prospect Pro"

# Logging
LOG_LEVEL=info

# Variables below this line might be from a different framework (e.g., Laravel)
# and are likely not used by this Node.js application directly,
# but are included for completeness if seen in an existing .env.local.
# APP_DEBUG=true
# APP_KEY=<APP_KEY>
# APP_URL=<APP_URL>
# APP_PORT=8000
# APP_NAME=ProspectPro
# APP_LOCALE=en
# APP_FALLBACK_LOCALE=en
# APP_KEY_GENERATED=true
# APP_TIMEZONE=UTC
# APP_DEBUGBAR_ENABLED=true
# DB_DIALECT=postgres # This is used by Sequelize config
# DB_CHARSET=utf8mb4
# DB_COLLATION=utf8mb4_unicode_ci
# DB_PREFIX=
# DB_ENGINE=InnoDB
# CACHE_DRIVER=file
# QUEUE_CONNECTION=sync
# SESSION_DRIVER=file
# SESSION_LIFETIME=120
# SESSION_DOMAIN=localhost
# SESSION_SECURE_COOKIE=false
# SESSION_HTTP_ONLY=true
# SESSION_SAME_SITE=lax
# SESSION_PATH=/
# REDIS_HOST=127.0.0.1
# REDIS_PASSWORD=null
# REDIS_PORT=6379
# REDIS_DATABASE=0
# MAIL_MAILER=smtp # Covered by MAIL_HOST etc.
# MAIL_SERVICE=gmail # Covered by MAIL_HOST etc.
# MAIL_ENCRYPTION=null
```

**Note:** Always keep your `.env.local` file (or any file containing secrets) out of version control (e.g., by adding it to `.gitignore`). The `.env.example` file should contain placeholders and be committed to the repository as a template.
