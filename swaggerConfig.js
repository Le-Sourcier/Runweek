const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RunWeek API",
      version: "1.0.0",
      description:
        "API documentation for the Runweek application. " +
        "RunWeek is a modern API-based application designed for tracking and optimizing sports activities using connected smartwatches. It allows users to monitor their performance in real-time, analyze progress, and receive personalized weekly recommendations.",
      contact: {
        name: "Runweek Support",
        url: "https://github.com/Le-Sourcier/Runweek",
        email: "hackersranch@gmail.com",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? `${process.env.APP_URL}`
            : `http://localhost:${process.env.PORT || 3016}`,
        description: `${
          process.env.APP_URL === "production" ? "Production" : "Development"
        }  server`,
      },
      // Add deployed server URL when available
      // {
      //   url: 'https://your-deployed-app.vercel.app', // Example for Vercel
      //   description: 'Production server',
      // },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT Bearer token **_only_**",
        },
      },
      schemas: {
        // Generic Error Response
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "boolean", example: true },
            status: { type: "integer", example: 400 },
            message: {
              type: "string",
              example: "INVALID_CREDENTIALS",
            },
            data: { type: "array", example: [] },
          },
          required: ["error", "status", "message"],
        },
        Error400: {
          type: "object",
          properties: {
            error: { type: "boolean", example: true },
            status: { type: "integer", example: 400 },
            message: {
              type: "string",
              example: "BAD_REQUEST",
            },
            data: { type: "array", example: [] },
          },
          required: ["error", "status", "message"],
        },

        ErrorUserExist400: {
          type: "object",
          properties: {
            error: { type: "boolean", example: true },
            status: { type: "integer", example: 400 },
            message: {
              type: "string",
              example: "ACCOUNT_ALREADY_EXISTS",
            },
            data: { type: "array", example: [] },
          },
          required: ["error", "status", "message"],
        },

        Error401: {
          type: "object",
          properties: {
            error: { type: "boolean", example: true },
            status: { type: "integer", example: 401 },
            message: {
              type: "string",
              example: "UNAUTHORIZED_ACTION",
            },
            data: { type: "array", example: [] },
          },
          required: ["error", "status", "message"],
        },
        Error404: {
          type: "object",
          properties: {
            error: { type: "boolean", example: true },
            status: { type: "integer", example: 404 },
            message: {
              type: "string",
              example: "RESOURCE_NOT_FOUND",
            },
            data: { type: "array", example: [] },
          },
          required: ["error", "status", "message"],
        },
        Error429: {
          type: "object",
          properties: {
            error: { type: "boolean", example: true },
            status: { type: "integer", example: 429 },
            message: {
              type: "string",
              example: "TOO_MANY_ATTEMPTS",
            },
            data: { type: "array", example: [] },
          },
          required: ["error", "status", "message"],
        },
        Error500: {
          type: "object",
          properties: {
            error: { type: "boolean", example: true },
            status: { type: "integer", example: 500 },
            message: {
              type: "string",
              example: "UNKNOWN_ERROR",
            },
            data: { type: "array", example: [] },
          },
          required: ["error", "status", "message"],
        },

        // User Schemas
        UserInput: {
          type: "object",
          properties: {
            fname: { type: "string", example: "John" },
            lname: { type: "string", example: "Doe" },
            company: {
              type: "string",
              example: "JD Inc.",
              nullable: true,
            },
            phone: { type: "string", example: "1234567890" },
            website: {
              type: "string",
              example: "https://johndoe.com",
              nullable: true,
            },
            email: {
              type: "string",
              format: "email",
              example: "john.doe@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "StrongP@ssw0rd!",
            },
          },
          required: ["fname", "lname", "phone", "email", "password"],
        },
        UserLoginInput: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john.doe@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "StrongP@ssw0rd!",
            },
          },
          required: ["email", "password"],
        },
        AuthTokens: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        AuthSuccessResponse: {
          type: "object",
          properties: {
            error: { type: "boolean", example: false },
            status: { type: "integer", example: 200 },
            message: { type: "string", example: "LOGIN_SUCCESS" },
            data: {
              $ref: "#/components/schemas/AuthTokens",
            },
          },
          required: ["error", "status", "message", "data"],
        },
        UserMeResponseData: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique user identifier",
              example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "user@example.com",
            },
            role: {
              type: "string",
              description: "User role (e.g., USER, ADMIN)",
              example: "USER",
            },

            // Profile info
            fname: {
              type: "string",
              description: "First name",
              example: "John",
            },
            lname: {
              type: "string",
              description: "Last name",
              example: "Doe",
            },
            phone: {
              type: "string",
              description: "Phone number",
              example: "+33612345678",
            },
            address: {
              type: "string",
              description: "Postal address",
              example: "123 Rue Lafayette, 75010 Paris",
            },
            image: {
              type: "string",
              description: "Profile image URL",
              example: "https://cdn.example.com/avatar.jpg",
            },
            bio: {
              type: "string",
              description: "Short user biography",
              example: "I love SaaS, growth hacking and automation.",
            },

            // Company info
            company: {
              type: "string",
              description: "Company name",
              example: "Acme Corp",
            },
            website: {
              type: "string",
              format: "uri",
              description: "Company website",
              example: "https://acme.com",
            },

            // Subscription info
            plan: {
              type: "string",
              enum: ["FREE", "STARTER", "PRO", "EXPERT"],
              description: "Current subscription plan",
              example: "PRO",
            },
            credits: {
              type: "integer",
              description: "Number of credits remaining in the current period",
              example: 1200,
            },

            // Optional metadata
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
              example: "2025-07-14T14:25:00Z",
            },
          },
        },

        UserMeSuccessResponse: {
          type: "object",
          properties: {
            error: { type: "boolean", example: false },
            status: { type: "integer", example: 200 },
            message: { type: "string", example: "SUCCESS" },
            data: {
              $ref: "#/components/schemas/UserMeResponseData",
            },
          },
        },
        UserProfileUpdateInput: {
          type: "object",
          properties: {
            fname: {
              type: "string",
              example: "Johnny",
              nullable: true,
            },
            lname: {
              type: "string",
              example: "Doer",
              nullable: true,
            },
            phone: {
              type: "string",
              example: "0987654321",
              nullable: true,
            },
            address: {
              type: "string",
              example: "123 Main St",
              nullable: true,
            },
            bio: {
              type: "string",
              example: "Software Developer",
              nullable: true,
            },
            company: {
              type: "string",
              example: "Acme Corp",
              nullable: true,
            },
            website: {
              type: "string",
              example: "website.com",
              nullable: true,
            },
          },
        },
        GeneralSuccessResponse: {
          type: "object",
          properties: {
            error: { type: "boolean", example: false },
            status: { type: "integer", example: 200 },
            message: { type: "string", example: "SUCCESS" },
            data: { type: "array", example: [], nullable: true },
          },
        },
        // Profile Schema (subset for User object)
        Profile: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            user_id: { type: "string", format: "uuid" },
            phone: { type: "string", nullable: true },
            fname: { type: "string", nullable: true },
            lname: { type: "string", nullable: true },
            address: { type: "string", nullable: true },
            image: { type: "string", nullable: true },
            agree_to_terms: { type: "boolean" },
            bio: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        // Session Schema (subset for User object)
        Session: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            user_id: { type: "string", format: "uuid" },
            ip_address: { type: "string", nullable: true },
            user_agent: { type: "string", nullable: true },
            // token: { type: 'string' }, // Usually not exposed
            expires_at: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        // Full User Schema (for admin endpoints)
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            // password: { type: 'string' }, // Never expose password
            token: {
              type: "string",
              description: "User's own JWT, not session token",
            },
            status: {
              type: "string",
              enum: ["UNVERIFIED", "VERIFIED", "ARCHIVED", "BLOCKED"],
            },
            role: {
              type: "string",
              enum: ["USER", "ADMIN", "SUPER_ADMIN"],
            },
            reset_token: { type: "string", nullable: true },
            reset_token_expires_at: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            profile: {
              $ref: "#/components/schemas/Profile",
              nullable: true,
            },
            sessions: {
              type: "array",
              items: { $ref: "#/components/schemas/Session" },
              nullable: true,
            },
          },
        },
        // Scraping Job Schemas
        ScrapingJob: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            user_id: { type: "string", format: "uuid" },
            source: { type: "string", example: "google-maps" },
            query: { type: "string", example: "restaurants" },
            location: {
              type: "string",
              example: "Paris",
              nullable: true,
            },
            results: { type: "integer", example: 0 },
            limite: {
              type: "integer",
              example: 50,
              nullable: true,
            },
            status: {
              type: "string",
              enum: ["pending", "running", "completed", "failed"],
              example: "pending",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ScrapingJobInput: {
          type: "object",
          properties: {
            source: { type: "string", example: "google-maps" },
            query: { type: "string", example: "restaurants" },
            location: {
              type: "string",
              example: "Paris",
              nullable: true,
            },
            // results: { type: 'integer', example: 0 }, // Usually not set by client on create
            limite: {
              type: "integer",
              example: 50,
              nullable: true,
            },
          },
          required: ["source", "query"],
        },
        JobResult: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Matches corresponding ScrapingJob ID",
            },
            result: {
              type: "object",
              description: "JSON object or array containing scraped data",
            }, // Can be more specific if structure is known
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        // Enrichment Job Schemas
        EnrichJob: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            user_id: { type: "string", format: "uuid" },
            name: { type: "string", example: "uploaded_data.csv" },
            sources: {
              type: "array",
              items: { type: "string" },
              example: ["pappers", "google"],
            },
            records: { type: "integer", example: 100 },
            enriched: {
              type: "integer",
              example: 0,
              nullable: true,
            },
            link: {
              type: "string",
              nullable: true,
              description: "Link to the enriched file",
            },
            status: {
              type: "string",
              enum: ["in_progress", "queued", "completed", "failed"],
              example: "in_progress",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        EnrichJobMappingInputMeta: {
          // For the 'meta' part of multipart/form-data
          type: "object",
          properties: {
            user_id: { type: "string", format: "uuid" },
            mapping: {
              type: "object",
              additionalProperties: { type: "string" },
              example: {
                siret_number: "SIRET_Col_Name",
                nom_entreprise: "Company_Name_Col",
              },
            },
            sources: {
              type: "array",
              items: { type: "string" },
              example: ["pappers", "google"],
            },
            expected_columns: {
              type: "array",
              items: { type: "string" },
              example: ["siret", "company_name"],
              nullable: true,
            },
          },
          required: ["user_id", "mapping", "sources"],
        },
        // Ajoutez ce nouveau schéma Product
        Product: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Stripe product ID",
            },
            name: {
              type: "string",
              description: "Product name",
            },
            description: {
              type: "string",
              description: "Product description",
            },
            active: {
              type: "boolean",
              description: "Whether the product is active",
            },
            currency: {
              type: "string",
              description: "Currency code",
            },
            credit_allocated: {
              type: "number",
              description: "Amount of credit allocated with this product",
              example: 10000,
            },
            features: {
              type: "array",
              items: {
                type: "string",
              },
              description: "List of product features",
            },
            is_free: {
              type: "boolean",
              description: "Whether the product is a free plan",
            },
            price: {
              type: "number",
              description: "Price amount (only for paid plans)",
            },
            billing_type: {
              type: "string",
              enum: ["monthly", "annually"],
              description: "Billing type (only for paid plans)",
            },
            interval: {
              type: "string",
              enum: ["day", "week", "month", "year"],
              description: "Billing interval (only for paid plans)",
            },
            interval_count: {
              type: "integer",
              description:
                "Number of intervals between billings (only for paid plans)",
            },
            stripe_price_id: {
              type: "string",
              description: "Stripe price ID (only for paid plans)",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
            },
          },
        },

        // Vous pouvez aussi ajouter ces schémas supplémentaires si besoin
        ProductInput: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            is_free: { type: "boolean", default: false },
            price_monthly: { type: "integer" },
            currency: { type: "string", default: "eur" },
            credit_allocated: { type: "number" },
            features: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["name", "description"],
        },

        ProductUpdateInput: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            credit_allocated: { type: "number" },
            features: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
    },
    security: [
      // Applies BearerAuth globally to all operations that define a security requirement
      {
        bearerAuth: [],
      },
    ],
  },
  // Path to the API docs (JSDoc comments)
  apis: [
    "./src/routers/components/*.js", // Scan all router files
    "./src/controllers/components/*.js", // Scan controller files for more detailed comments if needed
    "./swaggerConfig.js", // Include this file for global definitions
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
