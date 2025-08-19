const axios = require("axios");
const { Notifications, Plans } = require("./../../models");

const Stripe = require("stripe");

// Initialiser Stripe avec ta clé secrète
const STRIPE_KEY = process.env.STRIPE_KEY;

if (!STRIPE_KEY) {
    throw new Error("Stripe key is not set in environment variables.");
}
const stripe = Stripe(STRIPE_KEY);

class ProductHelper {
    /**
     * Synchronise un produit Stripe avec la base de données
     */
    static async syncProductWithDatabase(stripeProduct, prices = []) {
        try {
            const metadata = stripeProduct.metadata || {};

            // Préparer les données pour la base
            const planData = {
                product_id: stripeProduct.id,
                name: stripeProduct.name,
                description: stripeProduct.description,
                active: stripeProduct.active,
                is_free: metadata.is_free === "true",
                credit_allocated: parseFloat(metadata.credit_allocated) || 0,
                features: JSON.parse(metadata.features || "[]"),
                prices: this.formatPricesForDatabase(prices),
            };

            // Upsert dans la base
            const [plan] = await Plans.upsert(planData, {
                where: { product_id: stripeProduct.id },
                returning: true,
            });

            return plan;
        } catch (error) {
            console.error("Sync product error:", error);
            throw error;
        }
    }

    /**
     * Formatte les prix pour la base de données
     */
    static formatPricesForDatabase(prices) {
        const result = {};

        prices.forEach((price) => {
            if (price.recurring) {
                const interval = price.recurring.interval;
                result[interval] = {
                    id: price.id,
                    amount: price.unit_amount / 100,
                    currency: price.currency,
                    interval_count: price.recurring.interval_count,
                };
            }
        });

        return result;
    }

    /**
     * Formatte la réponse produit standard
     */
    static formatProductResponse(product, prices = []) {
        const pricesData = {};
        const isFromStripe = typeof product.created === "number";

        prices.forEach((price) => {
            if (price?.recurring?.interval) {
                const interval = price.recurring.interval;
                pricesData[interval] = {
                    id: price.id,
                    amount: price.unit_amount / 100,
                    currency: price.currency,
                    interval: interval,
                    interval_count: price.recurring.interval_count,
                    nickname: price.nickname || null,
                };
            }
        });

        return {
            id: product.id,
            name: product.name,
            description: product.description,
            active: product.active,
            is_free: product.is_free || product.metadata?.is_free === "true",
            prices: {
                monthly: pricesData.month || null,
                yearly: pricesData.year || null,
            },
            credit_allocated:
                product.credit_allocated || product.metadata?.credit_allocated,
            features:
                product.features ||
                JSON.parse(product.metadata?.features || "[]"),
            annual_discount: product.metadata?.annual_discount,

            createdAt: isFromStripe
                ? new Date(product.created * 1000).toISOString()
                : product.createdAt,
            updatedAt: isFromStripe
                ? new Date(product.updated * 1000).toISOString()
                : product.updatedAt,
        };
    }

    /**
     * Récupère un produit avec vérification en base
     */
    static async getProduct(productId) {
        // D'abord vérifier en base
        const dbProduct = await Plans.findOne({
            where: { product_id: productId, is_free: false },
        });

        if (dbProduct) {
            // Si trouvé en base, récupérer les prix depuis Stripe
            const prices = await stripe.prices.list({
                product: productId,
                active: true,
            });

            const formatted = this.formatProductResponse(
                dbProduct,
                prices.data
            );
            return {
                ...formatted,
                id: productId,
            };
            // return this.formatProductResponse(dbProduct, prices.data);
        }

        // Sinon récupérer depuis Stripe et synchroniser
        const stripeProduct = await stripe.products.retrieve(productId, {
            expand: ["default_price"],
        });

        const prices = await stripe.prices.list({
            product: productId,
            active: true,
        });

        await this.syncProductWithDatabase(stripeProduct, prices.data);

        // return this.formatProductResponse(stripeProduct, prices.data);
        const formatted = this.formatProductResponse(
            stripeProduct,
            prices.data
        );
        return {
            ...formatted,
            id: productId,
        };
    }

    /**
     * Récupère tous les produits avec optimisation
     */
    static async getAllProducts(options = {}) {
        const {
            active_only = true,
            limit = 100,
            starting_after = null,
        } = options;

        // D'abord récupérer depuis la base
        const dbQueryOptions = {
            where: active_only ? { active: true, is_free: false } : {},
            limit,
            order: [["createdAt", "DESC"]],
        };

        // Ajouter le cursor pour la pagination si fourni
        if (starting_after) {
            dbQueryOptions.where.createdAt = {
                [Op.lt]: new Date(starting_after),
            };
        }

        const dbProducts = await Plans.findAll(dbQueryOptions);

        // Si des produits en base, formater la réponse
        if (dbProducts.length > 0) {
            const productsWithPrices = await Promise.all(
                dbProducts.map(async (product) => {
                    try {
                        // Récupérer les prix pour chaque produit
                        const prices = await stripe.prices.list({
                            active: true,
                            product: product.product_id,
                            limit: 10,
                        });

                        const formatted = this.formatProductResponse(
                            product,
                            prices.data
                        );

                        return {
                            ...formatted,
                            id: product.product_id,
                        };
                        // return this.formatProductResponse(product, prices.data);
                    } catch (error) {
                        console.error(
                            `Error fetching prices for product ${product.product_id}:`,
                            error
                        );

                        const formatted = this.formatProductResponse(
                            product,
                            []
                        );
                        return {
                            ...formatted,
                            id: product.product_id,
                        };
                        // return this.formatProductResponse(product, []);
                    }
                })
            );

            return {
                data: productsWithPrices,
                has_more: dbProducts.length === limit,
                next_starting_after:
                    dbProducts.length > 0
                        ? dbProducts[
                              dbProducts.length - 1
                          ].createdAt.toISOString()
                        : null,
            };
        }

        // Si rien en base, récupérer depuis Stripe
        const stripeOptions = {
            active: active_only,
            limit,
        };

        if (starting_after) {
            stripeOptions.starting_after = starting_after;
        }

        const stripeProducts = await stripe.products.list(stripeOptions);

        // Pour chaque produit Stripe, synchroniser avec la base
        const results = await Promise.all(
            stripeProducts.data.map(async (product) => {
                const prices = await stripe.prices.list({
                    product: product.id,
                    active: true,
                });

                await this.syncProductWithDatabase(product, prices.data);
                return this.formatProductResponse(product, prices.data);
            })
        );

        return {
            data: results,
            has_more: stripeProducts.has_more,
            next_starting_after:
                stripeProducts.data.length > 0
                    ? stripeProducts.data[stripeProducts.data.length - 1].id
                    : null,
        };
    }
}

const isAdminOrSuperAdmin = (user) => {
    return user && ["ADMIN", "SUPER_ADMIN"].includes(user.role);
};
const isSuperAdmin = (user) => {
    return user && ["SUPER_ADMIN"].includes(user.role);
};

const { getIO } = require("../../socket/socketManager");

async function createNotification({ user_id, type, content, metadata }) {
  try {
    const notification = await Notifications.create({
      user_id,
      type,
      content,
      metadata,
    });

    // Envoyer la notification en temps réel
    const io = getIO();
    const notificationData = {
      id: notification.id,
      type: notification.type,
      content: notification.content,
      is_read: notification.is_read,
      createdAt: notification.createdAt,
      metadata: notification.metadata,
    };
    io.to(user_id.toString()).emit("new_notification", notificationData);

  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}

function generateRandomPassword(length = 12) {
    if (length < 8)
        throw new Error("Password length must be at least 8 characters");

    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    const allChars = uppercase + lowercase + digits + special;

    function getRandomChar(str) {
        return str[Math.floor(Math.random() * str.length)];
    }

    // Ensure at least one from each required group
    const passwordChars = [
        getRandomChar(uppercase),
        getRandomChar(lowercase),
        getRandomChar(digits),
        getRandomChar(special),
    ];

    // Fill the rest randomly
    for (let i = passwordChars.length; i < length; i++) {
        passwordChars.push(getRandomChar(allChars));
    }

    // Shuffle the result
    return passwordChars.sort(() => Math.random() - 0.5).join("");
}

const getClientIp = (req) => {
    const xForwardedFor = req.headers["x-forwarded-for"];
    if (xForwardedFor) {
        // Peut contenir plusieurs IP séparées par des virgules
        return xForwardedFor.split(",")[0].trim();
    }

    return (
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        null
    );
};

async function getGeoLocation(ip) {
    if (!ip || ip === "::1" || ip === "127.0.0.1") return "Localhost";

    try {
        const { data } = await axios.get(`https://ipapi.co/${ip}/json/`);
        const city = data.city || "";
        const region = data.region || "";
        const country = data.country_name || "";
        return `${city}, ${region}, ${country}`.replace(
            /(^[,\s]+)|([,\s]+$)/g,
            ""
        );
    } catch (error) {
        console.error("GeoLocation Error:", error.message);
        return "Unknown";
    }
}

const COST_JOB_NO_AI = 10;
const COST_JOB_WITH_AI = 20;
const COST_EXPORT_PER_RESULT_PER_FORMAT = 1;

const defaultCredits = {
    FREE: 0,
    STARTER: 490,
    PRO: 1490,
    EXPERT: 3490,
};

function calculateJobCost(isAIActivated) {
    return isAIActivated ? COST_JOB_WITH_AI : COST_JOB_NO_AI;
}

function calculateExportCost(resultCount, exportFormatsCount) {
    return resultCount * exportFormatsCount * COST_EXPORT_PER_RESULT_PER_FORMAT;
}

const stripeErrorCode = (error, default_message) => {
    switch (error.type) {
        case "StripeCardError":
            // A declined card error
            return "STRIPE_CARD_DECLINED";
        case "StripeRateLimitError":
            // Too many requests made to the API too quickly
            return "STRIPE_RATE_LIMIT";
        case "StripeInvalidRequestError":
            // Invalid parameters were supplied to Stripe's API
            if (error.raw && error.raw.message) {
                if (error.raw.message.includes("No such external account"))
                    return "STRIPE_ACCOUNT_NOT_FOUND";
                else if (
                    error.raw.message.includes(
                        "is not available to be purchased because its product is not active"
                    )
                )
                    return "STRIPE_PRODUCT_NOT_ACTIVE";
            }
            if (error.param) {
                // Vous pouvez ajouter des vérifications spécifiques basées sur le paramètre
                if (error.param.startsWith("line_items")) {
                    return "STRIPE_INVALID_LINE_ITEM";
                }
            }
            return "STRIPE_INVALID_REQUEST";
        case "StripeAPIError":
            // An error occurred internally with Stripe's API
            return "STRIPE_API_ERROR";
        case "StripeConnectionError":
            // Some kind of error occurred during the HTTPS communication
            return "STRIPE_CONNECTION_ERROR";
        case "StripeAuthenticationError":
            // You probably used an incorrect API key
            return "STRIPE_AUTHENTICATION_FAILED";
        default:
            // Handle any other types of unexpected errors
            return default_message ?? "STRIPE_UNKNOWN_ERROR";
    }
};


// Helper function to calculate age
const getAge = (dateString) => {
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

module.exports = {
    ProductHelper,
    isAdminOrSuperAdmin,
    isSuperAdmin,
    createNotification,
    generateRandomPassword,
    getClientIp,
    getGeoLocation,
    calculateJobCost,
    calculateExportCost,
    stripeErrorCode,
    getAge,
};
