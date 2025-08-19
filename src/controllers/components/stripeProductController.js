const Stripe = require("stripe");
const { v4: uuidv4 } = require("uuid");
const {
    isAdminOrSuperAdmin,
    ProductHelper,
} = require("../../utils");
const { Users, Plans } = require("../../models");

// Initialiser Stripe avec ta clé secrète
const STRIPE_KEY = process.env.STRIPE_KEY;

if (!STRIPE_KEY) {
    throw new Error("Stripe key is not set in environment variables.");
}
const stripe = Stripe(STRIPE_KEY);

const handleStripeError = (res, error, defaultMessage) => {
    console.error(error);
    const message = error.message || defaultMessage;
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: true, message });
}

module.exports = {
    createProduct: async (req, res) => {
        try {
            const {
                name,
                description,
                is_free = false,
                credit_allocated = 0,
                features = [],
                price_monthly,
                annual_discount = 0.2,
                activate_annual_plan = true,
                currency = "eur",
            } = req.body;

            if (annual_discount < 0 || annual_discount >= 1) {
                return res.status(400).json({ error: true, message: "Invalid discount value" });
            }

            if (!name || !description) {
                return res.status(400).json({ error: true, message: "Missing required fields" });
            }

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

            await stripe.products.update(product.id, {
                default_price: monthlyPriceObj.id,
            });

            const updatedProduct = await stripe.products.retrieve(product.id, {
                expand: ["default_price"],
            });

            const prices = await stripe.prices.list({
                product: product.id,
                active: true,
                expand: ["data.product"],
            });

            const dbProduct = await ProductHelper.syncProductWithDatabase(
                updatedProduct,
                prices.data
            );

            return res.status(201).json({ error: false, message: "Product created successfully", data: ProductHelper.formatProductResponse(updatedProduct, prices.data) });
        } catch (error) {
            return handleStripeError(res, error, "Product creation failed");
        }
    },

    getProducts: async (req, res) => {
        try {
            const {
                active_only = "true",
                limit = 100,
                starting_after,
            } = req.query;

            const result = await ProductHelper.getAllProducts({
                active_only: active_only === "true",
                limit: parseInt(limit),
                starting_after,
            });

            if (result.data.length === 0) {
                return res.status(404).json({ error: true, message: "Products not found" });
            }

            return res.status(200).json({
                error: false,
                message: "Products retrieved",
                data: {
                    count: result.data.length,
                    products: result.data,
                    pagination: {
                        has_more: result.has_more,
                        next_starting_after: result.next_starting_after,
                    },
                }
            });
        } catch (error) {
            return handleStripeError(res, error, "Products retrieval failed");
        }
    },

    getProductById: async (req, res) => {
        try {
            const { id: productId } = req.params;

            if (!productId) {
                return res.status(400).json({ error: true, message: "Product ID required" });
            }

            const product = await ProductHelper.getProduct(productId);

            if (!product) {
                return res.status(404).json({ error: true, message: "Product not found" });
            }

            return res.status(200).json({ error: false, message: "Product retrieved", data: product });
        } catch (error) {
            return handleStripeError(res, error, "Product retrieval failed");
        }
    },

    updateProduct: async (req, res) => {
        try {
            const { id: productId } = req.params;
            const {
                name,
                description,
                credit_allocated = 0,
                features = [],
                price_monthly,
                annual_discount = 0.2,
                activate_annual_plan = true,
                currency = "eur",
                default_price_interval
            } = req.body;

            if (!productId || !price_monthly) {
                return res.status(400).json({ error: true, message: "Missing required fields" });
            }

            const product = await stripe.products.retrieve(productId);

            if (!product) {
                return res.status(404).json({ error: true, message: "Product not found" });
            }

            const metadata = {
                credit_allocated: String(credit_allocated),
                features: Array.isArray(features)
                    ? JSON.stringify(features)
                    : "[]",
                annual_discount: String(annual_discount),
                activate_annual_plan: String(activate_annual_plan),
            };

            const updateParams = {
                metadata,
            };

            if (name) updateParams.name = name;
            if (description) updateParams.description = description;

            await stripe.products.update(productId, updateParams);

            const existingPrices = await stripe.prices.list({
                product: productId,
                active: true,
            });

            let monthlyPriceId = null;
            let yearlyPriceId = null;

            if (price_monthly) {
                const existingMonthlyPrice = existingPrices.data.find(
                    (price) =>
                        price.recurring && price.recurring.interval === "month"
                );

                if (existingMonthlyPrice) {
                    await stripe.prices.update(existingMonthlyPrice.id, {
                        active: false,
                    });
                }

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

                const existingYearlyPrice = existingPrices.data.find(
                    (price) =>
                        price.recurring && price.recurring.interval === "year"
                );

                if (existingYearlyPrice) {
                    await stripe.prices.update(existingYearlyPrice.id, {
                        active: false,
                    });
                }

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

            const updatedProduct = await stripe.products.retrieve(productId, {
                expand: ["default_price"],
            });

            const prices = await stripe.prices.list({
                product: productId,
                active: true,
                expand: ["data.product"],
            });

            const dbProduct = await ProductHelper.syncProductWithDatabase(
                updatedProduct,
                prices.data
            );

            return res.status(200).json({ error: false, message: "Product updated", data: ProductHelper.formatProductResponse(dbProduct, prices.data) });
        } catch (error) {
            return handleStripeError(res, error, "Price update failed");
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const { id: userId } = req.user;
            const { id: productId } = req.params;

            if (!productId) {
                return res.status(400).json({ error: true, message: "Missing product ID" });
            }

            const admin = await Users.findByPk(userId);
            if (!admin || !isAdminOrSuperAdmin(admin)) {
                return res.status(403).json({ error: true, message: "Insufficient permissions" });
            }

            const product = await stripe.products.retrieve(productId);
            const dbProduct = await Plans.findOne({ where: { product_id: productId } });

            if (!dbProduct && !product) {
                return res.status(404).json({ error: true, message: "Product not found" });
            }

            const prices = await stripe.prices.list({ product: productId, limit: 100 });

            await stripe.products.update(productId, { default_price: null });

            const archivePromises = prices.data.map((price) =>
                stripe.prices.update(price.id, { active: false })
            );
            await Promise.all(archivePromises);

            let productDeleted = false;
            try {
                await stripe.products.del(productId);
                productDeleted = true;
            } catch (error) {
                await stripe.products.update(productId, { active: false });
                productDeleted = false;
            }

            if (dbProduct) {
                await Plans.destroy({ where: { product_id: productId } });
            }

            return res.status(200).json({ error: false, message: "Product deleted" });
        } catch (error) {
            return handleStripeError(res, error, "Product deletion failed");
        }
    },

    createCheckoutSession: async (req, res) => {
        try {
            const { price_id } = req.params;
            const { quantity = 1, customer_email, metadata = {} } = req.body;

            if (!price_id) {
                return res.status(400).json({ error: true, message: "Missing price ID" });
            }

            const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price: price_id,
                        quantity: quantity,
                    },
                ],
                mode: "subscription",
                success_url: `${baseUrl}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/stripe/cancel?session_id={CHECKOUT_SESSION_ID}`,
                customer_email: customer_email,
                metadata: {
                    ...metadata,
                    created_by: "api",
                    created_at: new Date().toISOString(),
                },
            });

            return res.status(201).json({ error: false, message: "Checkout session created", data: { sessionId: session.id, url: session.url } });
        } catch (error) {
            return handleStripeError(res, error, "Failed to create checkout session");
        }
    },

    getCheckoutSessionDetails: async (req, res) => {
        try {
            const { session_id } = req.params;

            if (!session_id) {
                return res.status(400).json({ error: true, message: "Missing session ID" });
            }

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

            return res.status(200).json({ error: false, message: "Session details retrieved", data: formattedData });
        } catch (error) {
            return handleStripeError(res, error, "Failed to retrieve session details");
        }
    },

    createSubscription: async (req, res) => {
        try {
            const {
                price_id,
                customer_email,
                quantity = 1,
                metadata = {},
            } = req.body;

            if (!price_id) {
                return res.status(400).json({ error: true, message: "Missing price ID" });
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

            return res.status(201).json({ error: false, message: "Subscription checkout created", data: { sessionId: session.id, url: session.url } });
        } catch (error) {
            return handleStripeError(res, error, "Subscription creation error");
        }
    },

    getSubscriptionTransactions: async (req, res) => {
        try {
            const { subscription_id } = req.params;

            if (!subscription_id) {
                return res.status(400).json({ error: true, message: "Missing subscription ID" });
            }

            const subscription = await stripe.subscriptions.retrieve(
                subscription_id
            );

            const invoices = await stripe.invoices.list({
                subscription: subscription_id,
                limit: 100,
            });

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

            return res.status(200).json({ error: false, message: "Subscription transactions retrieved", data: formattedData });
        } catch (error) {
            return handleStripeError(res, error, "Failed to retrieve subscription transactions");
        }
    },

    listCustomerSubscriptions: async (req, res) => {
        try {
            const { customer_id } = req.params;
            const { limit = 10, status = "all" } = req.query;

            if (!customer_id) {
                return res.status(400).json({ error: true, message: "Missing customer ID" });
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

            return res.status(200).json({ error: false, message: "Subscriptions retrieved", data: { subscriptions: formattedSubscriptions, has_more: subscriptions.has_more, total_count: subscriptions.data.length } });
        } catch (error) {
            return handleStripeError(res, error, "List subscriptions error");
        }
    },

    updateSubscription: async (req, res) => {
        try {
            const { subscription_id } = req.params;
            const {
                price_id,
                quantity,
                proration_behavior = "create_prorations",
            } = req.body;

            if (!subscription_id) {
                return res.status(400).json({ error: true, message: "Missing subscription ID" });
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

            return res.status(200).json({ error: false, message: "Subscription updated", data: updatedSubscription });
        } catch (error) {
            return handleStripeError(res, error, "Subscription update error");
        }
    },

    cancelSubscription: async (req, res) => {
        try {
            const { subscription_id } = req.params;
            const { cancel_immediately = false } = req.body;

            if (!subscription_id) {
                return res.status(400).json({ error: true, message: "Missing subscription ID" });
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

            const message = cancel_immediately ? "Subscription cancelled immediately" : "Subscription cancelled at period end";
            return res.status(200).json({ error: false, message, data: subscription });
        } catch (error) {
            return handleStripeError(res, error, "Subscription cancel error");
        }
    },

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

            if (!amount || amount <= 0) {
                return res.status(400).json({ error: true, message: "Invalid amount" });
            }

            const payoutParams = {
                amount: Math.round(amount),
                currency: currency,
            };

            if (description) payoutParams.description = description;
            if (statement_descriptor)
                payoutParams.statement_descriptor = statement_descriptor;
            if (destination) payoutParams.destination = destination;
            if (Object.keys(metadata).length > 0)
                payoutParams.metadata = metadata;

            const payout = await stripe.payouts.create(payoutParams);

            return res.status(201).json({ error: false, message: "Payout created", data: payout });
        } catch (error) {
            return handleStripeError(res, error, "Payout creation failed");
        }
    },

    getPayoutDetails: async (req, res) => {
        try {
            const { payout_id } = req.params;

            if (!payout_id) {
                return res.status(400).json({ error: true, message: "Missing payout ID" });
            }

            const payout = await stripe.payouts.retrieve(payout_id);

            return res.status(200).json({ error: false, message: "Payout details retrieved", data: payout });
        } catch (error) {
            return handleStripeError(res, error, "Failed to retrieve payout details");
        }
    },

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

            if (starting_after) params.starting_after = starting_after;
            if (ending_before) params.ending_before = ending_before;

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

            if (status) params.status = status;

            const payouts = await stripe.payouts.list(params);

            return res.status(200).json({ error: false, message: "Payouts retrieved", data: payouts });
        } catch (error) {
            return handleStripeError(res, error, "Failed to list payouts");
        }
    },

    cancelPayout: async (req, res) => {
        try {
            const { payout_id } = req.params;

            if (!payout_id) {
                return res.status(400).json({ error: true, message: "Missing payout ID" });
            }

            const payout = await stripe.payouts.cancel(payout_id);

            return res.status(200).json({ error: false, message: "Payout cancelled", data: payout });
        } catch (error) {
            if (error.code === "payout_cancel_not_allowed") {
                return res.status(400).json({ error: true, message: "This payout cannot be cancelled. Only pending payouts can be cancelled." });
            }
            return handleStripeError(res, error, "Failed to cancel payout");
        }
    },

    updatePayoutMetadata: async (req, res) => {
        try {
            const { payout_id } = req.params;
            const { metadata } = req.body;

            if (!payout_id) {
                return res.status(400).json({ error: true, message: "Missing payout ID" });
            }

            if (!metadata || Object.keys(metadata).length === 0) {
                return res.status(400).json({ error: true, message: "Missing metadata" });
            }

            const payout = await stripe.payouts.update(payout_id, { metadata });

            return res.status(200).json({ error: false, message: "Payout updated", data: payout });
        } catch (error) {
            return handleStripeError(res, error, "Failed to update payout metadata");
        }
    },

    getPayoutTransactions: async (req, res) => {
        try {
            const { payout_id } = req.params;
            const { id } = req.user;
            const admin = Users.findByPk(id);
            if (!admin && !isAdminOrSuperAdmin(admin)) {
                return res.status(403).json({ error: true, message: "Insufficient permissions" });
            }

            if (!payout_id) {
                return res.status(400).json({ error: true, message: "Missing payout ID" });
            }

            const balanceTransactions = await stripe.balanceTransactions.list({
                payout: payout_id,
                limit: 100,
                expand: ["data.source"],
            });

            return res.status(200).json({ error: false, message: "Payout transactions retrieved", data: balanceTransactions });
        } catch (error) {
            return handleStripeError(res, error, "Failed to retrieve payout transactions");
        }
    },

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
                return res.status(403).json({ error: true, message: "Insufficient permissions" });
            }

            if (!amount || amount <= 0) {
                return res.status(400).json({ error: true, message: "Invalid amount" });
            }

            const payoutParams = {
                amount: Math.round(amount),
                currency: currency,
                method: "instant",
            };

            if (description) payoutParams.description = description;
            if (statement_descriptor)
                payoutParams.statement_descriptor = statement_descriptor;
            if (destination) payoutParams.destination = destination;
            if (Object.keys(metadata).length > 0)
                payoutParams.metadata = metadata;

            const payout = await stripe.payouts.create(payoutParams);

            return res.status(201).json({ error: false, message: "Instant payout created", data: payout });
        } catch (error) {
            if (error.code === "bank_account_not_eligible_for_instant_payouts") {
                return res.status(400).json({ error: true, message: "Bank account not eligible for instant payouts" });
            }

            if (error.code === "insufficient_funds") {
                return res.status(400).json({ error: true, message: "Insufficient funds" });
            }

            if (error.code === "instant_payout_disabled") {
                return res.status(400).json({ error: true, message: "Instant payout disabled" });
            }

            return handleStripeError(res, error, "Failed to create instant payout");
        }
    },

    getAvailableBalance: async (req, res) => {
        try {
            const { id } = req.user;
            const admin = Users.findByPk(id);
            if (!admin && !isAdminOrSuperAdmin(admin)) {
                return res.status(403).json({ error: true, message: "Insufficient permissions" });
            }
            const balance = await stripe.balance.retrieve();

            const availableBalances = balance.available.map((bal) => ({
                currency: bal.currency,
                amount: bal.amount / 100,
                source_types: bal.source_types,
            }));

            const pendingBalances = balance.pending.map((bal) => ({
                currency: bal.currency,
                amount: bal.amount / 100,
                source_types: bal.source_types,
            }));

            return res.status(200).json({ error: false, message: "Balance retrieved", data: { available: availableBalances, pending: pendingBalances, connect_reserved: balance.connect_reserved || [], instant_available: balance.instant_available || [] } });
        } catch (error) {
            return handleStripeError(res, error, "Failed to retrieve balance");
        }
    },
};