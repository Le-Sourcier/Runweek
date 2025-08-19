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

        // Google Fit Schemas
        GoogleFitStepDataPointValue: {
          type: "object",
          properties: {
            intVal: {
              type: "integer",
              description: "Nombre de pas pour l'intervalle.",
              example: 150,
            },
          },
        },
        GoogleFitStepDataPoint: {
          type: "object",
          properties: {
            startTimeNanos: {
              type: "string",
              description: "Début de l'intervalle en nanosecondes.",
              example: "1678886400000000000",
            },
            endTimeNanos: {
              type: "string",
              description: "Fin de l'intervalle en nanosecondes.",
              example: "1678887000000000000",
            },
            dataTypeName: {
              type: "string",
              description: "Type de données.",
              example: "com.google.step_count.delta",
            },
            originDataSourceId: {
              type: "string",
              description: "Source des données.",
              example: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
            },
            value: {
              type: "array",
              items: {
                $ref: "#/components/schemas/GoogleFitStepDataPointValue",
              },
            },
          },
        },
        GoogleFitStepBucket: {
          type: "object",
          properties: {
            startTimeMillis: {
              type: "string",
              description: "Début du bucket en millisecondes.",
              example: "1678836000000",
            },
            endTimeMillis: {
              type: "string",
              description: "Fin du bucket en millisecondes.",
              example: "1678922400000",
            },
            dataset: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  dataSourceId: {
                    type: "string",
                    example: "derived:com.google.step_count.delta:com.google.android.gms:merge_step_deltas",
                  },
                  point: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/GoogleFitStepDataPoint",
                    },
                  },
                },
              },
            },
          },
        },
        GoogleFitStepResponse: {
          type: "object",
          properties: {
            bucket: {
              type: "array",
              items: {
                $ref: "#/components/schemas/GoogleFitStepBucket",
              },
            },
          },
        },
        GoogleFitMetricDataPointValue: {
          type: "object",
          properties: {
            fpVal: {
              type: "number",
              description: "Valeur de la métrique (calories, distance).",
              example: 50.25,
            },
            intVal: {
              type: "integer",
              description: "Valeur de la métrique (pas, minutes d'activité).",
              example: 120,
            },
          },
        },
        GoogleFitMetricDataPoint: {
          type: "object",
          properties: {
            startTimeNanos: {
              type: "string",
              description: "Début de l'intervalle en nanosecondes.",
            },
            endTimeNanos: {
              type: "string",
              description: "Fin de l'intervalle en nanosecondes.",
            },
            dataTypeName: {
              type: "string",
              description: "Type de données (ex: com.google.calories.expended).",
            },
            originDataSourceId: {
              type: "string",
              description: "Source des données.",
            },
            value: {
              type: "array",
              items: {
                $ref: "#/components/schemas/GoogleFitMetricDataPointValue",
              },
            },
          },
        },
        GoogleFitMetricBucket: {
          type: "object",
          properties: {
            startTimeMillis: {
              type: "string",
              description: "Début du bucket en millisecondes.",
            },
            endTimeMillis: {
              type: "string",
              description: "Fin du bucket en millisecondes.",
            },
            dataset: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  dataSourceId: {
                    type: "string",
                    description: "ID de la source de données.",
                  },
                  point: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/GoogleFitMetricDataPoint",
                    },
                  },
                },
              },
            },
          },
        },
        GoogleFitMetricResponse: {
          type: "object",
          properties: {
            bucket: {
              type: "array",
              items: {
                $ref: "#/components/schemas/GoogleFitMetricBucket",
              },
            },
          },
        },
        GoogleFitSleepDataPointValue: {
          type: "object",
          properties: {
            intVal: {
              type: "integer",
              description: "Stade du sommeil (1: léger, 2: profond, 4: REM).",
              example: 2,
            },
          },
        },
        GoogleFitSleepDataPoint: {
          type: "object",
          properties: {
            startTimeNanos: {
              type: "string",
              description: "Début du segment de sommeil en nanosecondes.",
            },
            endTimeNanos: {
              type: "string",
              description: "Fin du segment de sommeil en nanosecondes.",
            },
            dataTypeName: {
              type: "string",
              example: "com.google.sleep.segment",
            },
            originDataSourceId: {
              type: "string",
            },
            value: {
              type: "array",
              items: {
                $ref: "#/components/schemas/GoogleFitSleepDataPointValue",
              },
            },
          },
        },
        GoogleFitSleepResponse: {
          type: "object",
          properties: {
            point: {
              type: "array",
              items: {
                $ref: "#/components/schemas/GoogleFitSleepDataPoint",
              },
            },
          },
        },
        FriendRequest: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the friend request.",
              example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            },
            sender_id: {
              type: "string",
              format: "uuid",
              description: "ID of the user who sent the request.",
              example: "b2c3d4e5-f6a7-8901-2345-67890abcdef0"
            },
            receiver_id: {
              type: "string",
              format: "uuid",
              description: "ID of the user who received the request.",
              example: "c3d4e5f6-a7b8-9012-3456-7890abcdef01"
            },
            status: {
              type: "string",
              enum: ["pending", "accepted", "declined"],
              description: "Current status of the friend request.",
              example: "pending"
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the request was created."
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the request was last updated."
            },
          },
          required: [
            "sender_id",
            "receiver_id"
          ]
        },
        Friend: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the friendship.",
              example: "d4e5f6a7-b8c9-0123-4567-890abcdef012"
            },
            user_id: {
              type: "string",
              format: "uuid",
              description: "ID of the first user in the friendship.",
              example: "e5f6a7b8-c9d0-1234-5678-90abcdef0123"
            },
            friend_id: {
              type: "string",
              format: "uuid",
              description: "ID of the second user in the friendship.",
              example: "f6a7b8c9-d0e1-2345-6789-0abcdef01234"
            },
            status: {
              type: "string",
              enum: ["accepted"],
              description: "Status of the friendship (always 'accepted' for active friends).",
              example: "accepted"
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the friendship was established."
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the friendship was last updated."
            },
          },
          required: [
            "user_id",
            "friend_id"
          ]
        },
        NutritionGoalsInput: {
          type: "object",
          properties: {
            target_calories: {
              type: "number",
              description: "Daily target calories.",
              example: 2000
            },
            target_protein: {
              type: "number",
              description: "Daily target protein in grams.",
              example: 150
            },
            target_carbs: {
              type: "number",
              description: "Daily target carbohydrates in grams.",
              example: 200
            },
            target_fat: {
              type: "number",
              description: "Daily target fat in grams.",
              example: 60
            }
          },
          required: [
            "target_calories",
            "target_protein",
            "target_carbs",
            "target_fat"
          ]
        },

        NutritionGoals: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the nutrition goals."
            },
            user_id: {
              type: "string",
              format: "uuid",
              description: "ID of the user these goals belong to."
            },
            target_calories: {
              type: "number",
              description: "Daily target calories."
            },
            target_protein: {
              type: "number",
              description: "Daily target protein in grams."
            },
            target_carbs: {
              type: "number",
              description: "Daily target carbohydrates in grams."
            },
            target_fat: {
              type: "number",
              description: "Daily target fat in grams."
            },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },

        FoodItem: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the food item."
            },
            name: {
              type: "string",
              description: "Name of the food item.",
              example: "Apple"
            },
            calories: {
              type: "number",
              description: "Calories per unit/serving.",
              example: 95
            },
            protein: {
              type: "number",
              description: "Protein in grams per unit/serving.",
              example: 0.5
            },
            carbs: {
              type: "number",
              description: "Carbohydrates in grams per unit/serving.",
              example: 25
            },
            fat: {
              type: "number",
              description: "Fat in grams per unit/serving.",
              example: 0.3
            }
          },
          required: [
            "name",
            "calories",
            "protein",
            "carbs",
            "fat"
          ]
        },

        MealEntryInput: {
          type: "object",
          properties: {
            meal_type: {
              type: "string",
              enum: ["breakfast", "lunch", "dinner", "snack"],
              description: "Type of meal.",
              example: "lunch"
            },
            food_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  food_item_id: {
                    type: "string",
                    format: "uuid",
                    description: "ID of the food item."
                  },
                  quantity: {
                    type: "number",
                    description: "Quantity of the food item consumed.",
                    example: 1
                  }
                },
                required: [
                  "food_item_id",
                  "quantity"
                ]
              }
            }
          },
          required: [
            "meal_type",
            "food_items"
          ]
        },

        MealEntry: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the meal entry."
            },
            user_id: {
              type: "string",
              format: "uuid",
              description: "ID of the user who logged the meal."
            },
            meal_type: {
              type: "string",
              enum: ["breakfast", "lunch", "dinner", "snack"],
              description: "Type of meal."
            },
            food_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  food_item_id: {
                    type: "string",
                    format: "uuid"
                  },
                  quantity: {
                    type: "number"
                  }
                }
              }
            },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },

        DailyNutrition: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the daily nutrition summary."
            },
            user_id: {
              type: "string",
              format: "uuid",
              description: "ID of the user."
            },
            date: {
              type: "string",
              format: "date",
              description: "Date for which the nutrition data is summarized.",
              example: "2025-08-19"
            },
            total_calories: {
              type: "number",
              description: "Total calories consumed for the day.",
              example: 1850
            },
            total_protein: {
              type: "number",
              description: "Total protein consumed for the day in grams.",
              example: 120
            },
            total_carbs: {
              type: "number",
              description: "Total carbohydrates consumed for the day in grams.",
              example: 180
            },
            total_fat: {
              type: "number",
              description: "Total fat consumed for the day in grams.",
              example: 55
            },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },

        DietAnalysis: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the diet analysis."
            },
            user_id: {
              type: "string",
              format: "uuid",
              description: "ID of the user."
            },
            analysis_text: {
              type: "string",
              description: "The AI-generated diet analysis in markdown format.",
              example: "Based on your recent intake, you are doing great..."
            },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },

        NutritionRecommendation: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the nutrition recommendation."
            },
            user_id: {
              type: "string",
              format: "uuid",
              description: "ID of the user."
            },
            recommendation_text: {
              type: "string",
              description: "The AI-generated nutrition recommendation in markdown format.",
              example: "Here is a sample meal plan for your goals..."
            },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        }
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
