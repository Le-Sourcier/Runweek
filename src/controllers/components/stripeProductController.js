const Stripe = require("stripe");
const { v4: uuidv4 } = require("uuid");
const {
    serverMessage,
    isAdminOrSuperAdmin,
    stripeErrorCode,
    ProductHelper,
} = require("../../utils");
const { Users, Plans } = require("../../models");

// Initialiser Stripe avec ta clé secrète
const STRIPE_KEY = process.env.STRIPE_KEY;

if (!STRIPE_KEY) {
    throw new Error("Stripe key is not set in environment variables.");
}
const stripe = Stripe(STRIPE_KEY);

module.exports = {
    /*********************************
     * PRODUCT MANAGEMENT CONTROLLERS
     *********************************/

    // Create new product
    createProduct: async (req, res) => {
        try {
            const {
                name,
                description,
                is_free = false,
                credit_allocated = 0,
                features = [],
                price_monthly,
                annual_discount = 0.2, // 20% de réduction par défaut
                activate_annual_plan = true,
                currency = "eur",
            } = req.body;

            if (annual_discount < 0 || annual_discount >= 1) {
                return serverMessage(res, "INVALID_DISCOUNT_VALUE");
            }

            // Validation des entrées
            if (!name || !description) {
                return serverMessage(res, "MISSING_REQUIRED_FIELDS");
            }

            // 1. Créer le produit
            const product = await stripe.products.create({
                name,
                description,
                metadata: {
                    credit_allocated: credit_allocated.toString(),
                    features: JSON.stringify(features),
                    annual_discount: annual_discount.toString(),
                },
                active: true,
            });

            // 2. Créer le prix mensuel
            const monthlyPriceObj = await stripe.prices.create({
                product: product.id,
                unit_amount: price_monthly,
                currency,
                recurring: {
                    interval: "month",
                    interval_count: 1,
                },
                nickname: `${name} - monthly`,
            });

            if (activate_annual_plan && annual_discount > 0) {
                const annualAmount = Math.round(
                    price_monthly * 12 * (1 - annual_discount)
                );

                // 3. Créer le prix annuel
                await stripe.prices.create({
                    product: product.id,
                    unit_amount: annualAmount,
                    currency,
                    recurring: {
                        interval: "year",
                        interval_count: 1,
                    },
                    nickname: `${name} - annually`,
                });
            }

            // 4. Définir le prix mensuel comme prix par défaut
            await stripe.products.update(product.id, {
                default_price: monthlyPriceObj.id,
            });

            // 5. Récupérer le produit avec les détails complets
            const updatedProduct = await stripe.products.retrieve(product.id, {
                expand: ["default_price"],
            });

            const prices = await stripe.prices.list({
                product: product.d,
                active: true,
                expand: ["data.product"],
            });

            // Synchronisation avec la base
            const dbProduct = await ProductHelper.syncProductWithDatabase(
                updatedProduct,
                prices.data
            );

            return serverMessage(
                res,
                "CREATE_PRODUCT_SUCCESS",
                ProductHelper.formatProductResponse(updatedProduct, prices.data)
            );
        } catch (error) {
            console.error("Erreur lors de la création du produit:", error);
            const message = stripeErrorCode(error, "PRODUCT_CREATION_FAILED");
            return serverMessage(res, message);
        }
    },

    // Get all produits from stripe and or db
    getProducts: async (req, res) => {
        try {
            const {
                active_only = "true",
                limit = 100,
                starting_after,
            } = req.query;

            // Utiliser le ProductHelper pour récupérer les produits
            const result = await ProductHelper.getAllProducts({
                active_only: active_only === "true",
                limit: parseInt(limit),
                starting_after,
            });

            if (result.length === 0)
                return serverMessage(res, "PRODUCTS_NOT_FOUND");

            return serverMessage(res, "PRODUCTS_RETRIEVED", {
                count: result.data.length,
                products: result.data,
                pagination: {
                    has_more: result.has_more,
                    next_starting_after: result.next_starting_after,
                },
            });
        } catch (error) {
            console.error(
                "Erreur lors de la récupération des produits:",
                error
            );
            const message = stripeErrorCode(error, "PRODUCTS_RETRIEVAL_FAILED");
            return serverMessage(res, message);
        }
    },

    // Get Product By ID
    getProductById: async (req, res) => {
        try {
            const { id: productId } = req.params;

            if (!productId) return serverMessage(res, "PRODUCT_ID_REQUIRED");

            // Récupérer le produit
            const existeProduct = await stripe.products.retrieve(productId);

            if (!existeProduct) serverMessage(res, "PRODUCT_NOT_FOUND");

            const product = await ProductHelper.getProduct(productId);

            return serverMessage(res, "PRODUCT_RETRIEVED", product);
        } catch (error) {
            console.error("Erreur lors de la récupération du produit:", error);
            const message = stripeErrorCode(error, "PRODUCT_RETRIEVAL_FAILED");
            return serverMessage(res, message);
        }
    },

    // Update Product
    updateProduct: async (req, res) => {
        try {
            const { id: productId } = req.params;
            const {
                name,
                description,
                // is_free = false,
                credit_allocated = 0,
                features = [],
                price_monthly,
                annual_discount = 0.2, // 20% de réduction par défaut
                activate_annual_plan = true,
                currency = "eur",
            } = req.body;

            if (!productId || !price_monthly) {
                return serverMessage(res, "MISSING_REQUIRED_FIELDS");
            }

            // Vérifier si le produit existe
            const product = await stripe.products.retrieve(productId);

            if (!product) {
                serverMessage(res, "PRODUCT_NOT_FOUND");
            }

            // 2. Préparer les métadonnées
            const metadata = {
                // is_free: String(is_free),
                credit_allocated: String(credit_allocated),
                features: Array.isArray(features)
                    ? JSON.stringify(features)
                    : "[]",
                annual_discount: String(annual_discount),
                activate_annual_plan: String(activate_annual_plan),
            };

            // 3. Mettre à jour le produit
            const updateParams = {
                metadata,
            };

            if (name) updateParams.name = name;
            if (description) updateParams.description = description;

            await stripe.products.update(productId, updateParams);

            // Récupérer les prix existants
            const existingPrices = await stripe.prices.list({
                product: productId,
                active: true,
            });

            let monthlyPriceId = null;
            let yearlyPriceId = null;

            // Créer ou mettre à jour les prix
            if (price_monthly) {
                // Archiver l'ancien prix mensuel s'il existe
                const existingMonthlyPrice = existingPrices.data.find(
                    (price) =>
                        price.recurring && price.recurring.interval === "month"
                );

                if (existingMonthlyPrice) {
                    await stripe.prices.update(existingMonthlyPrice.id, {
                        active: false,
                    });
                }

                // Créer un nouveau prix mensuel
                const newMonthlyPrice = await stripe.prices.create({
                    product: productId,
                    unit_amount: price_monthly,
                    currency,
                    recurring: {
                        interval: "month",
                        interval_count: 1,
                    },
                    nickname: `${name} - monthly`,
                });

                monthlyPriceId = newMonthlyPrice.id;
            }

            if (activate_annual_plan && annual_discount > 0) {
                const annualAmount = Math.round(
                    price_monthly * 12 * (1 - annual_discount)
                );

                // Archiver l'ancien prix annuel s'il existe
                const existingYearlyPrice = existingPrices.data.find(
                    (price) =>
                        price.recurring && price.recurring.interval === "year"
                );

                if (existingYearlyPrice) {
                    await stripe.prices.update(existingYearlyPrice.id, {
                        active: false,
                    });
                }

                // Créer un nouveau prix annuel
                const newYearlyPrice = await stripe.prices.create({
                    product: productId,
                    unit_amount: annualAmount,
                    currency,
                    recurring: {
                        interval: "year",
                        interval_count: 1,
                    },
                    nickname: `${name} - annually`,
                });

                yearlyPriceId = newYearlyPrice.id;
            }

            // Définir le prix par défaut selon le paramètre
            const defaultPriceId =
                default_price_interval === "month"
                    ? monthlyPriceId ||
                      existingPrices.data.find(
                          (price) =>
                              price.recurring &&
                              price.recurring.interval === "month"
                      )?.id
                    : yearlyPriceId ||
                      existingPrices.data.find(
                          (price) =>
                              price.recurring &&
                              price.recurring.interval === "year"
                      )?.id;

            if (defaultPriceId) {
                await stripe.products.update(productId, {
                    default_price: defaultPriceId,
                });
            }

            // Récupérer le produit mis à jour avec tous ses prix
            const updatedProduct = await stripe.products.retrieve(productId, {
                expand: ["default_price"],
            });

            const prices = await stripe.prices.list({
                product: productId,
                active: true,
                expand: ["data.product"],
            });

            // Sync avec la base
            const dbProduct = await ProductHelper.syncProductWithDatabase(
                updatedProduct,
                prices.data
            );

            return serverMessage(
                res,
                "PRODUCT_UPDATED",
                ProductHelper.formatProductResponse(dbProduct, prices.data)
            );

            // const data = formatProductResponse(updatedProduct, prices.data);

            // return serverMessage(res, "PRODUCT_PRICES_UPDATED", data);
        } catch (error) {
            console.error("Erreur lors de la mise à jour des prix:", error);
            const message = stripeErrorCode(error, "PRICE_UPDATE_FAILED");
            return serverMessage(res, message);
        }
    },

    // Delete Product
    deleteProduct: async (req, res) => {
        try {
            const { id: userId } = req.user;
            const { id: productId } = req.params;

            if (!productId) {
                return serverMessage(res, "MISSING_PRODUCT_ID");
            }

            // Vérification des permissions
            const admin = await Users.findByPk(userId);
            if (!admin || !isAdminOrSuperAdmin(admin)) {
                return serverMessage(res, "INSUFFICIENT_PERMISSIONS");
            }

            // 1. Récupérer le produit pour vérifier qu'il existe
            const product = await stripe.products.retrieve(productId);

            // 1.2 Vérifier si le produit existe dans la base de données
            const dbProduct = await Plans.findOne({
                where: { product_id: productId },
            });

            // Si le produit n'existe ni en base ni sur Stripe
            if (!dbProduct && !product) {
                return serverMessage(res, "PRODUCT_NOT_FOUND");
            }

            // 2. Récupérer tous les prix associés au produit
            const prices = await stripe.prices.list({
                product: productId,
                limit: 100, // Augmenter si nécessaire
            });

            // 3. Mettre à jour le produit pour supprimer le prix par défaut
            await stripe.products.update(productId, {
                default_price: null,
            });

            // 4. Archiver tous les prix associés
            const archivePromises = prices.data.map((price) =>
                stripe.prices.update(price.id, { active: false })
            );
            await Promise.all(archivePromises);

            // 5. Supprimer les prix qui peuvent être supprimés
            // Note: Stripe ne permet de supprimer que les prix qui n'ont jamais été utilisés
            const deletePromises = prices.data.map(async (price) => {
                try {
                    await stripe.prices.del(price.id);
                    return { id: price.id, deleted: true };
                } catch (error) {
                    return {
                        id: price.id,
                        deleted: false,
                        error: error.message,
                    };
                }
            });
            const deleteResults = await Promise.all(deletePromises);

            // 6. Supprimer le produit
            // Si le produit a été utilisé dans des transactions, il ne sera que "archivé" et non supprimé
            let productDeleted = false;
            try {
                await stripe.products.del(productId);
                productDeleted = true;
            } catch (error) {
                // Si la suppression échoue, on archive simplement le produit
                await stripe.products.update(productId, { active: false });
                productDeleted = false;
            }

            // Suppression de la base de données si existant
            if (dbProduct) {
                await Plans.destroy({ where: { product_id: productId } });

                // Suppression des abonnements associés si nécessaire
                // await Subscriptions.destroy({ where: { plan_id: productId } });
            }

            return serverMessage(
                res,
                "PRODUCT_DELETED"
                //      {
                //     product_id: productId,
                //     product_deleted: productDeleted,
                //     product_archived: !productDeleted,
                //     prices_processed: deleteResults.length,
                //     prices_deleted: deleteResults.filter((r) => r.deleted).length,
                //     prices_archived: deleteResults.filter((r) => !r.deleted).length,
                // }
            );
        } catch (error) {
            console.error("Erreur lors de la suppression du produit:", error);
            const message = stripeErrorCode(error, "PRODUCT_DELETION_FAILED");
            return serverMessage(res, message);
        }
    },
    /*********************************
     * CHECKOUT SESSION CONTROLLERS
     *********************************/

    // Create a Stripe checkou session
    createCheckoutSession: async (req, res) => {
        try {
            const { price_id } = req.params;
            const { quantity = 1, customer_email, metadata = {} } = req.body;

            // Validate price_id
            if (!price_id) {
                return serverMessage(res, "MISSING_PRICE_ID");
            }

            // Base URL from environment or config
            const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

            // Create a checkout session for subscription
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"], // You can add more payment methods here
                line_items: [
                    {
                        price: price_id,
                        quantity: quantity,
                    },
                ],
                mode: "subscription",
                success_url: `${baseUrl}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/stripe/cancel?session_id={CHECKOUT_SESSION_ID}`,
                customer_email: customer_email, // Pre-fill the email field if provided
                metadata: {
                    ...metadata,
                    created_by: "api", // Tracking info
                    created_at: new Date().toISOString(),
                },
            });

            // Return the session ID and URL
            return serverMessage(res, "CHECKOUT_SESSION_CREATED", {
                sessionId: session.id,
                url: session.url,
            });
        } catch (error) {
            console.error("Error creating checkout session:", error);
            const errorMessage =
                error.message || "Failed to create checkout session";
            return serverMessage(res, "CHECKOUT_SESSION_FAILED");
        }
    },

    // Get checkout session details
    getCheckoutSessionDetails: async (req, res) => {
        try {
            const { session_id } = req.params;

            // Validate session_id
            if (!session_id) {
                return serverMessage(res, "MISSING_SESSION_ID");
            }

            // Retrieve the checkout session with expanded objects
            const session = await stripe.checkout.sessions.retrieve(
                session_id,
                {
                    expand: [
                        "customer",
                        "payment_intent",
                        "subscription",
                        "line_items",
                        "line_items.data.price.product",
                    ],
                }
            );

            // Format the response data
            const formattedData = {
                id: session.id,
                status: session.status,
                customer: session.customer
                    ? {
                          id: session.customer.id,
                          email: session.customer.email,
                          name: session.customer.name,
                      }
                    : null,
                payment_status: session.payment_status,
                subscription: session.subscription
                    ? {
                          id: session.subscription.id,
                          status: session.subscription.status,
                          current_period_end:
                              session.subscription.current_period_end,
                          current_period_start:
                              session.subscription.current_period_start,
                      }
                    : null,
                items: session.line_items
                    ? session.line_items.data.map((item) => ({
                          id: item.id,
                          quantity: item.quantity,
                          price: {
                              id: item.price.id,
                              unit_amount: item.price.unit_amount / 100,
                              currency: item.price.currency,
                              recurring: item.price.recurring
                                  ? {
                                        interval: item.price.recurring.interval,
                                        interval_count:
                                            item.price.recurring.interval_count,
                                    }
                                  : null,
                          },
                          product: item.price.product
                              ? {
                                    id: item.price.product.id,
                                    name: item.price.product.name,
                                    description: item.price.product.description,
                                }
                              : null,
                      }))
                    : [],
                amount_total: session.amount_total / 100,
                currency: session.currency,
                created: new Date(session.created * 1000).toISOString(),
                expires_at: session.expires_at
                    ? new Date(session.expires_at * 1000).toISOString()
                    : null,
                url: session.url || null,
                metadata: session.metadata,
            };

            return serverMessage(
                res,
                "SESSION_DETAILS_RETRIEVED",
                formattedData
            );
        } catch (error) {
            console.error("Error retrieving checkout session:", error);
            const errorMessage =
                error.message || "Failed to retrieve session details";
            return serverMessage(res, "SESSION_RETRIEVAL_FAILED");
        }
    },

    /*********************************
     * SUBSCRIPTION CONTROLLERS
     *********************************/
    // Create a checkout session for subscription
    createSubscription: async (req, res) => {
        try {
            const {
                price_id,
                customer_email,
                quantity = 1,
                metadata = {},
            } = req.body;

            if (!price_id) {
                return serverMessage(res, "MISSING_PRICE_ID");
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price: price_id,
                        quantity: quantity,
                    },
                ],
                mode: "subscription",
                success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
                customer_email: customer_email,
                metadata: {
                    ...metadata,
                    created_at: new Date().toISOString(),
                },
                client_reference_id: req.user?.id || null,
            });

            return serverMessage(res, "SUBSCRIPTION_CHECKOUT_CREATED", {
                sessionId: session.id,
                url: session.url,
            });
        } catch (error) {
            console.error("Subscription creation error:", error);
            return serverMessage(res, "SUBSCRIPTION_CREATION_ERROR");
        }
    },

    // Get subscription transations
    getSubscriptionTransactions: async (req, res) => {
        try {
            const { subscription_id } = req.params;

            // Validate subscription_id
            if (!subscription_id) {
                return serverMessage(res, "MISSING_SUBSCRIPTION_ID");
            }

            // First, retrieve the subscription to get related invoice IDs
            const subscription = await stripe.subscriptions.retrieve(
                subscription_id
            );

            // Then, list all invoices for this subscription
            const invoices = await stripe.invoices.list({
                subscription: subscription_id,
                limit: 100,
            });

            // Format the response data
            const formattedData = {
                subscription: {
                    id: subscription.id,
                    status: subscription.status,
                    current_period_end: subscription.current_period_end,
                    current_period_start: subscription.current_period_start,
                    customer: subscription.customer,
                },
                invoices: invoices.data.map((invoice) => ({
                    id: invoice.id,
                    status: invoice.status,
                    amount_due: invoice.amount_due / 100,
                    amount_paid: invoice.amount_paid / 100,
                    currency: invoice.currency,
                    created: new Date(invoice.created * 1000).toISOString(),
                    payment_intent: invoice.payment_intent,
                    hosted_invoice_url: invoice.hosted_invoice_url,
                    period_start: new Date(
                        invoice.period_start * 1000
                    ).toISOString(),
                    period_end: new Date(
                        invoice.period_end * 1000
                    ).toISOString(),
                })),
            };

            return serverMessage(
                res,
                "SUBSCRIPTION_TRANSACTIONS_RETRIEVED",
                formattedData
            );
        } catch (error) {
            console.error("Error retrieving subscription transactions:", error);
            const errorMessage =
                error.message || "Failed to retrieve subscription transactions";
            return serverMessage(res, "SUBSCRIPTION_TRANSACTIONS_FAILED");
        }
    },

    // List all subscriptions for a customer
    listCustomerSubscriptions: async (req, res) => {
        try {
            const { customer_id } = req.params;
            const { limit = 10, status = "all" } = req.query;

            if (!customer_id) {
                return serverMessage(res, "MISSING_CUSTOMER_ID");
            }

            const queryParams = {
                customer: customer_id,
                limit: parseInt(limit),
                expand: ["data.default_payment_method"],
            };

            if (status !== "all") {
                queryParams.status = status;
            }

            const subscriptions = await stripe.subscriptions.list(queryParams);

            const formattedSubscriptions = subscriptions.data.map((sub) => ({
                id: sub.id,
                status: sub.status,
                current_period_start: sub.current_period_start,
                current_period_end: sub.current_period_end,
                cancel_at_period_end: sub.cancel_at_period_end,
                plan: sub.items.data[0].price.product,
                amount: sub.items.data[0].price.unit_amount,
                currency: sub.items.data[0].price.currency,
                interval: sub.items.data[0].price.recurring.interval,
                interval_count:
                    sub.items.data[0].price.recurring.interval_count,
                payment_method: sub.default_payment_method
                    ? {
                          id: sub.default_payment_method.id,
                          type: sub.default_payment_method.type,
                          card: sub.default_payment_method.card
                              ? {
                                    brand: sub.default_payment_method.card
                                        .brand,
                                    last4: sub.default_payment_method.card
                                        .last4,
                                }
                              : null,
                      }
                    : null,
            }));

            return serverMessage(res, "SUBSCRIPTIONS_RETRIEVED", {
                subscriptions: formattedSubscriptions,
                has_more: subscriptions.has_more,
                total_count: subscriptions.data.length,
            });
        } catch (error) {
            console.error("List subscriptions error:", error);
            return serverMessage(res, "LIST_SUBSCRIPTIONS_ERROR");
        }
    },

    // Update a subscription (change plan, quantity, etc.)
    updateSubscription: async (req, res) => {
        try {
            const { subscription_id } = req.params;
            const {
                price_id,
                quantity,
                proration_behavior = "create_prorations",
            } = req.body;

            if (!subscription_id) {
                return serverMessage(res, "MISSING_SUBSCRIPTION_ID");
            }

            const currentSubscription = await stripe.subscriptions.retrieve(
                subscription_id
            );
            const subscriptionItemId = currentSubscription.items.data[0].id;

            const updatedSubscription = await stripe.subscriptions.update(
                subscription_id,
                {
                    items: [
                        {
                            id: subscriptionItemId,
                            price: price_id,
                            quantity: quantity,
                        },
                    ],
                    proration_behavior: proration_behavior,
                }
            );

            return serverMessage(res, "SUBSCRIPTION_UPDATED", {
                id: updatedSubscription.id,
                status: updatedSubscription.status,
                current_period_end: new Date(
                    updatedSubscription.current_period_end * 1000
                ).toISOString(),
                items: updatedSubscription.items.data.map((item) => ({
                    id: item.id,
                    price: {
                        id: item.price.id,
                        product: item.price.product,
                        unit_amount: item.price.unit_amount,
                        currency: item.price.currency,
                    },
                    quantity: item.quantity,
                })),
            });
        } catch (error) {
            console.error("Subscription update error:", error);
            return serverMessage(res, "SUBSCRIPTION_UPDATE_ERROR");
        }
    },
    // Cancel a subscription
    cancelSubscription: async (req, res) => {
        try {
            const { subscription_id } = req.params;
            const { cancel_immediately = false } = req.body;

            if (!subscription_id) {
                return serverMessage(res, "MISSING_SUBSCRIPTION_ID");
            }

            let subscription;
            if (cancel_immediately) {
                subscription = await stripe.subscriptions.cancel(
                    subscription_id
                );
            } else {
                subscription = await stripe.subscriptions.update(
                    subscription_id,
                    {
                        cancel_at_period_end: true,
                    }
                );
            }

            return serverMessage(
                res,
                cancel_immediately
                    ? "SUBSCRIPTION_CANCELLED_IMMEDIATELY"
                    : "SUBSCRIPTION_CANCELLED_AT_PERIOD_END",
                {
                    id: subscription.id,
                    status: subscription.status,
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    current_period_end: new Date(
                        subscription.current_period_end * 1000
                    ).toISOString(),
                    canceled_at: subscription.canceled_at
                        ? new Date(
                              subscription.canceled_at * 1000
                          ).toISOString()
                        : null,
                }
            );
        } catch (error) {
            console.error("Subscription cancellation error:", error);
            return serverMessage(res, "SUBSCRIPTION_CANCEL_ERROR");
        }
    },

    /*********************************
     * PAYOUT CONTROLLERS
     *********************************/

    // Create a new payout to your bank account
    createPayout: async (req, res) => {
        try {
            const {
                amount,
                currency = "usd",
                description = null,
                statement_descriptor = null,
                destination = null,
                metadata = {},
            } = req.body;

            // Validate amount
            if (!amount || amount <= 0) {
                return serverMessage(res, "INVALID_AMOUNT");
            }

            // Prepare payout parameters
            const payoutParams = {
                amount: Math.round(amount), // Amount in cents, must be an integer
                currency: currency,
            };

            // Add optional parameters if provided
            if (description) payoutParams.description = description;
            if (statement_descriptor)
                payoutParams.statement_descriptor = statement_descriptor;
            if (destination) payoutParams.destination = destination;
            if (Object.keys(metadata).length > 0)
                payoutParams.metadata = metadata;

            // Create the payout
            const payout = await stripe.payouts.create(payoutParams);

            return serverMessage(res, "PAYOUT_CREATED", {
                id: payout.id,
                amount: payout.amount,
                currency: payout.currency,
                arrival_date: new Date(
                    payout.arrival_date * 1000
                ).toISOString(),
                description: payout.description,
                status: payout.status,
                method: payout.method,
                source_type: payout.source_type,
            });
        } catch (error) {
            // console.error("Error creating payout:", error);
            const errorMessage = error.message || "Failed to create payout";
            const message = stripeErrorCode(
                error.type,
                "PAYOUT_CREATION_FAILED"
            );
            console.log("error.type: ", error.type);
            return serverMessage(res, message);
        }
    },
    // Get a specific payout Details
    getPayoutDetails: async (req, res) => {
        try {
            const { payout_id } = req.params;

            // Validate payout_id
            if (!payout_id) {
                return serverMessage(res, "MISSING_PAYOUT_ID");
            }

            // Retrieve the payout
            const payout = await stripe.payouts.retrieve(payout_id);

            // Format the response data
            const formattedData = {
                id: payout.id,
                amount: payout.amount,
                currency: payout.currency,
                arrival_date: new Date(
                    payout.arrival_date * 1000
                ).toISOString(),
                created: new Date(payout.created * 1000).toISOString(),
                description: payout.description,
                destination: payout.destination,
                method: payout.method,
                source_type: payout.source_type,
                status: payout.status,
                type: payout.type,
                metadata: payout.metadata,
            };

            return serverMessage(
                res,
                "PAYOUT_DETAILS_RETRIEVED",
                formattedData
            );
        } catch (error) {
            console.error("Error retrieving payout:", error);
            const errorMessage =
                error.message || "Failed to retrieve payout details";
            return serverMessage(res, "PAYOUT_RETRIEVAL_FAILED");
        }
    },

    // List payouts with pagination
    listPayouts: async (req, res) => {
        try {
            const {
                limit = 10,
                starting_after = null,
                ending_before = null,
                created_after = null,
                created_before = null,
                status = null,
            } = req.query;

            const params = {
                limit: parseInt(limit, 10),
                expand: ["data.destination"],
            };

            // Add pagination parameters if provided
            if (starting_after) params.starting_after = starting_after;
            if (ending_before) params.ending_before = ending_before;

            // Add date filters if provided
            if (created_after || created_before) {
                params.created = {};
                if (created_after)
                    params.created.gt = Math.floor(
                        new Date(created_after).getTime() / 1000
                    );
                if (created_before)
                    params.created.lt = Math.floor(
                        new Date(created_before).getTime() / 1000
                    );
            }

            // Add status filter if provided
            if (status) params.status = status;

            const payouts = await stripe.payouts.list(params);

            const formattedPayouts = payouts.data.map((payout) => ({
                id: payout.id,
                amount: payout.amount,
                currency: payout.currency,
                arrival_date: new Date(
                    payout.arrival_date * 1000
                ).toISOString(),
                created: new Date(payout.created * 1000).toISOString(),
                description: payout.description,
                destination: payout.destination,
                status: payout.status,
                method: payout.method,
            }));

            return serverMessage(res, "PAYOUTS_RETRIEVED", {
                payouts: formattedPayouts,
                has_more: payouts.has_more,
                total_count: payouts.data.length,
                url: payouts.url,
            });
        } catch (error) {
            console.error("Error listing payouts:", error);
            const errorMessage = error.message || "Failed to list payouts";
            console.log("ERROR IN LIST PAYOUTS: ", errorMessage);
            return serverMessage(res, "PAYOUTS_LISTING_FAILED");
        }
    },
    // Cancel a pending payout
    cancelPayout: async (req, res) => {
        try {
            const { payout_id } = req.params;

            if (!payout_id) {
                return serverMessage(res, "MISSING_PAYOUT_ID");
            }

            const payout = await stripe.payouts.cancel(payout_id);

            return serverMessage(res, "PAYOUT_CANCELLED", {
                id: payout.id,
                status: payout.status,
                amount: payout.amount,
                currency: payout.currency,
                arrival_date: new Date(
                    payout.arrival_date * 1000
                ).toISOString(),
            });
        } catch (error) {
            console.error("Error cancelling payout:", error);
            // Handle specific error cases
            if (error.code === "payout_cancel_not_allowed") {
                return serverMessage(res, "PAYOUT_CANCEL_NOT_ALLOWED", {
                    error: "This payout cannot be cancelled. Only pending payouts can be cancelled.",
                });
            }

            const errorMessage = error.message || "Failed to cancel payout";
            return serverMessage(res, "PAYOUT_CANCELLATION_FAILED");
        }
    },
    // Update a payout's metadata
    updatePayoutMetadata: async (req, res) => {
        try {
            const { payout_id } = req.params;
            const { metadata } = req.body;

            if (!payout_id) {
                return serverMessage(res, "MISSING_PAYOUT_ID");
            }

            if (!metadata || Object.keys(metadata).length === 0) {
                return serverMessage(res, "MISSING_METADATA");
            }

            const payout = await stripe.payouts.update(payout_id, { metadata });

            return serverMessage(res, "PAYOUT_UPDATED", {
                id: payout.id,
                metadata: payout.metadata,
            });
        } catch (error) {
            console.error("Error updating payout metadata:", error);
            const errorMessage =
                error.message || "Failed to update payout metadata";
            return serverMessage(res, "PAYOUT_UPDATE_FAILED");
        }
    },

    // Get all transactions (balance transactions) related to a specific payout
    getPayoutTransactions: async (req, res) => {
        try {
            const { payout_id } = req.params;
            const { id } = req.user;
            const admin = Users.findByPk(id);
            if (!admin && !isAdminOrSuperAdmin(admin)) {
                return serverMessage(res, "INSUFFICIENT_PERMISSIONS");
            }

            if (!payout_id) {
                return serverMessage(res, "MISSING_PAYOUT_ID");
            }

            // List balance transactions associated with this payout
            const balanceTransactions = await stripe.balanceTransactions.list({
                payout: payout_id,
                limit: 100,
                expand: ["data.source"],
            });

            const formattedTransactions = balanceTransactions.data.map(
                (transaction) => ({
                    id: transaction.id,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    description: transaction.description,
                    fee: transaction.fee,
                    net: transaction.net,
                    status: transaction.status,
                    type: transaction.type,
                    created: new Date(transaction.created * 1000).toISOString(),
                    source_type: transaction.source
                        ? transaction.source.object
                        : null,
                    source_id: transaction.source
                        ? transaction.source.id
                        : null,
                })
            );

            return serverMessage(res, "PAYOUT_TRANSACTIONS_RETRIEVED", {
                payout_id: payout_id,
                transactions: formattedTransactions,
                has_more: balanceTransactions.has_more,
                total_count: balanceTransactions.data.length,
            });
        } catch (error) {
            console.error("Error retrieving payout transactions:", error);
            const errorMessage =
                error.message || "Failed to retrieve payout transactions";
            return serverMessage(res, "PAYOUT_TRANSACTIONS_FAILED");
        }
    },

    // Create an instant payout (if eligible)
    createInstantPayout: async (req, res) => {
        try {
            const {
                amount,
                currency = "usd",
                description = null,
                statement_descriptor = null,
                destination = null,
                metadata = {},
            } = req.body;

            const { id } = req.user;
            const admin = Users.findByPk(id);
            if (!admin && !isAdminOrSuperAdmin(admin)) {
                return serverMessage(res, "INSUFFICIENT_PERMISSIONS");
            }
            // Validate amount
            if (!amount || amount <= 0) {
                return serverMessage(res, "INVALID_AMOUNT");
            }

            // Prepare payout parameters for instant payout
            const payoutParams = {
                amount: Math.round(amount), // Amount in cents, must be an integer
                currency: currency,
                method: "instant", // This specifies an instant payout
            };

            // Add optional parameters if provided
            if (description) payoutParams.description = description;
            if (statement_descriptor)
                payoutParams.statement_descriptor = statement_descriptor;
            if (destination) payoutParams.destination = destination;
            if (Object.keys(metadata).length > 0)
                payoutParams.metadata = metadata;

            // Create the instant payout
            const payout = await stripe.payouts.create(payoutParams);

            return serverMessage(res, "INSTANT_PAYOUT_CREATED", {
                id: payout.id,
                amount: payout.amount,
                currency: payout.currency,
                arrival_date: new Date(
                    payout.arrival_date * 1000
                ).toISOString(),
                description: payout.description,
                status: payout.status,
                method: payout.method,
                source_type: payout.source_type,
            });
        } catch (error) {
            console.error("Error creating instant payout:", error);

            // Handle specific error cases for instant payouts
            if (
                error.code === "bank_account_not_eligible_for_instant_payouts"
            ) {
                return serverMessage(res, "BANK_ACCOUNT_NOT_ELIGIBLE");
            }

            if (error.code === "insufficient_funds") {
                return serverMessage(res, "INSUFFICIENT_FUNDS");
            }

            if (error.code === "instant_payout_disabled") {
                return serverMessage(res, "INSTANT_PAYOUT_DISABLED");
            }

            const errorMessage =
                error.message || "Failed to create instant payout";
            return serverMessage(res, "INSTANT_PAYOUT_FAILED");
        }
    },

    /*********************************
     * BALANCE CONTROLLERS
     *********************************/
    // Get your available payout balance
    getAvailableBalance: async (req, res) => {
        try {
            const { id } = req.user;
            const admin = Users.findByPk(id);
            if (!admin && !isAdminOrSuperAdmin(admin)) {
                return serverMessage(res, "INSUFFICIENT_PERMISSIONS");
            }
            const balance = await stripe.balance.retrieve();

            // Format the available balances by currency
            const availableBalances = balance.available.map((bal) => ({
                currency: bal.currency,
                amount: bal.amount / 100, //Convert the amount to a centime value
                source_types: bal.source_types,
            }));

            // Format the pending balances by currency
            const pendingBalances = balance.pending.map((bal) => ({
                currency: bal.currency,
                amount: bal.amount / 100, //Convert the amount to a centime value
                source_types: bal.source_types,
            }));

            return serverMessage(res, "BALANCE_RETRIEVED", {
                available: availableBalances,
                pending: pendingBalances,
                connect_reserved: balance.connect_reserved || [],
                instant_available: balance.instant_available || [],
            });
        } catch (error) {
            console.error("Error retrieving balance:", error);
            const errorMessage = error.message || "Failed to retrieve balance";
            return serverMessage(res, "BALANCE_RETRIEVAL_FAILED");
        }
    },
};
